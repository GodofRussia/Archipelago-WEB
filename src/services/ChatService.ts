import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {ChatInfo} from '../store/reducers/SummarizationSlice';

interface ChatGetSumResponse {
    summ_text: string;
}

type ChatGetCheckSummarizationExistsResponse =
    | 'string'
    | {
          chat_id: string;
          chat_name: string;
      };

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
            providesTags: ['ChatInfo'],
            transformResponse: (response: ChatGetCheckSummarizationExistsResponse) => {
                if (typeof response === 'string') {
                    return {chatId: null, chatName: ''};
                }

                return {chatId: response.chat_id, chatName: response.chat_name};
            },
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
            // TODO:
            // providesTags: ['Sum'],
            // видимо с мутационных запросов удалили providesTags, так как получаем по ручке суммаризацию и рефрешим,
            // то сломает логику вызовов, инвалидирующие это поле.
            // На самом деле могли сделать GET на суммаризацию и отдельно инвалидировать по redux API на нажатии по рефрешу
            // Если так можно, то стоит сменить логику на GET ручку (на край впилить инвалидационную ручку на POST)
        }),
        detachNoteFromChat: build.mutation<void, {id: string}>({
            query: ({id}) => ({
                url: `/delete-notes-link`,
                method: 'DELETE',
                body: {
                    token_note: id,
                    token: import.meta.env.VITE_SERVICE_TOKEN,
                },
            }),
            invalidatesTags: ['ChatInfo', 'Sum'],
        }),
    }),
});
