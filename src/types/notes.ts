import * as A from '@automerge/automerge';
import {AnyDocumentId} from '@automerge/automerge-repo';

export interface Note {
    id: string;
    automergeUrl: AnyDocumentId;
    title: string;
    dirId: number; // int value
}

export interface NoteDto {
    id: string;
    automerge_url: AnyDocumentId;
    title: string;
    dir_id: number; // int value
}

export interface NoteDoc {
    text: A.Text;
}

export const Role = ['обычный', 'пират', 'гопник'];

export const CallsType = ['Zoom', 'GoogleMeets', 'Microsoft Teams'];
export const CallsDetail = ['Краткая', 'Средняя', 'Развёрнутая'];
