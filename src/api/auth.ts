import axios from 'axios';
import {AuthResponseDto} from '../types/auth';

const chatBase = axios.create({
    baseURL: import.meta.env.VITE_AUTH_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

export function loginRequest(login: string, password: string) {
    return chatBase.post<AuthResponseDto>('/login', {
        login,
        password,
    });
}

export function registrationRequest(login: string, username: string, password: string) {
    return chatBase.post<AuthResponseDto>('/registration', {
        login,
        username,
        password,
    });
}

export function logoutRequest() {
    return chatBase.post<AuthResponseDto>('/logout', {});
}
