import {User} from '../../types/user';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {loadUser, removeUser, saveUser} from '../../utils/local_storage';

interface UserState {
    user: User | undefined;
}

const initialState: UserState = {
    user: loadUser(),
};

export const userSlice = createSlice({
    name: 'user',
    initialState: initialState,
    reducers: {
        setUser(state, action: PayloadAction<User>) {
            state.user = action.payload;
            saveUser(action.payload);
        },
        logoutUser(state) {
            state.user = undefined;
            removeUser();
        },
    },
});

export const {setUser, logoutUser} = userSlice.actions;

export default userSlice.reducer;
