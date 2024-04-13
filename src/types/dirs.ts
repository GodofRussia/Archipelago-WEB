import {Note, NoteDto} from './notes';

export interface DirTree {
    id: number;
    name: string;
    children: DirTree[];
    notes: Note[];
}

export interface DirTreeDto {
    id: number;
    name: string;
    children: DirTreeDto[];
    notes: NoteDto[];
}

export interface Dir {
    id: number;
    name: string;
    subpath: string;
}
