import axios from 'axios';
import {Note} from '../types/notes';
import {Repo} from '@automerge/automerge-repo';
import {from} from '@automerge/automerge/next';

function createAutomergeUrl(repo: Repo) {
    const nextDoc = from({text: ''}); // TODO
    return repo.create(nextDoc).url;
}

const api = axios.create({
    baseURL: `${import.meta.env.VITE_NOTES_URL}/api`,
});

export function getNote(requestData: {id: string}) {
    return api.get<Note>(`/notes/${requestData.id}`);
}

export function listNotes() {
    return api.get<{notes: Note[]}>('/notes');
}

export function createNote(requestData: {title: string}, repo: Repo) {
    const note = {
        title: requestData.title,
        automerge_url: createAutomergeUrl(repo),
    };
    return api.post<Note>('/notes', note);
}

export function updateNote(requestData: Note) {
    return api.post<Note>(`/notes/${requestData.id}`, requestData);
}

export function deleteNote(requestData: {id: string}) {
    return api.delete<Note>(`/notes/${requestData.id}`);
}
