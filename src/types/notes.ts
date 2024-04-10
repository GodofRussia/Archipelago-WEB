export interface Note {
    id: string;
    title: string;
    automerge_url: string;
}

export interface NoteDoc {
    text: string;
}

export const Role = ['обычный', 'пират', 'гопник'];
