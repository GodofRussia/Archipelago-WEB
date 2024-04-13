import axios from 'axios';
import {Note, NoteDoc, NoteDto} from '../types/notes';
import {Repo} from '@automerge/automerge-repo';
import {from} from '@automerge/automerge/next';
import {convertFromNoteDto} from '../utils/convert';

function createAutomergeUrl(repo: Repo) {
    const nextDoc = from({text: ''}); // TODO
    const handle = repo.create<NoteDoc>(nextDoc);

    return handle.url;
}

const api = axios.create({
    baseURL: `${import.meta.env.VITE_NOTES_URL}/api`,
});

export function getNote(requestData: {id: string}) {
    return api.get<NoteDto>(`/notes/${requestData.id}`).then((response) => convertFromNoteDto(response.data));
}

export function listNotes() {
    return api.get<{notes: NoteDto[]}>('/notes').then((response) => {
        response.data.notes.map((note) => convertFromNoteDto(note));
    });
}

export function createNote(requestData: {title: string; dirId: number}, repo: Repo) {
    const note = {
        title: requestData.title,
        dir_id: requestData.dirId,
        automerge_url: createAutomergeUrl(repo),
    };
    return api.post<NoteDto>('/notes', note).then((response) => convertFromNoteDto(response.data));
}

export function updateNote(requestData: Note) {
    return api
        .post<NoteDto>(`/notes/${requestData.id}`, requestData)
        .then((response) => convertFromNoteDto(response.data));
}

export function deleteNote(requestData: {id: string}) {
    return api.delete<NoteDto>(`/notes/${requestData.id}`).then((response) => convertFromNoteDto(response.data));
}
