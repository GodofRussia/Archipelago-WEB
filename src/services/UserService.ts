import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {User} from '../types/user';

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
        }),
        searchUsers: build.query<User[], string>({
            query: (query: string) => ({
                url: `/users`,
                params: {
                    q: query,
                },
            }),
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