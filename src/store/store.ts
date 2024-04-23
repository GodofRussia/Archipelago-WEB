import {combineReducers} from 'redux';
import {configureStore} from '@reduxjs/toolkit';

import userReducer from './reducers/UserSlice';
import {userApi} from '../services/UserService';
import {authApi} from '../services/AuthService';
import {notesApi} from '../services/NotesService';
import {dirsApi} from '../services/DirsService';

const rootReducer = combineReducers({
    userReducer,
    [userApi.reducerPath]: userApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [notesApi.reducerPath]: notesApi.reducer,
    [dirsApi.reducerPath]: dirsApi.reducer,
});

export const setupStore = () => {
    return configureStore({
        reducer: rootReducer,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(
                authApi.middleware,
                userApi.middleware,
                notesApi.middleware,
                dirsApi.middleware,
            ),
    });
};

export type RootState = ReturnType<typeof rootReducer>;
export type AppState = ReturnType<typeof setupStore>;
export type AppDispatch = AppState['dispatch'];
