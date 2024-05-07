import {combineReducers} from 'redux';
import {configureStore} from '@reduxjs/toolkit';

import userReducer from './reducers/UserSlice';
import dirsReducer from './reducers/DirsSlice';
import notesReducer from './reducers/NotesSlice';
import sumReducer from './reducers/SummarizationSlice';
import {userAPI} from '../services/UserService';
import {authApi} from '../services/AuthService';
import {notesApi} from '../services/NotesService';
import {dirsApi} from '../services/DirsService';
import {setupListeners} from '@reduxjs/toolkit/query';
import {callAPI} from '../services/CallService';
import {chatAPI} from '../services/ChatService';

const rootReducer = combineReducers({
    userReducer,
    dirsReducer,
    notesReducer,
    sumReducer,
    [userAPI.reducerPath]: userAPI.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [notesApi.reducerPath]: notesApi.reducer,
    [dirsApi.reducerPath]: dirsApi.reducer,
    [callAPI.reducerPath]: callAPI.reducer,
    [chatAPI.reducerPath]: chatAPI.reducer,
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
                chatAPI.middleware,
                callAPI.middleware,
            ),
        devTools: true,
    });
};

export const store = setupStore();
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof rootReducer>;
export type AppState = ReturnType<typeof setupStore>;
export type AppDispatch = AppState['dispatch'];
