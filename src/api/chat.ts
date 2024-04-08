import axios from 'axios';

const chatBase = axios.create({
    baseURL: 'http://185.241.194.125:8000',
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

export function getChatSum(id: number) {
    return chatBase.post<ResponseChatGetSum>('/get-chat-summarize', {
        token_note: id,
        token: serviceToken,
    });
}
