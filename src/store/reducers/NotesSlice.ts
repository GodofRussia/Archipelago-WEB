import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Note} from '../../types/notes';
import {TabType} from '../../components/Layout';

interface NotesState {
    activeNote: Note | undefined;
    sharedNotes: Note[];
    allNotes: Note[];
    tab: TabType;
}

const initialState: NotesState = {
    sharedNotes: [],
    allNotes: [],
    activeNote: undefined,
    tab: TabType.HOME,
};

export const notesSlice = createSlice({
    name: 'notes',
    initialState: initialState,
    reducers: {
        setNotes(store, action: PayloadAction<{notes: Note[]}>) {
            store.allNotes = action.payload.notes;
        },
        setSharedNotesByUserDirs(store, action: PayloadAction<{dirIds: number[]}>) {
            store.sharedNotes = store.allNotes.filter(({dirId}) => !action.payload.dirIds.includes(dirId));
        },
        setActiveNote(store, action: PayloadAction<Note>) {
            store.activeNote = action.payload;
        },
        setTabType(store, action: PayloadAction<{tab: TabType}>) {
            store.tab = action.payload.tab;
        },
    },
});

export const {setActiveNote, setNotes, setSharedNotesByUserDirs, setTabType} = notesSlice.actions;

export default notesSlice.reducer;
