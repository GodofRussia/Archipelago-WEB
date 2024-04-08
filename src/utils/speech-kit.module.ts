import axios from 'axios';

interface SPKitApiResponse {
    result: string;
}

interface SummarizeApiResponse {
    summ_text: string;
}

interface SummarizeApiResponse {
    summ_text_array: string[];
}

// "https://stt.api.cloud.yandex.net/speech/v1/stt:recognize?topic=general"
// "http://185.241.194.125:8080/get-summarize"
export class AudioSummarizer {
    private text: string;
    private summarized: string;
    private summarized_points: string[];

    private speechKitUrl: string;
    private summarizeUrl: string;

    private apiKey: string;

    constructor(speechKitUrl: string, apiKey: string, summarizeUrl: string) {
        this.speechKitUrl = speechKitUrl;
        this.apiKey = apiKey;
        this.summarizeUrl = summarizeUrl;

        this.text = '';
        this.summarized = '';
        this.summarized_points = [];
    }

    public async convertAudio(audioData: FormData): Promise<void> {
        const axiosInstance = axios.create({
            baseURL: 'http://localhost:5001/speechkit', // Your base URL
            headers: {
                Authorization: `Api-Key ${this.apiKey}`,
                'Access-Control-Allow-Origin': '*',
            },
        });

        try {
            const response = await axiosInstance
                .post<SPKitApiResponse>('/', audioData, {
                    headers: {
                        Authorization: `Api-Key ${this.apiKey}`,
                        // 'Content-Type': 'audio/ogg',
                        'Access-Control-Allow-Origin': '*',
                    },
                })
                .then((resp) => {
                    if (!resp.data.result) {
                        console.error('Error sending audio data:', resp);
                        throw new Error(`HTTP error! status: ${resp}`);
                    }

                    const recognized_text = resp.data.result;

                    console.log('Recognized: ', recognized_text);

                    this.text = `${this.text}\t${recognized_text}`;
                });
        } catch (error) {
            console.error('Error sending audio data:', error);
            throw new Error(`Fialed to save audio`);
        }
    }

    public async summarize(): Promise<string> {
        try {
            const response = await fetch('http://localhost:5001/sum', {
                method: 'POST',
                body: JSON.stringify({
                    text: this.text,
                    token: 'skoro_v_scolku_123',
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                console.error('Error summarizing:', response);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: SummarizeApiResponse = await response.json();
            const summarized = data.summ_text;

            console.log(summarized);

            this.summarized = summarized;

            return summarized;
        } catch (error) {
            console.error('Error summarizing:', error);
            throw new Error(`Failed to save audio`);
        }
    }

    public async mindmap(): Promise<string> {
        try {
            const response = await fetch('http://185.241.194.125:8080/get-mindmap', {
                method: 'POST',
                body: JSON.stringify({
                    text: this.text,
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                console.error('Error summarizing:', response);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: SummarizeApiResponse = await response.json();
            const summarized = data.summ_text;

            this.summarized = summarized;

            return summarized;
        } catch (error) {
            console.error('Error summarizing:', error);
            throw new Error(`Failed to save audio`);
        }
    }

    public getFull(): string {
        return this.text;
    }

    public getSummarized(): string {
        return this.summarized;
    }

    public getMindmap(): string[] {
        return this.summarized_points;
    }
}
