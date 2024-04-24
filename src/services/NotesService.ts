import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {Note, NoteDoc, NoteDto} from '../types/notes';
import {convertFromAccessToDto, convertFromNoteDto, convertFromNoteToNoteDto} from '../utils/convert';
import {Repo} from '@automerge/automerge-repo';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import {from} from '@automerge/automerge/next';
import * as A from '@automerge/automerge';
import {Access} from '../types/access';

interface CreateNoteRequest {
    title: string;
    dirId: number;
    userId: string;
    repo: Repo;
}

interface SetAccessRequest {
    noteID: string;
    userID: string;
    access: Access;
}

function createAutomergeUrl(repo: Repo) {
    const nextDoc = from({text: new A.Text()});
    const handle = repo.create<NoteDoc>(nextDoc);

    console.log(handle);
    return handle.url;
}

export const notesApi = createApi({
    reducerPath: 'notes-queries',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_NOTES_URL,
    }),
    tagTypes: ['Notes'],
    endpoints: (build) => ({
        getNote: build.query<Note, {noteId: number; userId: string}>({
            query: ({noteId, userId}) => ({
                url: `/notes/${noteId}`,
                headers: {'X-User-Id': userId},
            }),
            transformResponse: (response: {data: NoteDto}) => convertFromNoteDto(response.data),
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
        createNote: build.mutation<Note, CreateNoteRequest>({
            query: (requestData) => ({
                url: `/notes`,
                body: {
                    title: requestData.title,
                    dir_id: requestData.dirId,
                    automerge_url: createAutomergeUrl(requestData.repo),
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
    }),
});
