import {createApi, fetchBaseQuery, FetchBaseQueryError} from '@reduxjs/toolkit/query/react';
import {Tag, TagDto, TagWithLinkName, TagWithLinkNameDto} from '../types/tags';
import {convertFromNoteDto, convertFromTagsDto, convertFromTagWithLinkNameDto} from '../utils/convert';
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

interface UpdateTagsLinkNameRequest {
    tag1_id: string;
    tag2_id: string;
    link_name: string;
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
    endpoints: (build) => {
        return {
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
            listLinkedTags: build.query<TagWithLinkName[], {userId: string; tagId: string}>({
                query: ({tagId, userId}) => ({
                    url: `/tags/${tagId}/linked`,
                    headers: {'X-User-Id': userId},
                }),
                transformResponse: (tags: TagWithLinkNameDto[]) => {
                    return tags.map((tag) => convertFromTagWithLinkNameDto(tag));
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
                invalidatesTags: (_, __, arg) => [{type: 'NoteTagsList', id: arg.noteId}],
            }),

            // Ручки для связи 2 тегов
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
            updateTagLinkName: build.mutation<Tag, UpdateTagsLinkNameRequest & {userId: string}>({
                query: ({userId, ...requestData}) => ({
                    url: `/tags/update-tags-link-name`,
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

            // Ручки для связи тега и заметки
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
                async queryFn(arg, _api, _extraOptions, baseQuery) {
                    const timeout = 5000;
                    const maxAttempts = 3;
                    let attempt = 0;
                    let lastError: FetchBaseQueryError | undefined = undefined;

                    while (attempt < maxAttempts) {
                        attempt++;

                        try {
                            const controller = new AbortController();
                            const timeoutId = setTimeout(() => controller.abort(), timeout);

                            try {
                                const result = await baseQuery({
                                    url: `/tags/suggest`,
                                    body: arg,
                                    method: 'POST',
                                    headers: {'X-User-Id': arg.userId},
                                    signal: controller.signal,
                                });

                                // Запрос завершился до истечения таймаута
                                clearTimeout(timeoutId);

                                if (
                                    result.data &&
                                    typeof result.data === 'object' &&
                                    'tags' in result.data &&
                                    Array.isArray(result.data.tags)
                                ) {
                                    return {data: {tagNames: result.data.tags}};
                                }

                                if (result.error) {
                                    lastError = result.error;
                                    // Если это не ошибка таймаута, попробуем еще раз
                                    console.log(`Attempt ${attempt} failed with error:`, result.error);
                                    continue;
                                }
                            } catch (fetchError) {
                                clearTimeout(timeoutId);
                                throw fetchError; // Передаем ошибку внешнему обработчику
                            }
                        } catch (error) {
                            // Обработка ошибок от запроса
                            if (error instanceof Error && error.name === 'AbortError') {
                                lastError = {
                                    status: 'CUSTOM_ERROR',
                                    data: `Request timed out after ${timeout}ms`,
                                    error: 'Timeout',
                                };
                                console.log(`Attempt ${attempt} timed out after ${timeout}ms`);
                            } else if (typeof error === 'object' && error !== null && 'status' in error) {
                                // Ошибка API
                                lastError = error as FetchBaseQueryError;
                                console.log(`Attempt ${attempt} failed with API error:`, error);
                            } else {
                                // Неизвестная ошибка
                                lastError = {
                                    status: 'CUSTOM_ERROR',
                                    error: String(error),
                                    data: 'Unknown error occurred',
                                };
                                console.log(`Attempt ${attempt} failed with unknown error:`, error);
                            }
                        }

                        // Небольшая пауза перед следующей попыткой, если это не последняя попытка
                        if (attempt < maxAttempts) {
                            await new Promise((resolve) => setTimeout(resolve, 300));
                        }
                    }

                    // Все попытки исчерпаны
                    return {
                        error: lastError ?? {
                            status: 'CUSTOM_ERROR',
                            data: `Failed after ${maxAttempts} attempts`,
                            error: 'Exceeded maximum retries',
                        },
                    };
                },
            }),
        };
    },
});
