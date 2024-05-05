import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {Note, NoteDto} from '../types/notes';
import {convertFromAccessToDto, convertFromNoteDto, convertFromNoteToNoteDto} from '../utils/convert';
import {Access} from '../types/access';

interface CreateNoteRequest {
    title: string;
    dirId: number;
    userId: string;
    automergeUrl: string;
}

interface SetAccessRequest {
    noteID: string;
    userID: string;
    access: Access;
}

interface SummaryListReponseDto {
    non_active_summary_ids: string[];
    active_summary_ids: string[];
}

export interface SummaryListResponse {
    nonActiveSummaryIds: string[];
    activeSummaryIds: string[];
}

interface CheckOwnerResponseDto {
    is_owner: boolean;
}

export const notesApi = createApi({
    reducerPath: 'notes-queries',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_NOTES_URL,
    }),
    tagTypes: ['Notes', 'SummaryList'],
    endpoints: (build) => ({
        getNote: build.query<Note, {noteId: string; userId: string}>({
            query: ({noteId, userId}) => ({
                url: `/notes/${noteId}`,
                headers: {'X-User-Id': userId},
            }),
            transformResponse: (response: NoteDto) => convertFromNoteDto(response),
        }),
        listNotes: build.query<Note[], {userId: string}>({
            query: ({userId}) => ({
                url: '/notes',
                headers: {'X-User-Id': userId},
            }),
            transformResponse: (response: {notes: NoteDto[]}) => {
                return response.notes.map((note) => convertFromNoteDto(note));
            },
            providesTags: () => ['Notes'],
        }),
        listSummaries: build.query<SummaryListResponse, {userId: string; noteId: string}>({
            query: ({noteId, userId}) => ({
                url: `/notes/${noteId}/summary_list`,
                headers: {'X-User-Id': userId},
            }),
            transformResponse: (response: SummaryListReponseDto): SummaryListResponse => ({
                nonActiveSummaryIds: response.non_active_summary_ids,
                activeSummaryIds: response.active_summary_ids,
            }),
            providesTags: () => ['SummaryList'],
        }),
        checkOwner: build.query<boolean, {userId: string; noteId: string}>({
            query: ({noteId, userId}) => ({
                url: `/notes/${noteId}/is_owner/${userId}`,
                headers: {'X-User-Id': userId},
            }),
            transformResponse: (response: CheckOwnerResponseDto): boolean => response.is_owner,
        }),
        createNote: build.mutation<Note, CreateNoteRequest>({
            query: (requestData) => ({
                url: `/notes`,
                body: {
                    title: requestData.title,
                    dir_id: requestData.dirId,
                    automerge_url: requestData.automergeUrl,
                },
                method: 'POST',
                headers: {'X-User-Id': requestData.userId},
            }),
            transformResponse: (response: NoteDto) => {
                console.log(response);
                return convertFromNoteDto(response);
            },
            invalidatesTags: ['Notes'],
        }),
        updateNote: build.mutation<Note, {note: Note; userId: string}>({
            query: (requestData) => ({
                url: `/notes/${requestData.note.id}`,
                body: {
                    ...convertFromNoteToNoteDto(requestData.note),
                },
                method: 'POST',
                headers: {'X-User-Id': requestData.userId},
            }),
            transformResponse: (response: NoteDto) => {
                return convertFromNoteDto(response);
            },
        }),
        deleteNote: build.mutation<Note, {note: Note; userId: string}>({
            query: (requestData) => ({
                url: `/notes/${requestData.note.id}`,
                body: {
                    ...convertFromNoteToNoteDto(requestData.note),
                },
                method: 'DELETE',
                headers: {'X-User-Id': requestData.userId},
            }),
            transformResponse: (response: NoteDto) => {
                return convertFromNoteDto(response);
            },
            invalidatesTags: ['Notes'],
        }),
        setAccess: build.mutation<string, SetAccessRequest>({
            query: (requestData) => ({
                url: `/notes/${requestData.noteID}/access/${requestData.userID}`,
                body: {
                    ...requestData,
                    access: convertFromAccessToDto(requestData.access),
                },
                method: 'POST',
                headers: {'X-User-Id': requestData.userID},
            }),
        }),
        attachSummary: build.mutation<string, {summId: string; noteId: string; userId: string}>({
            query: ({summId, noteId, userId}) => ({
                url: `/notes/${noteId}/attach_summ/${summId}`,
                method: 'POST',
                headers: {'X-User-Id': userId},
            }),
            invalidatesTags: ['SummaryList'],
        }),
        detachSummary: build.mutation<string, {summId: string; noteId: string; userId: string}>({
            query: ({summId, noteId, userId}) => ({
                url: `/notes/${noteId}/detach_summ/${summId}`,
                method: 'POST',
                headers: {'X-User-Id': userId},
            }),
            invalidatesTags: ['SummaryList'],
        }),
    }),
});
