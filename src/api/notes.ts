import axios from 'axios';
import { Note } from '../types/notes';

import { AutomergeUrl } from '@automerge/automerge-repo';
import { Repo } from '@automerge/automerge-repo';
import * as A from '@automerge/automerge/next';

const api = axios.create({
    baseURL: 'http://185.241.194.125:8888/api',
});

export function getNote(requestData: { id: string }) {
    return api.get<Note>(`/notes/${requestData.id}`);
}

export function listNotes() {
    return api.get<{ notes: Note[] }>('/notes');
}

export function createNote(requestData: { title: string }, repo: Repo) {
    const note: Note = {
        title: requestData.title,
        automerge_url: createAutomergeUrl(repo),
    };
    return api.post<Note>('/notes', note);
}

export function updateNote(requestData: Note) {
    return api.post<Note>(`/notes/${requestData.id}`, requestData);
}

export function deleteNote(requestData: { id: string }) {
    return api.delete<Note>(`/notes/${requestData.id}`);
}

function createAutomergeUrl(repo: Repo) {
    const nextDoc = A.from({ text: '' }); // TODO
    return repo.create(nextDoc).url;
}
