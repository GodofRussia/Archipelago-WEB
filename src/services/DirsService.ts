import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {Dir, DirTree} from '../types/dirs';

export const dirsApi = createApi({
    reducerPath: 'dirs-queries',
    baseQuery: fetchBaseQuery({baseUrl: import.meta.env.VITE_NOTES_URL}),
    tagTypes: ['Dirs', 'DirsTree'],
    endpoints: (build) => ({
        getDir: build.query<Dir, {userId: string; dirId: number}>({
            query: ({userId, dirId}) => ({
                url: `/dirs/${dirId}`,
                headers: {'X-User-Id': userId},
            }),
        }),
        getDirTree: build.query<DirTree, {userId: string; dirId: number}>({
            query: ({userId, dirId}) => ({
                url: `/dirs/${dirId}/tree`,
                headers: {'X-User-Id': userId},
            }),
            providesTags: () => ['DirsTree'],
        }),
        createDir: build.mutation<Dir, {parentDirId?: number; name: string; userId: string}>({
            query: ({parentDirId, name, userId}) => ({
                url: `/dirs`,
                body: {parent_dir_id: parentDirId, name},
                method: 'POST',
                headers: {'X-User-Id': userId},
            }),
            invalidatesTags: () => ['Dirs', 'DirsTree'],
        }),
        updateDir: build.mutation<Dir, {dir: Dir; userId: string}>({
            query: ({dir, userId}) => ({
                url: `/dirs/${dir.id}`,
                body: dir,
                method: 'POST',
                headers: {'X-User-Id': userId},
            }),
            invalidatesTags: () => ['Dirs', 'DirsTree'],
        }),
        deleteDir: build.mutation<Dir, {dir: Dir; userId: string}>({
            query: ({dir, userId}) => ({
                url: `/dirs/${dir.id}`,
                body: dir,
                method: 'DELETE',
                headers: {'X-User-Id': userId},
            }),
            invalidatesTags: () => ['Dirs', 'DirsTree'],
        }),
    }),
});
