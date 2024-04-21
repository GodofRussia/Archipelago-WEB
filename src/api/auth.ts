import axios from 'axios';

const chatBase = axios.create({
    baseURL: import.meta.env.VITE_AUTH_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

interface ResponseUser {
    user_id: string;
    user_data: Array<Array<string>>;
}

export function loginRequest(login: string, password: string) {
    return chatBase.post<ResponseUser>('/login', {
        login,
        password,
    });
}

export function registrationRequest(login: string, username: string, password: string) {
    return chatBase.post<ResponseUser>('/regisrtation', {
        login,
        username,
        password,
    });
}

export function logoutRequest() {
    return chatBase.post<ResponseUser>('/logout', {});
}
