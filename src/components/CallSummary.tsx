import React from 'react';
import {
    Autocomplete,
    Box,
    Button,
    TextField,
    CircularProgress,
    Card,
    CardHeader,
    CardContent,
    CardActions,
    Collapse,
    Typography,
} from '@mui/material';
import IconButton, {IconButtonProps} from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {styled} from '@mui/material/styles';
import {Role} from '../types/notes';
import {SummaryWithLoading} from '../types/summary';

interface ExpandMoreProps extends IconButtonProps {
    expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
    const {expand, ...other} = props;
    return <IconButton {...other} />;
})(({theme, expand}) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    //marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
}));

export interface CallSummaryProps {
    summary: SummaryWithLoading;
    setRole: (newRole: string) => void;
    handleDetachSumm: () => void;
    handleStopSumm: () => void;
    id: string;
}

export function CallSummary({summary, setRole, handleDetachSumm, handleStopSumm, id}: CallSummaryProps) {
    const [expanded, setExpanded] = React.useState(summary.loading);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    return (
        <Card key={id}>
            <div key={id} style={{margin: '10px 20px 30px 40px'}}>
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
                            <Box gap={2} display="flex" alignItems={'center'}>
                                <Autocomplete
                                    defaultValue={'обычный'}
                                    options={Role}
                                    value={summary.role}
                                    onChange={(_, newValue) => {
                                        setRole(newValue || 'обычный');
                                    }}
                                    sx={{minWidth: 200}}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Стиль суммаризации" size="small" />
                                    )}
                                />
                                <Button variant="outlined" color="error" onClick={handleDetachSumm} size="small">
                                    Отвязать суммаризацию от заметки
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={handleStopSumm}
                                    disabled={!summary.loading}
                                    size="small"
                                >
                                    Закончить суммаризацию
                                </Button>
                            </Box>
                        </>
                    }
                />
                {summary.text === '' ? (
                    summary.loading ? (
                        <Box sx={{display: 'flex'}}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <div>Звонок слишком рано прервался</div>
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
                                <Typography paragraph>
                                    {summary.text === '' ? (
                                        summary.loading ? (
                                            <Box sx={{display: 'flex'}}>
                                                <CircularProgress />
                                            </Box>
                                        ) : (
                                            <div>Звонок слишком рано прервался</div>
                                        )
                                    ) : (
                                        <div>{summary.text}</div>
                                    )}
                                </Typography>
                            </CardContent>
                        </Collapse>
                    </>
                )}
            </div>
        </Card>
    );
}
