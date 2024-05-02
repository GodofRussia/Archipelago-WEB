import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';

interface ProduceJoinCallRequest {
    url: string;
    user_id: string;
    detalization: string | null;
}

interface GetCallSummarizationRequest {
    user_id: string;
    role?: string;
}

interface CallStateResponse {
    state: string;
}

interface GetCallSummarizationResponse {
    has_sum: boolean;
    summ_text?: string;
}

export const callAPI = createApi({
    reducerPath: 'call',
    baseQuery: fetchBaseQuery({baseUrl: import.meta.env.VITE_ZOOM_URL}),
    tagTypes: ['Call'],
    endpoints: (build) => ({
        getSummarization: build.query<GetCallSummarizationResponse, GetCallSummarizationRequest>({
            query: ({user_id, role}) => ({
                url: `/get_sum`,
                method: 'POST',
                body: {
                    user_id,
                    role,
                    token: import.meta.env.VITE_SERVICE_TOKEN,
                },
            }),
        }),
        getCallState: build.query<CallStateResponse, {user_id: string}>({
            query: ({user_id}) => ({
                url: `/bot_state`,
                method: 'POST',
                body: {
                    user_id,
                    token: import.meta.env.VITE_SERVICE_TOKEN,
                },
            }),
        }),
        startCallRecording: build.mutation<void, ProduceJoinCallRequest>({
            query: ({url, user_id, detalization}) => ({
                url: `/start_recording`,
                method: 'POST',
                body: {
                    url,
                    user_id,
                    token: import.meta.env.VITE_SERVICE_TOKEN,
                    agree_detail: detalization || undefined,
                },
            }),
        }),
        stopCallRecording: build.mutation<void, {user_id: string}>({
            query: ({user_id}) => ({
                url: `/stop_recording`,
                method: 'POST',
                body: {
                    user_id,
                    token: import.meta.env.VITE_SERVICE_TOKEN,
                },
            }),
        }),
    }),
});
