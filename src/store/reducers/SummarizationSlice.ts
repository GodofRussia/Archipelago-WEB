import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface ChatInfo {
    chatId: string;
    chatName: string;
}

interface SumState {
    chatSum?: string;
    chatInfo?: ChatInfo;
    expandedSumIds: string[];
    expandedDefault: boolean;
}

const initialState: SumState = {expandedSumIds: [], expandedDefault: false};

export const sumSlice = createSlice({
    name: 'sum',
    initialState: initialState,
    reducers: {
        setChatSum(store, action: PayloadAction<{chatSum: string}>) {
            store.chatSum = action.payload.chatSum;
        },
        setChatInfo(store, action: PayloadAction<{chatInfo: ChatInfo}>) {
            store.chatInfo = action.payload.chatInfo;
        },
        addExpandedSumId(store, action: PayloadAction<string | undefined>) {
            if (action.payload) {
                store.expandedSumIds.push(action.payload);
            }
        },
        removeExpandedSumId(store, action: PayloadAction<string | undefined>) {
            store.expandedSumIds = store.expandedSumIds.filter((id) => id !== action.payload);
        },
        setExpandedDefault(store, action: PayloadAction<boolean | undefined>) {
            store.expandedDefault = !!action.payload;
        },
    },
});

export const {setChatSum, setChatInfo, removeExpandedSumId, addExpandedSumId, setExpandedDefault} = sumSlice.actions;

export default sumSlice.reducer;
