import {
    Accordion,
    AccordionActions,
    AccordionDetails,
    AccordionSummary,
    Autocomplete,
    Box,
    CircularProgress,
    IconButton,
    Skeleton,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {Role, RoleEnum} from '../types/notes';
import {SummaryWithState} from '../types/summary';
import {notesApi} from '../services/NotesService';
import {callAPI} from '../services/CallService';
import {useAppDispatch, useAppSelector} from '../hooks/useRedux';
import {
    headingsPlugin,
    listsPlugin,
    markdownShortcutPlugin,
    MDXEditor,
    MDXEditorMethods,
    quotePlugin,
    tablePlugin,
    thematicBreakPlugin,
} from '@mdxeditor/editor';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import React from 'react';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {addExpandedSumId, removeExpandedSumId} from '../store/reducers/SummarizationSlice';
import {formatDateToMinute} from '../utils/date';
import {AccessEnum} from '../types/access';
import {FetchBaseQueryError} from '@reduxjs/toolkit/query';
import {SerializedError} from '@reduxjs/toolkit';
import {useSnackbar} from 'notistack';

export interface CallSummaryProps {
    key: string;
    summary: SummaryWithState;
    noteId: string;
    setRole: (sumId: string, newRole: RoleEnum) => void;
}

export function CallSummary({summary, setRole, noteId}: CallSummaryProps) {
    const {user} = useAppSelector((store) => store.userReducer);
    const {expandedSumIds} = useAppSelector((state) => state.sumReducer);
    const {activeNote} = useAppSelector((state) => state.notesReducer);
    const dispatch = useAppDispatch();

    const [detachSummary, {isLoading: isDetachingSummary}] = notesApi.useDetachSummaryMutation();
    const [stopCall, {isLoading: isStoppingCall}] = callAPI.useStopCallRecordingMutation();
    const {data: isNoteOwner} = notesApi.useCheckNoteOwnerQuery(
        {
            userId: user?.id || '',
            noteId,
        },
        {skip: !user},
    );

    const ref = React.useRef<MDXEditorMethods>(null);

    const {enqueueSnackbar} = useSnackbar();
    const handleDetachSumm = () => {
        detachSummary({userId: user?.id || '', noteId: noteId || '', summId: summary.id}).then((data) => {
            if ((data as {error: FetchBaseQueryError | SerializedError}).error) {
                enqueueSnackbar('Не удалось отвязать звонок', {variant: 'error'});
            } else {
                enqueueSnackbar('Звонок успешно отвязан', {variant: 'success'});
            }
        });
    };

    const handleStopSumm = () => {
        stopCall({summ_id: summary.id}).then((data) => {
            if ((data as {error: FetchBaseQueryError | SerializedError}).error) {
                enqueueSnackbar('Не удалось закончить запись звонка', {variant: 'error'});
            } else {
                enqueueSnackbar('Запись звонка остановлена', {variant: 'success'});
            }
        });
    };

    const onExpandedStateChanged = (_: React.SyntheticEvent, expanded: boolean) => {
        if (expanded) {
            dispatch(addExpandedSumId(summary.id));
        } else {
            dispatch(removeExpandedSumId(summary.id));
        }
    };

    React.useEffect(() => {
        ref.current?.setMarkdown(summary.text);
    }, [summary.text]);

    return (
        <Accordion
            key={summary.id}
            sx={{p: 2}}
            defaultExpanded={expandedSumIds.includes(summary.id)}
            onChange={onExpandedStateChanged}
        >
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1-content" id="panel1-header">
                {summary.platform} {formatDateToMinute(summary.date)}
            </AccordionSummary>

            <AccordionDetails>
                {summary.text === '' ? (
                    summary.isActive ? (
                        <Box sx={{display: 'flex'}}>
                            <Skeleton width={200} height={40} />
                        </Box>
                    ) : (
                        <div>Звонок слишком рано прервался</div>
                    )
                ) : (
                    <>
                        <Typography variant={'body1'}>
                            Детализация: {summary.detalization.toLowerCase()}, роль: {summary.role}
                        </Typography>
                        <MDXEditor
                            ref={ref}
                            className="dark-theme dark-editor"
                            placeholder="Суммаризация звонка"
                            markdown={summary.text}
                            readOnly
                            plugins={[
                                headingsPlugin(),
                                listsPlugin(),
                                quotePlugin(),
                                tablePlugin(),
                                thematicBreakPlugin(),
                                markdownShortcutPlugin(),
                            ]}
                        />
                    </>
                )}
            </AccordionDetails>

            <AccordionActions sx={{gap: 2}}>
                <Autocomplete
                    defaultValue={'обычный'}
                    options={Role}
                    value={summary.role}
                    onChange={(_, newValue) => {
                        setRole(summary.id, (newValue as RoleEnum) || RoleEnum.DEFAULT);
                    }}
                    disabled={!activeNote?.allowedMethods.includes(AccessEnum.attach_summary)}
                    sx={{minWidth: 200}}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Стиль суммаризации"
                            InputProps={{...params.InputProps, readOnly: true}}
                            size="small"
                        />
                    )}
                    clearIcon={<></>}
                />

                <>
                    {isDetachingSummary ? (
                        <CircularProgress size={24} />
                    ) : (
                        <Tooltip title={'Отвязать суммаризацию от заметки'}>
                            <IconButton
                                disabled={!isNoteOwner}
                                sx={{display: !isNoteOwner ? 'none' : 'flex'}}
                                onClick={handleDetachSumm}
                            >
                                <DeleteOutlineIcon fontSize={'medium'} color={'error'} />
                            </IconButton>
                        </Tooltip>
                    )}
                </>

                {summary.isActive && (
                    <>
                        {isStoppingCall ? (
                            <CircularProgress size={24} />
                        ) : (
                            <Tooltip title={'Закончить суммаризацию'}>
                                <IconButton
                                    onClick={handleStopSumm}
                                    disabled={!summary.isActive || !isNoteOwner}
                                    sx={{display: !summary.isActive || !isNoteOwner ? 'none' : 'flex'}}
                                >
                                    <StopCircleIcon fontSize={'medium'} color={'error'} />
                                </IconButton>
                            </Tooltip>
                        )}
                    </>
                )}
            </AccordionActions>
        </Accordion>
    );
}
