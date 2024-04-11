import * as A from '@automerge/automerge';

export interface Note {
    id: string;
    title: string;
    automerge_url: string;
}

export interface NoteDoc {
    text: A.Text;
}

export const Role = ['обычный', 'пират', 'гопник'];
