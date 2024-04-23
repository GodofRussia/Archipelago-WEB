import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query';
import {convertFromAuthDto} from '../utils/convert';
import {AuthResponse, AuthResponseDto} from '../types/auth';

interface LoginRequest {
    login: string;
    password: string;
}

interface RegistrationRequest {
    email: string;
    username: string;
    password: string;
}

export const authApi = createApi({
    reducerPath: 'auth-queries',
    baseQuery: fetchBaseQuery({baseUrl: import.meta.env.VITE_AUTH_URL, credentials: 'include'}),
    endpoints: (build) => ({
        login: build.mutation<AuthResponse, LoginRequest>({
            query: ({password, login}) => ({
                url: '/login',
                method: 'POST',
                body: {login, password},
            }),
            transformResponse: (response: {data: AuthResponseDto}) => convertFromAuthDto(response.data),
        }),
        registration: build.mutation<AuthResponse, RegistrationRequest>({
            query: ({password, username, email}) => ({
                url: '/regisrtation',
                method: 'POST',
                body: {username, email, password},
            }),
            transformResponse: (response: {data: AuthResponseDto}) => convertFromAuthDto(response.data),
        }),
    }),
});
