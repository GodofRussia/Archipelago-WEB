import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query';
import {User} from '../types/user';

export const userApi = createApi({
    reducerPath: 'user-queries',
    baseQuery: fetchBaseQuery({baseUrl: import.meta.env.VITE_NOTES_URL}),
    tagTypes: ['User', 'SearchedUsers'],
    endpoints: (build) => ({
        getUser: build.query<User, number>({
            query: (userId: number) => ({
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
