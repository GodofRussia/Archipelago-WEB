import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Dir, DirTree, FullDirTreeWithNotes} from '../../types/dirs';
import {Note} from '../../types/notes';
import {loadCollapsedDirIds} from '../../utils/localStorage';

interface DirsState {
    activeDir: Dir | undefined;
    activeNote: Note | undefined;
    dirTree: FullDirTreeWithNotes | undefined;
    collapsedDirIds: number[];
}

const initialState: DirsState = {
    activeDir: undefined,
    activeNote: undefined,
    dirTree: undefined,
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

export const dirsSlice = createSlice({
    name: 'user',
    initialState: initialState,
    reducers: {
        setDirTree(store, action: PayloadAction<FullDirTreeWithNotes>) {
            store.dirTree = action.payload;
        },
        mergeDirTreeWithNotes(store, action: PayloadAction<{dirTree: DirTree; notes: Note[]}>) {
            store.dirTree = recursiveDFSWithNotes(action.payload.dirTree, action.payload.notes);
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
            }
        },
        removeCollapsedDirId(store, action: PayloadAction<number | undefined>) {
            store.collapsedDirIds.filter((id) => id !== action.payload);
        },
    },
});

export const {setDirTree, setActiveDir, setActiveNote, mergeDirTreeWithNotes, removeCollapsedDirId, addCollapsedDirId} =
    dirsSlice.actions;

export default dirsSlice.reducer;
