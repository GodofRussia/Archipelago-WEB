import axios from 'axios';
import {Dir, DirTree} from '../types/dirs';

const api = axios.create({
    baseURL: import.meta.env.VITE_NOTES_URL,
});

export function getDir(requestData: {id: string}) {
    return api.get<Dir>(`/dirs/${requestData.id}`);
}

export function getDirTree(requestData: {id: number}) {
    return api.get<DirTree>(`/dirs/${requestData.id}/tree`);
}

export function createDir(requestData: {name: string; parentDirId: number}) {
    const dir = {
        name: requestData.name,
        parent_dir_id: requestData.parentDirId,
    };
    return api.post<Dir>('/dirs', dir);
}

export function updateDir(requestData: Dir) {
    return api.post<Dir>(`/dirs/${requestData.id}`, requestData);
}

export function deleteDir(requestData: {id: string}) {
    return api.delete<Dir>(`/dirs/${requestData.id}`);
}
