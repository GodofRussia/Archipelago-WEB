import {Note} from './notes';

export interface DirTree {
    id: number;
    name: string;
    children: DirTree[];
}

export interface FullDirTreeWithNotes {
    id: number;
    name: string;
    children: FullDirTreeWithNotes[];
    notes: Note[];
}

export interface Dir {
    id: number;
    name: string;
    subpath: string;
}
