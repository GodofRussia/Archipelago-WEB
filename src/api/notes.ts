import axios from 'axios';
import {Note} from '../types/notes';

const api = axios.create({
    baseURL: 'http://185.241.194.125:8888/api',
});

export function getNote(requestData: {id: string}) {
    return api.get<Note>(`/notes/${requestData.id}`);
}

export function listNotes() {
    return api.get<{notes: Note[]}>('/notes');
}

export function createNote(requestData: {title: string}) {
    return api.post<Note>('/notes', requestData);
}

export function updateNote(requestData: Note) {
    return api.post<Note>(`/notes/${requestData.id}`, requestData);
}

export function deleteNote(requestData: {id: string}) {
    return api.delete<Note>(`/notes/${requestData.id}`);
}
