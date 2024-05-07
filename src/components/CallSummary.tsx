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
    diffSourcePlugin,
    markdownShortcutPlugin,
    MDXEditor,
    MDXEditorMethods,
    thematicBreakPlugin,
} from '@mdxeditor/editor';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import React from 'react';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {addExpandedSumId, removeExpandedSumId} from '../store/reducers/SummarizationSlice';
import {formatDateToMinute} from '../utils/date';

export interface CallSummaryProps {
    key: string;
    summary: SummaryWithState;
    noteId: string;
    setRole: (sumId: string, newRole: RoleEnum) => void;
}

export function CallSummary({summary, setRole, noteId}: CallSummaryProps) {
    const {user} = useAppSelector((store) => store.userReducer);
    const {expandedSumIds} = useAppSelector((state) => state.sumReducer);
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

    const handleDetachSumm = () => {
        detachSummary({userId: user?.id || '', noteId: noteId || '', summId: summary.id});
    };

    const handleStopSumm = () => {
        stopCall({summ_id: summary.id});
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
                                thematicBreakPlugin(),
                                markdownShortcutPlugin(),
                                diffSourcePlugin({viewMode: 'rich-text'}),
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
                    disabled={!isNoteOwner}
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
                        <CircularProgress />
                    ) : (
                        <Tooltip title={'Отвязать суммаризацию от заметки'}>
                            <IconButton disabled={!isNoteOwner} onClick={handleDetachSumm}>
                                <DeleteOutlineIcon fontSize={'medium'} color={'error'} />
                            </IconButton>
                        </Tooltip>
                    )}
                </>

                {summary.isActive && (
                    <>
                        {isStoppingCall ? (
                            <CircularProgress />
                        ) : (
                            <Tooltip title={'Закончить суммаризацию'}>
                                <IconButton onClick={handleStopSumm} disabled={!summary.isActive || !isNoteOwner}>
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
