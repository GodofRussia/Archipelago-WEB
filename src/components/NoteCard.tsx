import React from 'react';
import {Card, CardActions, CardContent, IconButton, Typography} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import {useNavigate} from 'react-router-dom';
import {Note} from '../types/notes';
import {deleteNote} from '../api/notes';

interface NoteCardProps extends Note {
    refetchNotes?: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({id, title, refetchNotes}) => {
    const navigate = useNavigate();

    const handleDeleteClick = React.useCallback(
        async (ev: React.MouseEvent) => {
            ev.stopPropagation();
            await deleteNote({id});
            refetchNotes?.();
        },
        [id, refetchNotes],
    );

    const handleClickOnCard = React.useCallback(() => {
        navigate(`/notes/${id}`);
    }, [id, navigate]);

    return (
        <Card onClick={handleClickOnCard} sx={{cursor: 'pointer'}}>
            <CardContent>
                <Typography variant="h5" component="h2">
                    {title}
                </Typography>
            </CardContent>
            <CardActions>
                <IconButton aria-label="delete note" onClick={handleDeleteClick} sx={{justifySelf: 'center'}}>
                    <DeleteIcon />
                </IconButton>
            </CardActions>
        </Card>
    );
};

export default NoteCard;
