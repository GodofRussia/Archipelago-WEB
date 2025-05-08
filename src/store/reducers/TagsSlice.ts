import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Tag} from '../../types/tags';
import {loadActiveTag, removeActiveTag, saveOrUpdateActiveTag} from '../../utils/local_storage';

interface TagsState {
    activeTag: Tag | undefined;
}

const initialState: TagsState = {
    activeTag: loadActiveTag(),
};

export const tagsSlice = createSlice({
    name: 'tags',
    initialState: initialState,
    reducers: {
        setActiveTag(store, action: PayloadAction<Tag>) {
            store.activeTag = action.payload;
            saveOrUpdateActiveTag(action.payload);
        },
        deleteActiveTag(store) {
            store.activeTag = undefined;
            removeActiveTag();
        },
    },
});

export const {setActiveTag, deleteActiveTag} = tagsSlice.actions;

export default tagsSlice.reducer;
