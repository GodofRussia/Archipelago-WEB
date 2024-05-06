import React from 'react';
import {
    Autocomplete,
    Box,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Collapse,
    Skeleton,
    TextField,
    Typography,
} from '@mui/material';
import IconButton, {IconButtonProps} from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {styled} from '@mui/material/styles';
import {CallsDetailEnum, Role} from '../types/notes';
import {SummaryWithState} from '../types/summary';
import {notesApi} from '../services/NotesService';
import {callAPI} from '../services/CallService';
import {useAppSelector} from '../hooks/useRedux';
import {LoadingButton} from '@mui/lab';
import {diffSourcePlugin, markdownShortcutPlugin, MDXEditor, thematicBreakPlugin} from '@mdxeditor/editor';

interface ExpandMoreProps extends IconButtonProps {
    expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
    const {...other} = props;
    return <IconButton {...other} />;
})(({theme, expand}) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
}));

export interface CallSummaryProps {
    key: string;
    summary: SummaryWithState;
    noteId: string;
    setRole: (sumId: string, newRole: CallsDetailEnum) => void;
}

export function CallSummary({summary, setRole, noteId}: CallSummaryProps) {
    const {user} = useAppSelector((store) => store.userReducer);

    const [detachSummary, {isLoading: isDetachingSummary}] = notesApi.useDetachSummaryMutation();
    const [stopCall, {isLoading: isStoppingCall}] = callAPI.useStopCallRecordingMutation();
    const {data: isNoteOwner, isLoading: checkedOwner} = notesApi.useCheckNoteOwnerQuery({
        userId: user?.id || '',
        noteId,
    });

    const [expanded, setExpanded] = React.useState(summary.isActive);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const handleDetachSumm = () => {
        detachSummary({userId: user?.id || '', noteId: noteId || '', summId: summary.id});
    };

    const handleStopSumm = () => {
        stopCall({summ_id: summary.id});
    };

    console.log(summary);

    return (
        <Card key={summary.id} sx={{p: 2}}>
            <CardHeader
                title={summary.platform}
                subheader={
                    <>
                        <div>{summary.date}</div>
                        <div>{`${summary.detalization} детализация`}</div>
                    </>
                }
                action={
                    <>
                        <Box gap={2} display="flex" alignItems={'center'} flexWrap={'wrap'}>
                            <Autocomplete
                                defaultValue={'обычный'}
                                options={Role}
                                value={summary.role}
                                onChange={(_, newValue) => {
                                    setRole(summary.id, (newValue as CallsDetailEnum) || CallsDetailEnum.AVERAGE);
                                }}
                                disabled={!summary.isActive || !isNoteOwner || !checkedOwner}
                                sx={{minWidth: 200}}
                                renderInput={(params) => (
                                    <TextField {...params} label="Стиль суммаризации" size="small" />
                                )}
                            />
                            <LoadingButton
                                loading={isDetachingSummary}
                                variant="outlined"
                                color="error"
                                disabled={!isNoteOwner || !checkedOwner}
                                onClick={handleDetachSumm}
                                size="small"
                            >
                                Отвязать суммаризацию от заметки
                            </LoadingButton>
                            <LoadingButton
                                loading={isStoppingCall}
                                variant="outlined"
                                color="error"
                                onClick={handleStopSumm}
                                disabled={!summary.isActive || !isNoteOwner || !checkedOwner}
                                size="small"
                            >
                                Закончить суммаризацию
                            </LoadingButton>
                        </Box>
                    </>
                }
            />
            {summary.text === '' ? (
                summary.isActive ? (
                    <Box sx={{display: 'flex'}}>
                        <Skeleton width={200} height={40} />
                    </Box>
                ) : (
                    <Typography variant={'body1'}>Звонок слишком рано прервался</Typography>
                )
            ) : (
                <>
                    <CardActions disableSpacing>
                        <ExpandMore
                            expand={expanded}
                            onClick={handleExpandClick}
                            aria-expanded={expanded}
                            aria-label="show more"
                        >
                            <ExpandMoreIcon />
                        </ExpandMore>
                    </CardActions>
                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                        <CardContent>
                            {summary.text === '' ? (
                                summary.isActive ? (
                                    <Box sx={{display: 'flex'}}>
                                        <Skeleton width={200} height={40} />
                                    </Box>
                                ) : (
                                    <div>Звонок слишком рано прервался</div>
                                )
                            ) : (
                                <MDXEditor
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
                            )}
                        </CardContent>
                    </Collapse>
                </>
            )}
        </Card>
    );
}
