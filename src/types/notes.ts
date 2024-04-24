import * as A from '@automerge/automerge';
import {AutomergeUrl} from '@automerge/automerge-repo';

export interface Note {
    id: string;
    automergeUrl: AutomergeUrl;
    title: string;
    dirId: number; // int value
}

export interface NoteDto {
    id: string;
    automerge_url: AutomergeUrl;
    title: string;
    dir_id: number; // int value
}

export interface NoteDoc {
    text: string;
}

export const Role = ['обычный', 'пират', 'гопник'];

export const CallsType = ['Zoom', 'GoogleMeets', 'Microsoft Teams'];
export const CallsDetail = ['Краткая', 'Средняя', 'Развёрнутая'];
