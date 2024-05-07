import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {ChatInfo} from '../store/reducers/SummarizationSlice';

interface ChatGetSumResponse {
    summ_text: string;
}

interface ChatGetCheckSummarizationExistsResponse {
    chat_id: string;
    chat_name: string;
}

export const chatAPI = createApi({
    reducerPath: 'chat',
    baseQuery: fetchBaseQuery({baseUrl: import.meta.env.VITE_CHAT_URL}),
    tagTypes: ['ChatInfo', 'Sum'],
    endpoints: (build) => ({
        getSummarizationExistsInfo: build.query<ChatInfo, {id: string}>({
            query: ({id}) => ({
                url: `/exist-notes-link`,
                method: 'POST',
                body: {
                    token: import.meta.env.VITE_SERVICE_TOKEN,
                    token_note: id,
                },
            }),
            transformResponse: (response: ChatGetCheckSummarizationExistsResponse) => {
                return {chatId: response.chat_id, chatName: response.chat_name};
            },
            providesTags: ['ChatInfo'],
        }),
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
        detachNoteFromChat: build.mutation<void, {id: string}>({
            query: ({id}) => ({
                url: `/delete-notes-link`,
                method: 'POST',
                body: {
                    token_note: id,
                    token: import.meta.env.VITE_SERVICE_TOKEN,
                },
            }),
            invalidatesTags: ['ChatInfo'],
        }),
    }),
});
