import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {convertFromAuthDto} from '../utils/convert';
import {AuthResponse, AuthResponseDto} from '../types/auth';

interface LoginRequest {
    email: string;
    password: string;
}

interface RegistrationRequest {
    email: string;
    name: string;
    password: string;
}

export const authApi = createApi({
    reducerPath: 'auth-queries',
    baseQuery: fetchBaseQuery({baseUrl: import.meta.env.VITE_AUTH_URL, credentials: 'include'}),
    endpoints: (build) => ({
        login: build.mutation<AuthResponse, LoginRequest>({
            query: ({password, email}) => ({
                url: '/login',
                method: 'POST',
                body: {email, password},
            }),
            transformResponse: (response: {data: AuthResponseDto}) => convertFromAuthDto(response.data),
        }),
        registration: build.mutation<AuthResponse, RegistrationRequest>({
            query: ({password, name, email}) => ({
                url: '/registration',
                method: 'POST',
                body: {name, email, password},
            }),
            transformResponse: (response: {data: AuthResponseDto}) => convertFromAuthDto(response.data),
        }),
    }),
});
