import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {Summary} from '../types/summary';

interface ProduceJoinCallRequest {
    url: string;
    detalization: string | null;
}

interface GetCallSummarizationRequest {
    summ_id: string;
    role?: string;
}

interface CallStateResponse {
    state: string;
}

export interface GetCallSummarizationResponseDto {
    has_sum: boolean;
    summ_text?: string;
    platform?: string;
    date?: string;
    is_active?: boolean;
    role?: string;
    detalization?: string;
}

interface GetCallSummarizationResponse {
    hasSum: boolean;
    summText: string;
    platform: string;
    date: string;
    isActive: boolean;
    role: string;
    detalization: string;
}

export const callAPI = createApi({
    reducerPath: 'call',
    baseQuery: fetchBaseQuery({baseUrl: import.meta.env.VITE_ZOOM_URL}),
    tagTypes: ['Call'],
    endpoints: (build) => ({
        getSummarization: build.query<Summary, GetCallSummarizationRequest>({
            query: ({summ_id, role}) => ({
                url: `/get_sum`,
                method: 'POST',
                body: {
                    summ_id,
                    role,
                    token: import.meta.env.VITE_SERVICE_TOKEN,
                },
            }),
            transformResponse: (response: GetCallSummarizationResponseDto) => {
                return {
                    platform: response.platform || '',
                    date: response.date || '',
                    isActive: response.is_active || false,
                    text: response.has_sum ? response.summ_text || '' : '',
                    role: response.role || '',
                    detalization: response.detalization || '',
                };
            },
        }),
        getCallState: build.query<CallStateResponse, {summ_id: string}>({
            query: ({summ_id}) => ({
                url: `/bot_state`,
                method: 'POST',
                body: {
                    summ_id,
                    token: import.meta.env.VITE_SERVICE_TOKEN,
                },
            }),
        }),
        startCallRecording: build.mutation<string, ProduceJoinCallRequest>({
            query: ({url, detalization}) => ({
                url: `/start_recording`,
                method: 'POST',
                body: {
                    url,
                    token: import.meta.env.VITE_SERVICE_TOKEN,
                    summary_detail: detalization || undefined,
                },
            }),
            transformResponse: (response: {summ_id: string}) => response.summ_id,
        }),
        stopCallRecording: build.mutation<void, {summ_id: string}>({
            query: ({summ_id}) => ({
                url: `/stop_recording`,
                method: 'POST',
                body: {
                    summ_id,
                    token: import.meta.env.VITE_SERVICE_TOKEN,
                },
            }),
        }),
    }),
});
