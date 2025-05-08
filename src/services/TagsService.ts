import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {Tag, TagDto} from '../types/tags';
import {convertFromNoteDto, convertFromTagsDto} from '../utils/convert';
import {Note, NoteDto} from '../types/notes';

interface CreateTagRequest {
    note_id: string;
    name: string;
}

interface DeleteTagRequest {
    tag_id: string;
}

interface UpdateTagRequest {
    tag_id: string;
    name: string;
}

interface Link2TagsRequest {
    tag1_id: string;
    tag2_id: string;
}

interface Unlink2TagsRequest {
    tag1_id: string;
    tag2_id: string;
}

interface UnlinkTagFromNoteRequest {
    note_id: string;
    tag_id: string;
}

interface ClosestTagsRequest {
    limit: number;
    name: string;
}

interface SuggestTagNamesRequest {
    tags_num: number;
    text: string;
}

export const tagsApi = createApi({
    reducerPath: 'tags-queries',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_NOTES_URL,
    }),
    tagTypes: ['NoteTagsList', 'LinkedTagsList', 'TagNotesList'],
    endpoints: (build) => ({
        // Ручки получения тэгов
        listTags: build.query<Tag[], {userId: string; noteId: string}>({
            query: ({userId, noteId}) => ({
                url: `/tags/note/${noteId}`,
                headers: {'X-User-Id': userId},
            }),
            transformResponse: (tags: TagDto[]) => {
                return tags.map((tag) => convertFromTagsDto(tag));
            },
            providesTags: (_, __, arg) => [{type: 'NoteTagsList', id: arg.noteId}],
        }),
        listLinkedTags: build.query<Tag[], {userId: string; tagId: string}>({
            query: ({tagId, userId}) => ({
                url: `/tags/${tagId}/linked`,
                headers: {'X-User-Id': userId},
            }),
            transformResponse: (tags: TagDto[]) => {
                return tags.map((tag) => convertFromTagsDto(tag));
            },
            providesTags: (_, __, arg) => [{type: 'LinkedTagsList', id: arg.tagId}],
        }),
        listTagNotes: build.query<Note[], {userId: string; tagId: string}>({
            query: ({tagId, userId}) => ({
                url: `/tags/${tagId}/notes`,
                headers: {'X-User-Id': userId},
            }),
            transformResponse: (notes: NoteDto[]) => {
                return notes.map((note) => convertFromNoteDto(note));
            },
            providesTags: (_, __, arg) => [{type: 'TagNotesList', id: arg.tagId}],
        }),

        // Модификейт ручки для тега
        createAndLinkTag: build.mutation<Tag, CreateTagRequest & {userId: string}>({
            query: ({userId, ...requestData}) => ({
                url: `/tags/create`,
                body: requestData,
                method: 'POST',
                headers: {'X-User-Id': userId},
            }),
            transformResponse: (response: TagDto) => {
                return convertFromTagsDto(response);
            },
            invalidatesTags: (tag, __, arg) => [
                {type: 'NoteTagsList', id: arg.note_id},
                {
                    type: 'TagNotesList',
                    id: tag?.id || '',
                },
            ],
        }),
        updateTag: build.mutation<Tag, UpdateTagRequest & {userId: string; noteId: string}>({
            query: ({userId, ...requestData}) => ({
                url: `/tags/update`,
                body: requestData,
                method: 'PUT',
                headers: {'X-User-Id': userId},
            }),
            transformResponse: (response: TagDto) => {
                return convertFromTagsDto(response);
            },
            invalidatesTags: (_, __, arg) => [
                {type: 'NoteTagsList', id: arg.noteId},
                // TODO: Тут на самом деле нужно научиться во всех тэгах, где эта связь покажется,
                //  обноаить имя, проверить, что на других имя сменится (в случае чего на край делать рефретч)
                {type: 'LinkedTagsList', id: arg.tag_id},
            ],
        }),
        deleteTag: build.mutation<Tag, DeleteTagRequest & {userId: string; noteId: string}>({
            query: ({userId, ...requestData}) => ({
                url: `/tags/delete`,
                body: requestData,
                method: 'POST',
                headers: {'X-User-Id': userId},
            }),
            transformResponse: (response: TagDto) => {
                return convertFromTagsDto(response);
            },
            invalidatesTags: (_, __, arg) => [
                // TODO: пофиксить, не инвалидируется у заметки после выполнения delete
                {type: 'NoteTagsList', id: arg.noteId},

                // TODO: Сейм с тем, что выше
                {type: 'LinkedTagsList', id: arg.tag_id},
            ],
        }),

        // Ручки для связи
        link2Tags: build.mutation<Tag, Link2TagsRequest & {userId: string}>({
            query: ({userId, ...requestData}) => ({
                url: `/tags/link`,
                body: requestData,
                method: 'POST',
                headers: {'X-User-Id': userId},
            }),
            invalidatesTags: (_, __, arg) => [
                {type: 'LinkedTagsList', id: arg.tag1_id},
                {
                    type: 'LinkedTagsList',
                    id: arg.tag2_id,
                },
            ],
        }),
        unlink2Tags: build.mutation<Tag, Unlink2TagsRequest & {userId: string}>({
            query: ({userId, ...requestData}) => ({
                url: `/tags/unlink-tags`,
                body: requestData,
                method: 'POST',
                headers: {'X-User-Id': userId},
            }),
            invalidatesTags: (_, __, arg) => [
                {type: 'LinkedTagsList', id: arg.tag1_id},
                {
                    type: 'LinkedTagsList',
                    id: arg.tag2_id,
                },
            ],
        }),

        linkTagToNote: build.mutation<Tag, {userId: string; tagId: string; noteId: string}>({
            query: ({userId, tagId, noteId}) => ({
                url: `/tags/${tagId}/link/${noteId}`,
                method: 'POST',
                headers: {'X-User-Id': userId},
            }),
            invalidatesTags: (_, __, arg) => [
                {type: 'NoteTagsList', id: arg.noteId},
                {
                    type: 'TagNotesList',
                    id: arg.tagId,
                },
            ],
        }),
        unlinkTagFromNote: build.mutation<Tag, UnlinkTagFromNoteRequest & {userId: string}>({
            query: ({userId, ...requestData}) => ({
                url: `/tags/unlink`,
                body: requestData,
                method: 'POST',
                headers: {'X-User-Id': userId},
            }),
            invalidatesTags: (_, __, arg) => [
                {type: 'NoteTagsList', id: arg.note_id},
                {
                    type: 'TagNotesList',
                    id: arg.tag_id,
                },
            ],
        }),

        // Поиск и саджесты
        closestTags: build.mutation<Tag[], ClosestTagsRequest & {userId: string}>({
            query: ({userId, ...requestData}) => ({
                url: `/tags/closest`,
                body: requestData,
                method: 'POST',
                headers: {'X-User-Id': userId},
            }),
            transformResponse: (tags: TagDto[]) => {
                return tags.map((tag) => convertFromTagsDto(tag));
            },
        }),
        suggestTagNames: build.mutation<{tagNames: string[]}, SuggestTagNamesRequest & {userId: string}>({
            query: ({userId, ...requestData}) => ({
                url: `/tags/suggest`,
                body: requestData,
                method: 'POST',
                headers: {'X-User-Id': userId},
            }),
            transformResponse: (response: {tags: string[]}) => {
                return {tagNames: response.tags};
            },
        }),
    }),
});
