import {combineReducers} from 'redux';
import {configureStore} from '@reduxjs/toolkit';

import userReducer from './reducers/UserSlice';
import dirsReducer from './reducers/DirsSlice';
import {userAPI} from '../services/UserService';
import {authApi} from '../services/AuthService';
import {notesApi} from '../services/NotesService';
import {dirsApi} from '../services/DirsService';
import {setupListeners} from '@reduxjs/toolkit/query';

const rootReducer = combineReducers({
    userReducer,
    dirsReducer,
    [userAPI.reducerPath]: userAPI.reducer,
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
                userAPI.middleware,
                notesApi.middleware,
                dirsApi.middleware,
            ),
        devTools: true,
    });
};

export const store = setupStore();
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof rootReducer>;
export type AppState = ReturnType<typeof setupStore>;
export type AppDispatch = AppState['dispatch'];
