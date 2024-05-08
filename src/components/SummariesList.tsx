import React from 'react';
import {notesApi} from '../services/NotesService';
import {callAPI} from '../services/CallService';
import {useAppDispatch, useAppSelector} from '../hooks/useRedux';
import {RoleEnum} from '../types/notes';
import {SummaryInfoData} from '../types/summary';
import MuiAccordion, {AccordionProps} from '@mui/material/Accordion';
import {AccordionSummary, Paper, Skeleton, styled, Typography} from '@mui/material';
import {CallSummary} from './CallSummary';
import ChatSummary from './ChatSummary';
import {chatAPI} from '../services/ChatService';
import {setChatInfo, setChatSum, setExpandedDefault} from '../store/reducers/SummarizationSlice';
import {AccessEnum} from '../types/access';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MuiAccordionDetails from '@mui/material/AccordionDetails';

const CustomAccordion = styled((props: AccordionProps) => <MuiAccordion disableGutters elevation={0} {...props} />)(
    ({theme}) => ({
        border: `1px solid ${theme.palette.divider}`,
    }),
);

const CustomAccordionSummary = styled(AccordionSummary)(({theme}) => ({
    position: 'relative',
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .04)' : 'rgba(0, 0, 0, .03)',
    minHeight: 20,
    height: 20,
    padding: 0,

    '& .MuiAccordionSummary-content': {
        justifyContent: 'center',
    },
    '& .MuiButtonBase-root': {
        justifyContent: 'center',
    },
    '& .MuiAccordionSummary-expandIconWrapper': {
        position: 'absolute',
        right: '50%',
    },
}));

const CustomAccordionDetails = styled(MuiAccordionDetails)(() => ({
    padding: 0,
    borderTop: '1px solid rgba(0, 0, 0, .125)',
}));

const SummariesList = ({noteId}: {noteId: string}) => {
    const {user} = useAppSelector((store) => store.userReducer);
    const {activeNote} = useAppSelector((store) => store.notesReducer);
    const {expandedDefault, chatInfo: storedChatInfo} = useAppSelector((state) => state.sumReducer);
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

    const onExpandedStateChanged = (_: React.SyntheticEvent, expanded: boolean) => {
        dispatch(setExpandedDefault(expanded));
    };

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
        dispatch(setExpandedDefault(false));
        dispatch(setChatInfo({chatInfo: undefined}));
        dispatch(setChatSum({chatSum: undefined}));
    }, [noteId, dispatch]);

    const setRole = React.useCallback((sumId: string, role: RoleEnum) => {
        setSummarizeIdsWithRoles((prevSumWithRoles) =>
            prevSumWithRoles.map(({sumId: prevSumId, role: prevRole}) => ({
                sumId: prevSumId,
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
        dispatch(setChatInfo({chatInfo}));
    }, [chatInfo, dispatch]);

    React.useEffect(() => {
        if (chatSumData?.summ_text) {
            dispatch(setChatSum({chatSum: chatSumData.summ_text}));
        }
    }, [chatSumData?.summ_text, dispatch]);

    const [isLoadingInitial, setIsLoadingInitial] = React.useState<boolean>(true);

    const isLoading = isLoadingSummaryList || isLoadingCallSummaries || isLoadingChatSum || isLoadingChatInfo;

    React.useEffect(() => {
        if (!isLoading && isLoadingInitial) {
            setIsLoadingInitial(false);
        }
    }, [isLoading, isLoadingInitial]);

    return activeNote?.allowedMethods.includes(AccessEnum.get_summary_list) ? (
        <>
            {isLoading && isLoadingInitial ? (
                <Skeleton variant="rounded" height={22} width={'100%'} />
            ) : (
                <CustomAccordion expanded={expandedDefault} onChange={onExpandedStateChanged}>
                    <CustomAccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="list-content"
                        id="list-header"
                    />
                    <CustomAccordionDetails>
                        {(isErrorCallSummaries || isErrorSummaryList || isErrorChatSum) && (
                            <Paper square sx={{py: 2}}>
                                <Typography variant={'body1'} sx={{px: 2}}>
                                    Ошибка получения суммаризаций для заметки. Попробуйте позже.
                                </Typography>
                            </Paper>
                        )}

                        {!isLoadingChatSum &&
                            !isLoadingSummaryList &&
                            (!summaryList ||
                                (!summaryList.activeSummaryIds.length && !summaryList.nonActiveSummaryIds.length)) &&
                            !(isErrorCallSummaries || isErrorSummaryList || isErrorChatSum) &&
                            !chatInfo &&
                            !isErrorChatSum && (
                                <Paper square sx={{py: 2}}>
                                    <Typography variant={'body1'} sx={{px: 2}}>
                                        Пока что нет кратких выжимок. Чтобы получить суммаризацию вашего звонка или
                                        чата, привяжите их кнопками выше.
                                    </Typography>
                                </Paper>
                            )}

                        {callSummaries?.map((summary) => (
                            <CallSummary noteId={noteId} key={summary.id} summary={summary} setRole={setRole} />
                        )) || null}
                        {storedChatInfo && (
                            <ChatSummary noteId={noteId} onGetSum={onGetSum} isLoadingSum={isLoadingChatSum} />
                        )}
                    </CustomAccordionDetails>
                </CustomAccordion>
            )}
        </>
    ) : null;
};

export default SummariesList;
