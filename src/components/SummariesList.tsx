import React from 'react';
import {notesApi} from '../services/NotesService';
import {callAPI} from '../services/CallService';
import {useAppDispatch, useAppSelector} from '../hooks/useRedux';
import {RoleEnum} from '../types/notes';
import {SummaryInfoData} from '../types/summary';
import {Paper, Skeleton, Stack, Typography} from '@mui/material';
import {CallSummary} from './CallSummary';
import ChatSummary from './ChatSummary';
import {chatAPI} from '../services/ChatService';
import {setChatInfo, setChatSum} from '../store/reducers/SummarizationSlice';
import {AccessEnum} from '../types/access';

const SummariesList = ({noteId}: {noteId: string}) => {
    const {user} = useAppSelector((store) => store.userReducer);
    const {activeNote} = useAppSelector((store) => store.notesReducer);
    const dispatch = useAppDispatch();

    const {
        data: summaryList,
        isLoading: isLoadingSummaryList,
        isError: isErrorSummaryList,
    } = notesApi.useListSummariesQuery(
        {
            noteId: noteId || '',
            userId: user?.id || '',
        },
        {
            skip: !user || !activeNote?.allowedMethods.includes(AccessEnum.get_summary_list),
            pollingInterval: 8000,
        },
    );

    const [summarizeIdsWithRoles, setSummarizeIdsWithRoles] = React.useState<SummaryInfoData[]>([]);
    const [interval, setInterval] = React.useState<number>(20000);

    const {
        data: callSummaries,
        isLoading: isLoadingCallSummaries,
        isError: isErrorCallSummaries,
    } = callAPI.useBatchGetSummarizationQuery(
        {summarizations: summarizeIdsWithRoles.map(({sumId, role}) => ({summ_id: sumId, role}))},
        {
            pollingInterval: interval,
            skip: !user || isErrorSummaryList,
        },
    );

    const {data: chatInfo, isLoading: isLoadingChatInfo} = chatAPI.useGetSummarizationExistsInfoQuery(
        {id: noteId},
        {pollingInterval: 20000},
    );

    const [getChatSum, {data: chatSumData, isError: isErrorChatSum, isLoading: isLoadingChatSum}] =
        chatAPI.useGetSummarizationMutation();

    const onGetSum = React.useCallback(() => getChatSum({id: noteId}), [getChatSum, noteId]);

    React.useEffect(() => {
        if (
            !summaryList?.activeSummaryIds.length &&
            !summaryList?.nonActiveSummaryIds.length &&
            callSummaries?.length
        ) {
            setInterval(0);
        } else {
            setInterval(20000);
        }
    }, [callSummaries?.length, summaryList]);

    React.useEffect(() => {
        setSummarizeIdsWithRoles([]);
    }, [noteId, isErrorSummaryList]);

    const setRole = React.useCallback((sumId: string, role: RoleEnum) => {
        setSummarizeIdsWithRoles((prevSumWithRoles) =>
            prevSumWithRoles.map(({sumId: prevSumId, role: prevRole}) => ({
                sumId,
                role: prevSumId === sumId ? role : prevRole,
            })),
        );
    }, []);

    React.useEffect(() => {
        if (summaryList?.activeSummaryIds.length || summaryList?.nonActiveSummaryIds.length) {
            setSummarizeIdsWithRoles((prevSumWithRoles) => [
                ...summaryList.activeSummaryIds.map((sumId) => ({
                    sumId,
                    role: prevSumWithRoles.find(({sumId: prevSumId}) => prevSumId === sumId)?.role || '',
                })),
                ...summaryList.nonActiveSummaryIds.map((sumId) => ({
                    sumId,
                    role: prevSumWithRoles.find(({sumId: prevSumId}) => prevSumId === sumId)?.role || '',
                })),
            ]);
        }
    }, [summaryList]);

    React.useEffect(() => {
        if (chatInfo) {
            dispatch(setChatInfo({chatInfo}));
        }
    }, [chatInfo, dispatch]);

    React.useEffect(() => {
        if (chatSumData?.summ_text) {
            dispatch(setChatSum({chatSum: chatSumData.summ_text}));
        }
    }, [chatSumData?.summ_text, dispatch]);

    React.useEffect(() => {
        if (chatInfo) getChatSum({id: noteId});
    }, [chatInfo, getChatSum, noteId]);

    return activeNote?.allowedMethods.includes(AccessEnum.get_summary_list) ? (
        <>
            {(isErrorCallSummaries || isErrorSummaryList || isErrorChatSum) && (
                <Paper sx={{py: 2}}>
                    <Typography variant={'body1'} sx={{px: 2}}>
                        Ошибка получения суммаризаций для заметки. Попробуйте позже.
                    </Typography>
                </Paper>
            )}

            {!isLoadingSummaryList &&
                (!summaryList || (!summaryList.activeSummaryIds.length && !summaryList.nonActiveSummaryIds.length)) &&
                !(isErrorCallSummaries || isErrorSummaryList || isErrorChatSum) && (
                    <Paper sx={{py: 2}}>
                        <Typography variant={'body1'} sx={{px: 2}}>
                            Нет суммаризаций звонка. Для привязки звонка нажмите на кнопку выше.
                        </Typography>
                    </Paper>
                )}

            {!isLoadingChatSum && !chatInfo && !isErrorChatSum && (
                <Paper sx={{py: 2}}>
                    <Typography variant={'body1'} sx={{px: 2}}>
                        Нет суммаризаций чата. Для привязки звонка нажмите на кнопку выше.
                    </Typography>
                </Paper>
            )}

            {isLoadingSummaryList || isLoadingCallSummaries || isLoadingChatSum || isLoadingChatInfo ? (
                <Skeleton variant="rounded" height={80} width={'100%'} />
            ) : (
                <Stack>
                    {callSummaries?.map((summary) => (
                        <CallSummary noteId={noteId} key={summary.id} summary={summary} setRole={setRole} />
                    )) || null}
                    {chatInfo && <ChatSummary noteId={noteId} onGetSum={onGetSum} isLoadingSum={isLoadingChatSum} />}
                </Stack>
            )}
        </>
    ) : null;
};

export default SummariesList;
