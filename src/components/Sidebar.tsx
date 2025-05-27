import React, {Dispatch, SetStateAction} from 'react';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import {useRepo} from '@automerge/automerge-repo-react-hooks';
import {useLocation, useNavigate} from 'react-router-dom';
import {
    Box,
    Button,
    ButtonGroup,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    List,
    ListItem,
    Stack,
    styled,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import ListIcon from '@mui/icons-material/List';
import Folder from './Directory';
import {useAppDispatch, useAppSelector} from '../hooks/useRedux';
import {dirsApi} from '../services/DirsService';
import {notesApi} from '../services/NotesService';
import {addCollapsedDirId, changeCollapsedStateForAllDirs, mergeDirTreeWithNotes} from '../store/reducers/DirsSlice';
import {createAutomergeUrl} from '../utils/automerge';
import {TabType} from '../types/layout';
import NoteCard from './NoteCard';
import {setActiveNote, setNotes, setSharedNotesByUserDirs, setTabType} from '../store/reducers/NotesSlice';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {FetchBaseQueryError} from '@reduxjs/toolkit/query';
import {SerializedError} from '@reduxjs/toolkit';
import {useSnackbar} from 'notistack';
import {Note} from '../types/notes';
import {extractNumberAfterLastDot} from '../utils/numbers';
import {Dir} from '../types/dirs';
import {LoadingButton} from '@mui/lab';

const DrawerHeader = styled(ButtonGroup)(({theme}) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'space-between',
    position: 'relative',
}));

interface SidebarProps {
    setWidth: Dispatch<SetStateAction<number>>;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    width: number;
    refContainer: React.RefObject<HTMLDivElement>;
}

const CustomIconButton = styled(IconButton)(({theme}) => ({
    '&.active': {
        backgroundColor: theme.palette.action.selected,
    },
}));

const HoverArea = styled('div')<{
    open?: boolean;
    width: number;
}>(({theme, open, width}) => ({
    position: 'absolute',
    top: 0,
    zIndex: 1000,
    left: open ? width : 0,
    width: open ? 5 : 15,
    backgroundColor: theme.palette.action.hover,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'none',
    '&:hover': {
        width: open ? 10 : 15,
        backgroundColor: theme.palette.action.selected,
    },
    transition: 'all 0.3s ease',
}));

const Sidebar: React.FC<SidebarProps> = ({width, setOpen, open, refContainer}: SidebarProps) => {
    const repo = useRepo();
    const navigate = useNavigate();
    const location = useLocation();

    const {user} = useAppSelector((state) => state.userReducer);
    const {dirTree: fullDirTree, dirIds} = useAppSelector((state) => state.dirsReducer);
    const {sharedNotes, tab: noteTab, activeNote} = useAppSelector((state) => state.notesReducer);
    const dispatch = useAppDispatch();

    const {
        data: dirTree,
        isLoading: isLoadingDirTree,
        isError: isErrorDirTree,
    } = dirsApi.useGetDirTreeQuery(
        {
            userId: user?.id || '',
            dirId: user?.rootDirId || 0,
        },
        {skip: !user},
    );

    const {
        data: notes,
        isLoading: isLoadingNotes,
        isError: isErrorNotes,
        refetch: refetchNotes,
    } = notesApi.useListNotesQuery(
        {
            userId: user?.id || '',
        },
        {skip: !user},
    );

    const [
        createNoteApi,
        {
            data: createdNote,
            isLoading: isLoadingNoteCreation,
            isError: isErrorNoteCreation,
            reset: resetCreatedNoteData,
        },
    ] = notesApi.useCreateNoteMutation();

    const [createDirApi, {isLoading: isLoadingDirCreation, isError: isErrorDirCreation}] =
        dirsApi.useCreateDirMutation();

    const [collapsed, setCollapsed] = React.useState<boolean>(true);
    const [isOpenCreateDialog, setIsOpenCreateDialog] = React.useState(false);
    const [showIcon, setShowIcon] = React.useState<boolean>(false);

    const [isOpenCreateNoteDialog, setIsOpenCreateNoteDialog] = React.useState(false);
    const [dirName, setDirName] = React.useState<string>('');
    const [noteTitle, setNoteTitle] = React.useState<string>('');
    const [dirIdForCreate, setDirIdForCreate] = React.useState<number>(1);

    const queryParams = new URLSearchParams(location.search);
    const tab =
        queryParams.get('tab') === TabType.HOME || queryParams.get('tab') === null ? TabType.HOME : TabType.SHARED;

    const handleTabChange = (newTab: TabType) => {
        dispatch(setTabType({tab: newTab}));
        navigate(`/?tab=${newTab}`);
    };

    const {enqueueSnackbar} = useSnackbar();
    const handleCreateNote = React.useCallback(
        (title: string, dirId?: number) => {
            if (user) {
                createNoteApi({
                    title: title,
                    dirId: dirId || user?.rootDirId || 0,
                    automergeUrl: createAutomergeUrl(repo),
                    userId: user.id,
                }).then((data) => {
                    if ((data as {error: FetchBaseQueryError | SerializedError}).error) {
                        enqueueSnackbar('Не удалось создать заметку', {variant: 'error'});
                    } else {
                        enqueueSnackbar('Заметка успешно создана', {variant: 'success'});
                        dispatch(addCollapsedDirId((data as {data: Note}).data.dirId));
                    }
                });
            }
        },
        [createNoteApi, dispatch, enqueueSnackbar, repo, user],
    );

    const handleCreateDir = React.useCallback(
        async (parentDirId: number, name: string) => {
            if (user) {
                createDirApi({parentDirId, name, userId: user.id}).then((data) => {
                    if ((data as {error: FetchBaseQueryError | SerializedError}).error) {
                        enqueueSnackbar('Не удалось создать папку', {variant: 'error'});
                    } else {
                        enqueueSnackbar('Папка успешно создана', {variant: 'success'});
                        const dirId = extractNumberAfterLastDot((data as {data: Dir}).data.subpath);
                        if (dirId) {
                            dispatch(addCollapsedDirId(dirId));
                        }

                        setIsOpenCreateDialog(false);
                        setDirName('');
                    }
                });
            }
        },
        [createDirApi, dispatch, enqueueSnackbar, user],
    );

    const handleCollapsedClicked = React.useCallback(() => {
        dispatch(changeCollapsedStateForAllDirs(!collapsed));
        setCollapsed((prevState) => !prevState);
    }, [collapsed, dispatch]);

    const [cursorPosition, setCursorPosition] = React.useState({x: 0, y: 0});

    const handleMouseMove = (event: React.MouseEvent) => {
        setCursorPosition({
            x: event.clientX,
            y: event.clientY,
        });
    };

    React.useEffect(() => {
        if (user) {
            setDirIdForCreate(user.rootDirId);
        }
    }, [user]);

    React.useEffect(() => {
        if (createdNote) {
            navigate(`/notes/${createdNote.id}`);
            resetCreatedNoteData();
            setNoteTitle('');
        }
    }, [createdNote, navigate, resetCreatedNoteData]);

    const handleKeyDown = React.useCallback(
        async (event: React.KeyboardEvent<HTMLDivElement>, type: 'dir' | 'note') => {
            if (event.key === 'Enter') {
                event.preventDefault();
                if (type === 'dir') {
                    await handleCreateDir(dirIdForCreate, dirName);
                } else {
                    handleCreateNote(noteTitle, dirIdForCreate);
                    setIsOpenCreateNoteDialog(false);
                }
            }
        },
        [dirIdForCreate, dirName, handleCreateDir, handleCreateNote, noteTitle],
    );

    const refAbsoluteDiv = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const updateHeight = () => {
            if (refContainer.current && refAbsoluteDiv.current) {
                const height = refContainer.current.offsetHeight;
                refAbsoluteDiv.current.style.height =
                    window.innerHeight < height ? `${height}px` : `${window.innerHeight}px`;
                refContainer.current.style.height =
                    window.innerHeight < height ? `${height}px` : `${window.innerHeight}px`;
            }
        };

        updateHeight();

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || mutation.type === 'attributes') {
                    updateHeight();
                }
            });
        });

        if (refContainer.current) {
            observer.observe(refContainer.current, {
                attributes: true,
                childList: true,
                subtree: true,
            });
        }

        return () => {
            observer.disconnect();
        };
    }, [refContainer]);

    React.useEffect(() => {
        if (tab) {
            dispatch(setTabType({tab}));
        }
    }, [tab, dispatch]);

    React.useEffect(() => {
        if (notes) {
            dispatch(setNotes({notes}));
        }
    }, [dirTree, dispatch, notes]);

    React.useEffect(() => {
        if (notes && dirTree) {
            dispatch(mergeDirTreeWithNotes({dirTree, notes}));
        }
    }, [dirTree, dispatch, notes]);

    React.useEffect(() => {
        if (dirIds) {
            dispatch(setSharedNotesByUserDirs({dirIds}));
        }
    }, [dispatch, dirIds]);

    return (
        <>
            <HoverArea
                ref={refAbsoluteDiv}
                onMouseEnter={() => setShowIcon(true)}
                onMouseLeave={() => setShowIcon(false)}
                onMouseMove={handleMouseMove}
                open={open}
                width={width}
                onClick={() => setOpen(!open)}
            >
                {open ? (
                    <ArrowBackIcon
                        fontSize={'small'}
                        sx={{
                            position: 'fixed',
                            left: cursorPosition.x,
                            top: cursorPosition.y,
                            pointerEvents: 'none',
                            display: showIcon ? 'flex' : 'none',
                        }}
                    />
                ) : (
                    <ArrowForwardIcon
                        fontSize={'small'}
                        sx={{
                            position: 'fixed',
                            left: cursorPosition.x,
                            top: cursorPosition.y,
                            pointerEvents: 'none',
                            display: showIcon ? 'flex' : 'none',
                        }}
                    />
                )}
            </HoverArea>

            <Drawer
                sx={{
                    width: width,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: width,
                        boxSizing: 'border-box',
                        mt: `64px`,
                    },
                }}
                variant="persistent"
                anchor="left"
                open={open}
            >
                <DrawerHeader sx={{display: 'flex', justifyContent: 'space-around'}}>
                    <Tooltip title="Свои заметки">
                        <CustomIconButton
                            onClick={() => {
                                handleTabChange(TabType.HOME);
                                dispatch(setActiveNote(undefined));
                            }}
                            className={tab === TabType.HOME ? 'active' : ''}
                        >
                            <HomeIcon />
                        </CustomIconButton>
                    </Tooltip>
                    <Tooltip disableFocusListener={!user} title={'Доступные заметки'}>
                        <CustomIconButton
                            className={tab === TabType.SHARED ? 'active' : ''}
                            onClick={() => {
                                handleTabChange(TabType.SHARED);
                                dispatch(setActiveNote(undefined));
                            }}
                        >
                            <ListIcon />
                        </CustomIconButton>
                    </Tooltip>
                </DrawerHeader>

                <Divider />

                <ButtonGroup sx={{display: 'flex', justifyContent: 'flex-end'}}>
                    <Tooltip
                        disableFocusListener={!user || noteTab === TabType.SHARED}
                        title={collapsed ? 'Свернуть все' : 'Развернуть все'}
                    >
                        <IconButton disabled={!user || noteTab === TabType.SHARED} onClick={handleCollapsedClicked}>
                            {collapsed ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
                        </IconButton>
                    </Tooltip>

                    <Tooltip disableFocusListener={!user || noteTab === TabType.SHARED} title={'Создать заметку'}>
                        <IconButton
                            disabled={!user || noteTab === TabType.SHARED}
                            onClick={() => {
                                // если мы не выбрали заметку, то в activeNote undefined, тогда берем как папку корень
                                if (!!activeNote) {
                                    setDirIdForCreate(activeNote.dirId);
                                } else if (!!user) {
                                    setDirIdForCreate(user.rootDirId);
                                }

                                setIsOpenCreateNoteDialog(true);
                            }}
                        >
                            <NoteAddIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip disableFocusListener={!user || noteTab === TabType.SHARED} title={'Создать папку'}>
                        <IconButton
                            disabled={!user || noteTab === TabType.SHARED}
                            onClick={() => {
                                if (activeNote) {
                                    setDirIdForCreate(activeNote.dirId);
                                }
                                setIsOpenCreateDialog(true);
                            }}
                        >
                            <CreateNewFolderIcon />
                        </IconButton>
                    </Tooltip>
                </ButtonGroup>

                <Divider />
                {(isErrorNotes || isErrorDirTree || isErrorDirCreation || isErrorNoteCreation) && (
                    <Box sx={{p: 2}}>
                        <Typography variant={'body1'}>Технические проблемы</Typography>
                    </Box>
                )}
                {!(isErrorNotes || isErrorDirTree) && (
                    <Box sx={{p: 2}}>
                        {!!user ? (
                            <>
                                {((!fullDirTree || (!fullDirTree.notes.length && !fullDirTree.children.length)) &&
                                    noteTab === TabType.HOME) ||
                                (!sharedNotes.length && noteTab === TabType.SHARED && !isLoadingNotes) ? (
                                    <Typography>Ещё нет заметок</Typography>
                                ) : (
                                    <>
                                        {noteTab === TabType.HOME && fullDirTree && (
                                            <Folder
                                                onDirCreateClick={() => setIsOpenCreateDialog(true)}
                                                handleCreateNote={() => setIsOpenCreateNoteDialog(true)}
                                                refetchNotes={refetchNotes}
                                                folder={fullDirTree}
                                                setDirIdForCreate={setDirIdForCreate}
                                                isLoading={isLoadingDirTree || isLoadingNotes}
                                            />
                                        )}
                                        {noteTab === TabType.SHARED &&
                                            (sharedNotes.length || isLoadingNotes ? (
                                                <List>
                                                    {sharedNotes.map((note, idx) => (
                                                        <ListItem button key={`note-${idx}`} sx={{p: 0}}>
                                                            <NoteCard key={note.id} {...note} />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            ) : (
                                                <Typography>Нет доступных заметок</Typography>
                                            ))}
                                    </>
                                )}
                            </>
                        ) : (
                            <Typography>Войдите для доступа к заметкам</Typography>
                        )}
                    </Box>
                )}

                <Dialog open={isOpenCreateDialog} onClose={() => setIsOpenCreateDialog(false)} fullWidth={true}>
                    <DialogTitle id="alert-dialog-title">Создать директорию</DialogTitle>
                    <DialogContent sx={{minHeight: 70}}>
                        <Stack gap={3}>
                            <TextField
                                type="text"
                                margin="dense"
                                id="zoom-url"
                                label="Имя папки"
                                autoFocus
                                size="small"
                                variant="outlined"
                                fullWidth
                                value={dirName}
                                onKeyDown={(event) => handleKeyDown(event, 'dir')}
                                onChange={(e) => {
                                    setDirName(e.target.value);
                                }}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsOpenCreateDialog(false)}>Закрыть</Button>
                        <LoadingButton
                            variant="contained"
                            loading={isLoadingDirCreation}
                            onClick={async () => {
                                await handleCreateDir(dirIdForCreate, dirName);
                            }}
                        >
                            Подтвердить
                        </LoadingButton>
                    </DialogActions>
                </Dialog>

                <Dialog open={isOpenCreateNoteDialog} onClose={() => setIsOpenCreateNoteDialog(false)} fullWidth={true}>
                    <DialogTitle id="alert-dialog-title">Создать заметку</DialogTitle>
                    <DialogContent sx={{minHeight: 70}}>
                        <Stack gap={3}>
                            <TextField
                                type="text"
                                margin="dense"
                                id="zoom-url"
                                label="Название заметки"
                                size="small"
                                variant="outlined"
                                autoFocus
                                fullWidth
                                value={noteTitle}
                                onKeyDown={(event) => handleKeyDown(event, 'note')}
                                onChange={(e) => {
                                    setNoteTitle(e.target.value);
                                }}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsOpenCreateNoteDialog(false)}>Закрыть</Button>
                        <LoadingButton
                            variant="contained"
                            loading={isLoadingNoteCreation}
                            onClick={() => {
                                handleCreateNote(noteTitle, dirIdForCreate);
                                setIsOpenCreateNoteDialog(false);
                                setNoteTitle('');
                            }}
                        >
                            Подтвердить
                        </LoadingButton>
                    </DialogActions>
                </Dialog>
            </Drawer>
        </>
    );
};

export default Sidebar;
