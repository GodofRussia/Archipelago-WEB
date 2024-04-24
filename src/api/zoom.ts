import axios from 'axios';

const zoomBase = axios.create({
    baseURL: import.meta.env.VITE_ZOOM_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const zoomToken = 'skoro_v_scolku_123';

export const produceZoomJoin = (url: string, user_id: string, detalization: string | null) => {
    return zoomBase.post('/start_recording', {
        url,
        user_id,
        token: zoomToken,
        agree_detail: detalization || undefined,
    });
};

interface ResponseZoomState {
    state: string;
}

export const getZoomState = (user_id: string) => {
    return zoomBase.post<ResponseZoomState>('/bot_state', {
        user_id,
        token: zoomToken,
    });
};

export const produceZoomLeave = (user_id: string) => {
    return zoomBase.post('/stop_recording', {user_id, token: zoomToken});
};

// interface ResponseZoomGetSum {
//     has_sum: boolean;
//     summ_text?: string;
// }

export const getZoomSum = (user_id: string, role: string | undefined = undefined) => {
    return zoomBase.post('/get_sum', {
        user_id,
        role,
        token: zoomToken,
    });
};
