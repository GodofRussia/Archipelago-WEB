import React from 'react';
import {ListItem, Typography, useTheme} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {Note} from '../types/notes';
import {deleteNote} from '../api/notes';
import {useRepo} from '@automerge/automerge-repo-react-hooks';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import {useAppDispatch, useAppSelector} from '../hooks/useRedux';
import {setActiveNote} from '../store/reducers/NotesSlice';
import {AccessEnum} from '../types/access';

interface NoteCardProps extends Note {
    refetchNotes?: () => void;
    isActive?: boolean;
}

const NoteCard: React.FC<NoteCardProps> = ({
    id,
    title,
    refetchNotes,
    automergeUrl,
    dirId,
    allowedMethods,
    defaultAccess,
}) => {
    const navigate = useNavigate();

    const dispatch = useAppDispatch();
    const {activeNote} = useAppSelector((store) => store.notesReducer);

    const handleClickOnCard = React.useCallback(() => {
        dispatch(
            setActiveNote({
                id,
                title,
                automergeUrl,
                dirId,
                allowedMethods,
                defaultAccess,
            }),
        );
        navigate(`/notes/${id}`);
    }, [allowedMethods, automergeUrl, defaultAccess, dirId, dispatch, id, navigate, title]);

    const repo = useRepo();
    const theme = useTheme();

    const activeStyle = {
        backgroundColor: activeNote?.id === id ? theme.palette.action.hover : 'transparent',
        cursor: 'pointer',
    };

    const handleDeleteClick = React.useCallback(
        async (ev: React.MouseEvent, note: Note) => {
            ev.stopPropagation();
            if (note.allowedMethods.includes(AccessEnum.delete))
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
            sx={{cursor: 'pointer', px: 1, display: 'flex', justifyContent: 'space-between', gap: 2}}
            style={activeStyle}
        >
            <Typography variant="body2">{title}</Typography>
            <RemoveCircleIcon
                fontSize={'small'}
                onClick={(ev) => handleDeleteClick(ev, {id, title, automergeUrl, dirId, allowedMethods, defaultAccess})}
            />
        </ListItem>
    );
};

export default NoteCard;
