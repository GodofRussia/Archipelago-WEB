import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {User, UserDto} from '../types/user';
import {convertFromUserDto} from '../utils/convert';

export const userAPI = createApi({
    reducerPath: 'user-queries',
    baseQuery: fetchBaseQuery({baseUrl: import.meta.env.VITE_NOTES_URL}),
    tagTypes: ['User', 'SearchedUsers'],
    endpoints: (build) => ({
        getUser: build.query<User, string>({
            query: (userId: string) => ({
                url: `/users/${userId}`,
            }),
            providesTags: () => ['User'],
            transformResponse: (user: UserDto) => {
                return convertFromUserDto(user);
            },
        }),
        searchUsers: build.query<User[], string>({
            query: (query: string) => ({
                url: `/users`,
                params: {
                    q: query,
                },
            }),
            transformResponse: (response: {users: UserDto[]}) => {
                return response.users.map((user) => convertFromUserDto(user));
            },
            providesTags: () => ['SearchedUsers'],
        }),
        setUserRootDir: build.mutation<string, {userId: string; rootDirID: number}>({
            query: (requestData) => ({
                url: `/users/${requestData.userId}/root_dir/${requestData.rootDirID}`,
                method: 'POST',
                body: {userID: requestData.userId, rootDirID: requestData.rootDirID},
            }),
        }),
    }),
});
