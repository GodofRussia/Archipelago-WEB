export interface DirTree {
    id: number;
    name: string;
    children: DirTree[];
}

export interface DirTreeDto {
    id: number;
    name: string;
    children: DirTreeDto[];
}

export interface Dir {
    id: number;
    name: string;
    subpath: string;
}
