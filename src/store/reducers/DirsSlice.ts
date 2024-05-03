import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Dir, DirTree, FullDirTreeWithNotes} from '../../types/dirs';
import {Note} from '../../types/notes';
import {loadCollapsedDirIds, setCollapsedDirIds} from '../../utils/localStorage';

interface DirsState {
    activeDir: Dir | undefined;
    activeNote: Note | undefined;
    sharedNotes: Note[];
    dirTree: FullDirTreeWithNotes | undefined;
    collapsedDirIds: number[];
    dirIds: number[];
}

const initialState: DirsState = {
    activeDir: undefined,
    sharedNotes: [],
    activeNote: undefined,
    dirTree: undefined,
    dirIds: [],
    collapsedDirIds: loadCollapsedDirIds() || [],
};

function recursiveDFSWithNotes(dirTree: DirTree | undefined, notes: Note[]): FullDirTreeWithNotes | undefined {
    return (
        dirTree && {
            ...dirTree,
            notes: notes.filter(({dirId}) => dirId === dirTree.id),
            children: dirTree?.children.flatMap((subDirTree) =>
                subDirTree ? [recursiveDFSWithNotes(subDirTree, notes) as FullDirTreeWithNotes] : [],
            ),
        }
    );
}

function recursiveDFSBuildDirsArray(dirTree: DirTree | undefined): Array<number> | undefined {
    return (
        dirTree && [
            dirTree.id,
            ...(dirTree?.children.flatMap((subDirTree) =>
                subDirTree ? [...(recursiveDFSBuildDirsArray(subDirTree) as Array<number>)] : [],
            ) || []),
        ]
    );
}

export const dirsSlice = createSlice({
    name: 'user',
    initialState: initialState,
    reducers: {
        setDirTree(store, action: PayloadAction<FullDirTreeWithNotes>) {
            store.dirTree = action.payload;
        },
        mergeDirTreeWithNotes(store, action: PayloadAction<{dirTree: DirTree; notes: Note[]}>) {
            store.dirTree = recursiveDFSWithNotes(action.payload.dirTree, action.payload.notes);
            store.dirIds = recursiveDFSBuildDirsArray(store.dirTree) as number[];
            store.sharedNotes = action.payload.notes.filter(({dirId}) => !store.dirIds.includes(dirId));
        },
        setActiveDir(store, action: PayloadAction<Dir>) {
            store.activeDir = action.payload;
        },
        setActiveNote(store, action: PayloadAction<Note>) {
            store.activeNote = action.payload;
        },
        addCollapsedDirId(store, action: PayloadAction<number | undefined>) {
            if (action.payload) {
                store.collapsedDirIds.push(action.payload);
                setCollapsedDirIds(store.collapsedDirIds);
            }
        },
        removeCollapsedDirId(store, action: PayloadAction<number | undefined>) {
            store.collapsedDirIds = store.collapsedDirIds.filter((id) => id !== action.payload);
            setCollapsedDirIds(store.collapsedDirIds);
        },
        changeCollapsedStateForAllDirs(store, action: PayloadAction<boolean>) {
            if (action.payload) {
                store.collapsedDirIds = store.dirIds;
            } else {
                store.collapsedDirIds = [];
            }
            setCollapsedDirIds(store.collapsedDirIds);
        },
    },
});

export const {
    setDirTree,
    setActiveDir,
    setActiveNote,
    mergeDirTreeWithNotes,
    removeCollapsedDirId,
    addCollapsedDirId,
    changeCollapsedStateForAllDirs,
} = dirsSlice.actions;

export default dirsSlice.reducer;
