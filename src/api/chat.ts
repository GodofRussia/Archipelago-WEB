import axios from 'axios';

const chatBase = axios.create({
    baseURL: import.meta.env.VITE_CHAT_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const serviceToken = 'skoro_v_scolku_123';

// interface RequestChatGetSum {
//     token_note: number;
//     token: string;
// }

interface ResponseChatGetSum {
    summ_text: string;
}

export function getChatSum(id: string) {
    return chatBase.post<ResponseChatGetSum>('/get-chat-summarize', {
        token_note: id,
        token: serviceToken,
    });
}
