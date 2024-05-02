import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';

interface ChatGetSumResponse {
    summ_text: string;
}

export const chatAPI = createApi({
    reducerPath: 'chat',
    baseQuery: fetchBaseQuery({baseUrl: import.meta.env.VITE_CHAT_URL}),
    tagTypes: ['Chat'],
    endpoints: (build) => ({
        getSummarization: build.mutation<ChatGetSumResponse, {id: string}>({
            query: ({id}) => ({
                url: `/get-chat-summarize`,
                method: 'POST',
                body: {
                    token_note: id,
                    token: import.meta.env.VITE_SERVICE_TOKEN,
                },
            }),
        }),
    }),
});
