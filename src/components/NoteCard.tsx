import React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    ListItem,
    Menu,
    MenuItem,
    Stack,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {Note} from '../types/notes';
import {useRepo} from '@automerge/automerge-repo-react-hooks';
import {useAppDispatch, useAppSelector} from '../hooks/useRedux';
import {setActiveNote} from '../store/reducers/NotesSlice';
import {AccessEnum} from '../types/access';
import {notesApi} from '../services/NotesService';
import {useSnackbar} from 'notistack';
import {FetchBaseQueryError} from '@reduxjs/toolkit/query';
import {SerializedError} from '@reduxjs/toolkit';
import {LoadingButton} from '@mui/lab';

const NoteCard: React.FC<Note & {accumulatedPadding?: number}> = ({
    id,
    title,
    automergeUrl,
    dirId,
    allowedMethods,
    defaultAccess,
    accumulatedPadding = 0,
}) => {
    const navigate = useNavigate();
    const {enqueueSnackbar} = useSnackbar();

    const dispatch = useAppDispatch();
    const {activeNote} = useAppSelector((store) => store.notesReducer);
    const {user} = useAppSelector((store) => store.userReducer);

    const [newTitle, setNewTitle] = React.useState<string>(title);
    const [isOpenNewTitleDialog, setIsOpenNewTitleDialog] = React.useState<boolean>(false);

    const [deleteNote, {}] = notesApi.useDeleteNoteMutation();
    const [updateNote, {isLoading: isLoadingUpdateNote}] = notesApi.useUpdateNoteMutation();

    const [contextMenu, setContextMenu] = React.useState<{mouseX: number; mouseY: number} | null>(null);

    const handleContextMenu = React.useCallback(
        (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            event.preventDefault();
            setContextMenu(contextMenu === null ? {mouseX: event.clientX - 2, mouseY: event.clientY - 4} : null);
        },
        [contextMenu],
    );

    const handleClose = () => {
        setContextMenu(null);
    };

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
        backgroundColor: activeNote?.id === id ? theme.palette.action.selected : 'transparent',
        cursor: 'pointer',
    };

    const handleDeleteClick = React.useCallback(
        async (ev: React.MouseEvent, note: Note) => {
            ev.stopPropagation();
            if (note.allowedMethods.includes(AccessEnum.delete))
                deleteNote({note, userId: user?.id || ''}).then((data) => {
                    repo.delete(note.automergeUrl);

                    if ((data as {error: FetchBaseQueryError | SerializedError}).error) {
                        enqueueSnackbar(`Ошибка при удалении заметки ${note.title}`, {variant: 'error'});
                    } else {
                        enqueueSnackbar(`Заметка ${note.title} успешно удалена`, {variant: 'success'});
                    }
                });
        },
        [deleteNote, enqueueSnackbar, repo, user?.id],
    );

    const handleRenameNote = React.useCallback(
        async (ev: React.MouseEvent | React.KeyboardEvent<HTMLDivElement>, note: Note) => {
            ev.stopPropagation();
            if (note.allowedMethods.includes(AccessEnum.update))
                updateNote({note: {...note, title: newTitle}, userId: user?.id || ''}).then((data) => {
                    if ((data as {error: FetchBaseQueryError | SerializedError}).error) {
                        enqueueSnackbar(`Ошибка при переименовании заметки ${note.title}`, {variant: 'error'});
                    } else {
                        enqueueSnackbar(`Заметка ${note.title} успешно переименована`, {variant: 'success'});
                    }
                });
        },
        [enqueueSnackbar, newTitle, updateNote, user?.id],
    );

    const handleKeyDown = React.useCallback(
        async (event: React.KeyboardEvent<HTMLDivElement>) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                await handleRenameNote(event, {
                    id,
                    title,
                    automergeUrl,
                    dirId,
                    allowedMethods,
                    defaultAccess,
                });

                setIsOpenNewTitleDialog(false);
            }
        },
        [allowedMethods, automergeUrl, defaultAccess, dirId, handleRenameNote, id, title],
    );

    return (
        <ListItem
            button
            key={`note-${id}`}
            sx={{
                px: 1,
                display: 'flex',
                justifyContent: 'space-between',
                gap: 2,
                pl: accumulatedPadding + 3,
                flexGrow: 1,
                cursor: 'pointer',
                '&:hover': {
                    backgroundColor: `${theme.palette.action.selected} !important`,
                },
            }}
            style={activeStyle}
            onContextMenu={handleContextMenu}
            onClick={handleClickOnCard}
        >
            <Typography variant="body2">{title}</Typography>
            <Menu
                open={contextMenu !== null}
                onClose={handleClose}
                anchorReference="anchorPosition"
                anchorPosition={
                    contextMenu !== null
                        ? {
                              top: contextMenu.mouseY,
                              left: contextMenu.mouseX,
                          }
                        : undefined
                }
            >
                <MenuItem
                    onClick={() => {
                        setIsOpenNewTitleDialog(true);
                        handleClose();
                    }}
                >
                    Переименовать заметку
                </MenuItem>
                <MenuItem
                    onClick={(ev) => {
                        handleDeleteClick(ev, {
                            id,
                            title,
                            automergeUrl,
                            dirId,
                            allowedMethods,
                            defaultAccess,
                        });
                        handleClose();
                    }}
                >
                    Удалить заметку
                </MenuItem>
            </Menu>

            <Dialog open={isOpenNewTitleDialog} onClose={() => setIsOpenNewTitleDialog(false)}>
                <DialogTitle id="change-title-dialog-title">Переименовать заметку</DialogTitle>
                <DialogContent>
                    <Stack gap={3}>
                        <TextField
                            type="text"
                            autoFocus
                            margin="dense"
                            id="zoom-url"
                            label="Новое название"
                            size="small"
                            variant="outlined"
                            fullWidth
                            value={newTitle}
                            onKeyDown={(event) => handleKeyDown(event)}
                            onChange={(e) => {
                                setNewTitle(e.target.value);
                            }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsOpenNewTitleDialog(false)}>Закрыть</Button>
                    <LoadingButton
                        loading={isLoadingUpdateNote}
                        onClick={async (ev) => {
                            await handleRenameNote(ev, {
                                id,
                                title,
                                automergeUrl,
                                dirId,
                                allowedMethods,
                                defaultAccess,
                            });

                            setNewTitle('');
                            setIsOpenNewTitleDialog(false);
                        }}
                    >
                        Подтвердить
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </ListItem>
    );
};

export default NoteCard;
