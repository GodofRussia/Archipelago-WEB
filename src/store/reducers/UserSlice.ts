import {User} from '../../types/user';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface UserState {
    user: User | undefined;
}

const initialState: UserState = {
    user: undefined,
};

export const userSlice = createSlice({
    name: 'user',
    initialState: initialState,
    reducers: {
        setUser(store, action: PayloadAction<User>) {
            store.user = action.payload;
        },
    },
});

export default userSlice.reducer;
