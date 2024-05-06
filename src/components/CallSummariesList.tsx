import React from 'react';
import {notesApi} from '../services/NotesService';
import {callAPI} from '../services/CallService';
import {useAppSelector} from '../hooks/useRedux';
import {CallsDetailEnum} from '../types/notes';
import {SummaryInfoData} from '../types/summary';
import {Skeleton, Typography} from '@mui/material';
import {CallSummary} from './CallSummary';

const CallSummariesList = ({noteId}: {noteId: string}) => {
    const {user} = useAppSelector((store) => store.userReducer);

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
            skip: !user,
            pollingInterval: 8000,
        },
    );

    const [summarizeIdsWithRoles, setSummarizeIdsWithRoles] = React.useState<SummaryInfoData[]>([]);

    const {
        data: callSummaries,
        isLoading: isLoadingCallSummaries,
        isError: isErrorCallSummaries,
    } = callAPI.useBatchGetSummarizationQuery(
        {summarizations: summarizeIdsWithRoles.map(({sumId, role}) => ({summ_id: sumId, role}))},
        {
            pollingInterval: 20000,
            skip: !user,
        },
    );

    const setRole = React.useCallback((sumId: string, role: CallsDetailEnum) => {
        setSummarizeIdsWithRoles((prevSumWithRoles) =>
            prevSumWithRoles.map(({sumId: prevSumId, role: prevRole}) => ({
                sumId,
                role: prevSumId === sumId ? role : prevRole,
            })),
        );
    }, []);

    React.useEffect(() => {
        setSummarizeIdsWithRoles([]);
    }, [noteId]);

    React.useEffect(() => {
        if (summaryList?.activeSummaryIds.length || summaryList?.nonActiveSummaryIds.length) {
            setSummarizeIdsWithRoles((prevSumWithRoles) => [
                ...summaryList.activeSummaryIds.map((sumId) => ({
                    sumId,
                    role:
                        prevSumWithRoles.find(({sumId: prevSumId}) => prevSumId === sumId)?.role ||
                        CallsDetailEnum.AVERAGE,
                })),
                ...summaryList.nonActiveSummaryIds.map((sumId) => ({
                    sumId,
                    role:
                        prevSumWithRoles.find(({sumId: prevSumId}) => prevSumId === sumId)?.role ||
                        CallsDetailEnum.AVERAGE,
                })),
            ]);
        }
    }, [summaryList]);

    return (
        <>
            {(isErrorCallSummaries || isErrorSummaryList) && (
                <Typography variant={'body1'} sx={{px: 2}}>
                    Ошибка получения суммаризаций заметки. Попробуйте позже
                </Typography>
            )}

            {!isLoadingSummaryList &&
                (!summaryList || (!summaryList.activeSummaryIds.length && !summaryList.nonActiveSummaryIds.length)) &&
                !(isErrorCallSummaries || isErrorSummaryList) && (
                    <Typography variant={'body1'} sx={{px: 2}}>
                        Нет суммаризаций звонка. Для привязки звонка нажмите на кнопку выше
                    </Typography>
                )}

            {isLoadingSummaryList || isLoadingCallSummaries ? (
                <Skeleton width={400} height={80} />
            ) : (
                callSummaries?.map((summary) => (
                    <CallSummary noteId={noteId} key={summary.id} summary={summary} setRole={setRole} />
                )) || null
            )}
        </>
    );
};

export default CallSummariesList;
