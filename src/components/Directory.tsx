import React from 'react';
import {
    Button,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    ListItem,
    ListItemText,
    Menu,
    MenuItem,
    Skeleton,
    Stack,
    TextField,
} from '@mui/material';
import {ExpandMore} from '@mui/icons-material';
import {FullDirTreeWithNotes} from '../types/dirs';
import NoteCard from './NoteCard';
import List from '@mui/material/List';
import {useAppDispatch, useAppSelector} from '../hooks/useRedux';
import {addCollapsedDirId, removeCollapsedDirId} from '../store/reducers/DirsSlice';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {dirsApi} from '../services/DirsService';
import {FetchBaseQueryError} from '@reduxjs/toolkit/query';
import {SerializedError} from '@reduxjs/toolkit';
import {useSnackbar} from 'notistack';
import {LoadingButton} from '@mui/lab';

interface FolderProps {
    folder: FullDirTreeWithNotes;
    onDirCreateClick: () => void;
    handleCreateNote: () => void;
    refetchNotes: () => void;
    setDirIdForCreate: (dirId: number) => void;
    isLoading: boolean;
    accumulatedPadding?: number;
}

function Folder({
    folder,
    onDirCreateClick,
    refetchNotes,
    handleCreateNote,
    setDirIdForCreate,
    isLoading,
    accumulatedPadding = 0,
}: FolderProps) {
    const {dirTree: innerFullDirTree, collapsedDirIds} = useAppSelector((state) => state.dirsReducer);
    const {user} = useAppSelector((state) => state.userReducer);
    const dispatch = useAppDispatch();
    const {data: dir} = dirsApi.useGetDirQuery(
        {
            userId: user?.id || '',
            dirId: folder?.id || 0,
        },
        {skip: !user || !folder},
    );

    const [deleteDir, {}] = dirsApi.useDeleteDirMutation();
    const [updateDir, {isLoading: isLoadingUpdateDir}] = dirsApi.useUpdateDirMutation();

    const [contextMenu, setContextMenu] = React.useState<{mouseX: number; mouseY: number} | null>(null);

    const isOpen = React.useMemo(() => !!folder && collapsedDirIds.includes(folder.id), [collapsedDirIds, folder]);
    const [newTitle, setNewTitle] = React.useState<string>(folder.name);
    const [isOpenNewTitleDialog, setIsOpenNewTitleDialog] = React.useState<boolean>(false);

    const handleClick = () => {
        if (isOpen) {
            dispatch(removeCollapsedDirId(folder?.id));
        } else {
            dispatch(addCollapsedDirId(folder?.id));
        }
    };

    const handleContextMenu = React.useCallback(
        (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            event.preventDefault();
            setContextMenu(contextMenu === null ? {mouseX: event.clientX - 2, mouseY: event.clientY - 4} : null);
        },
        [contextMenu],
    );

    const {enqueueSnackbar} = useSnackbar();

    const handleDeleteDir = () => {
        if (user && dir) {
            deleteDir({dir, userId: user.id}).then((data) => {
                if ((data as {error: FetchBaseQueryError | SerializedError}).error) {
                    enqueueSnackbar(`Ошибка при удалении папки ${folder.name}`, {variant: 'error'});
                } else {
                    enqueueSnackbar(`Папка ${folder.name} успешно удалена`, {variant: 'success'});
                }
            });
        }
    };

    const handleRenameDir = React.useCallback(async () => {
        if (user && dir) {
            await updateDir({dir: {...dir, name: newTitle}, userId: user.id}).then((data) => {
                if ((data as {error: FetchBaseQueryError | SerializedError}).error) {
                    enqueueSnackbar(`Ошибка при переименовании папки ${folder.name}`, {variant: 'error'});
                } else {
                    enqueueSnackbar(`Папка ${folder.name} успешно переименована`, {variant: 'success'});
                }
            });
        }
    }, [dir, enqueueSnackbar, folder.name, newTitle, updateDir, user]);

    const handleKeyDown = React.useCallback(
        async (event: React.KeyboardEvent<HTMLDivElement>) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                await handleRenameDir();

                setIsOpenNewTitleDialog(false);
            }
        },
        [handleRenameDir],
    );

    const handleClose = () => {
        setContextMenu(null);
    };

    return !isLoading ? (
        <List
            sx={{
                m: 0,
                p: 0,
                display: 'flex',
                flexGrow: 1,
                flexDirection: 'column',
                '&:hover .MuiList-root': {
                    backgroundColor: `transparent`,
                },
            }}
        >
            <>
                {folder.id !== innerFullDirTree?.id && (
                    <ListItem
                        button
                        sx={{
                            display: 'flex',
                            gap: '4px',
                            flexGrow: 1,
                            cursor: 'pointer',
                            p: 0,
                            pr: 1,
                            py: '4px',
                            pl: folder.id !== innerFullDirTree?.id ? accumulatedPadding : 0,
                        }}
                        onClick={handleClick}
                        onContextMenu={handleContextMenu}
                    >
                        {isOpen ? <ExpandMore fontSize={'small'} /> : <ChevronRightIcon fontSize={'small'} />}
                        <ListItemText sx={{m: 0, p: 0, display: 'flex', flexGrow: 1}} primary={folder.name} />
                    </ListItem>
                )}

                <Collapse
                    in={isOpen || folder.id === innerFullDirTree?.id}
                    timeout="auto"
                    unmountOnExit
                    sx={{
                        display: 'flex',
                        flexGrow: 1,
                    }}
                >
                    <List sx={{p: 0, gap: '4px'}}>
                        {folder.children.map((subFolder, idx) => (
                            <ListItem
                                button
                                key={`folder-${idx}`}
                                sx={{
                                    p: 0,
                                    display: 'flex',
                                    flexGrow: 1,
                                }}
                            >
                                <Folder
                                    key={subFolder.id}
                                    folder={subFolder}
                                    handleCreateNote={handleCreateNote}
                                    onDirCreateClick={onDirCreateClick}
                                    refetchNotes={refetchNotes}
                                    setDirIdForCreate={setDirIdForCreate}
                                    isLoading={isLoading}
                                    accumulatedPadding={accumulatedPadding + 1}
                                />
                            </ListItem>
                        ))}
                        {folder.notes.map((note, idx) => (
                            <NoteCard accumulatedPadding={accumulatedPadding + 1} key={idx} {...note} />
                        ))}
                    </List>
                </Collapse>

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
                            onDirCreateClick();
                            setDirIdForCreate(folder.id);
                            handleClose();
                        }}
                    >
                        Создать папку
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            handleCreateNote();
                            setDirIdForCreate(folder.id);
                            handleClose();
                        }}
                    >
                        Создать заметку
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            setIsOpenNewTitleDialog(true);
                            handleClose();
                        }}
                    >
                        Переименовать папку
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            handleDeleteDir();
                            handleClose();
                        }}
                    >
                        Удалить папку
                    </MenuItem>
                </Menu>

                <Dialog open={isOpenNewTitleDialog} onClose={() => setIsOpenNewTitleDialog(false)}>
                    <DialogTitle id="change-name-dialog-title">Переименовать папку</DialogTitle>
                    <DialogContent>
                        <Stack gap={3}>
                            <TextField
                                type="text"
                                margin="dense"
                                id="zoom-url"
                                label="Новое имя"
                                size="small"
                                variant="outlined"
                                fullWidth
                                autoFocus
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
                            loading={isLoadingUpdateDir}
                            onClick={async () => {
                                await handleRenameDir();

                                setNewTitle('');
                                setIsOpenNewTitleDialog(false);
                                handleClose();
                            }}
                        >
                            Подтвердить
                        </LoadingButton>
                    </DialogActions>
                </Dialog>
            </>
        </List>
    ) : (
        <Skeleton width={200} />
    );
}

export default Folder;
