import React from 'react';
import {ListItem, Typography} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {Note} from '../types/notes';
import {deleteNote} from '../api/notes';
import {useRepo} from '@automerge/automerge-repo-react-hooks';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

interface NoteCardProps extends Note {
    refetchNotes?: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({id, title, refetchNotes, automergeUrl, dirId}) => {
    const navigate = useNavigate();

    const handleClickOnCard = React.useCallback(() => {
        navigate(`/notes/${id}`);
    }, [id, navigate]);

    const repo = useRepo();

    const handleDeleteClick = React.useCallback(
        async (ev: React.MouseEvent, note: Note) => {
            ev.stopPropagation();
            await deleteNote({id: note.id}).then(() => {
                repo.delete(note.automergeUrl);
                refetchNotes?.();
            });
        },
        [refetchNotes, repo],
    );

    return (
        <ListItem
            onClick={handleClickOnCard}
            sx={{cursor: 'pointer', px: 1, display: 'flex', justifyContent: 'space-between'}}
        >
            <Typography variant="body2">{title}</Typography>
            <RemoveCircleIcon
                fontSize={'small'}
                onClick={(ev) => handleDeleteClick(ev, {id, title, automergeUrl, dirId})}
            />
        </ListItem>
    );
};

export default NoteCard;
