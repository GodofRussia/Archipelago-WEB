interface SPKitApiResponse {
    result: string;
}

// "https://stt.api.cloud.yandex.net/speech/v1/stt:recognize?topic=general"
export class AudioConverter {
    private text: string;
    private summarized: string

    private speechKitUrl: string
    private apiKey: string

    constructor(speechKitUrl: string, apiKey: string) {
        this.speechKitUrl = speechKitUrl;
        this.apiKey = apiKey;
        this.text = '';
        this.summarized = '';
    }

    public async saveAudio(audioData: Blob): Promise<void> {
        try {
            const response = await fetch(this.speechKitUrl, {
                method: 'POST', // or 'PUT', depending on your API
                body: audioData, // If using FormData, use formData instead
                mode: "cors",
                headers: {
                    'Authorization': `Api-Key ${this.apiKey}`,
                    "Content-Type": 'mime'
                }
            });

            if (!response.ok) {
                console.error('Error sending audio data:', response);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: SPKitApiResponse = await response.json();
            const recognized_text = data.result;

            console.log('Recognized: ', recognized_text);

            this.text = `${this.text}\t${recognized_text}`;

        } catch (error) {
            console.error('Error sending audio data:', error);
            throw new Error(`Fialed to save audio`);
        }
    }

    public getFull(): string {
        return this.text;
    }

    public getSummarized(): string {
        return this.summarized;
    }
}