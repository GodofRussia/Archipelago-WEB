import React, {Dispatch, SetStateAction} from 'react';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import {useRepo} from '@automerge/automerge-repo-react-hooks';
import {useNavigate} from 'react-router-dom';
import {
    Box,
    Button,
    ButtonGroup,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Stack,
    styled,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import CollapseIcon from '../icons/CollapseIcon';
import HomeIcon from '@mui/icons-material/Home';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import Folder from './Directory';
import {useAppDispatch, useAppSelector} from '../hooks/useRedux';
import {dirsApi} from '../services/DirsService';
import {notesApi} from '../services/NotesService';
import {mergeDirTreeWithNotes} from '../store/reducers/DirsSlice';
import {createAutomergeUrl} from '../utils/automerge';

const DrawerHeader = styled(ButtonGroup)(({theme}) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'space-between',
}));

interface SidebarProps {
    setWidth: Dispatch<SetStateAction<number>>;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    width: number;
}

const Sidebar: React.FC<SidebarProps> = ({width, setOpen, open}: SidebarProps) => {
    const repo = useRepo();
    const navigate = useNavigate();

    const {user} = useAppSelector((state) => state.userReducer);
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

    const [createNoteApi, {data: createdNote, isLoading: isLoadingNoteCreation, isError: isErrorNoteCreation}] =
        notesApi.useCreateNoteMutation();

    const [createDirApi, {isLoading: isLoadingDirCreation, isError: isErrorDirCreation}] =
        dirsApi.useCreateDirMutation();

    const {dirTree: fullDirTree} = useAppSelector((state) => state.dirsReducer);
    const dispatch = useAppDispatch();

    const [collapsed, setCollapsed] = React.useState<boolean>(true);
    const [isOpenCreateDialog, setIsOpenCreateDialog] = React.useState(false);

    const [isOpenCreateNoteDialog, setIsOpenCreateNoteDialog] = React.useState(false);
    const [dirName, setDirName] = React.useState<string>('');
    const [noteTitle, setNoteTitle] = React.useState<string>('');
    const [dirIdForCreate, setDirIdForCreate] = React.useState<number>(1);

    const handleCreateNote = React.useCallback(
        (title: string, dirId?: number) => {
            if (user) {
                console.log(user?.rootDirId, dirId, title, user);
                createNoteApi({
                    title: title,
                    dirId: dirId || user?.rootDirId || 0,
                    automergeUrl: createAutomergeUrl(repo),
                    userId: user.id,
                });
            }
        },
        [createNoteApi, repo, user],
    );

    React.useEffect(() => {
        if (user) {
            setDirIdForCreate(user.rootDirId);
        }
    }, [createdNote, navigate, user]);

    React.useEffect(() => {
        if (createdNote) {
            navigate(`/notes/${createdNote.id}`);
        }
    }, [createdNote, navigate]);

    const handleCreateDir = React.useCallback(
        async (parentDirId: number, name: string) => {
            if (user) {
                createDirApi({parentDirId, name, userId: user.id});
            }
        },
        [createDirApi, user],
    );

    React.useEffect(() => {
        if (user && notes && dirTree) {
            dispatch(mergeDirTreeWithNotes({dirTree, notes}));
        }
    }, [dirTree, dispatch, notes, user]);

    return (
        <Drawer
            sx={{
                width: width,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: width,
                    boxSizing: 'border-box',
                },
            }}
            variant="persistent"
            anchor="left"
            open={open}
        >
            <DrawerHeader>
                <IconButton onClick={() => navigate('/')}>
                    <HomeIcon />
                </IconButton>
                {/* // TODO: Реализовать список доступных заметок */}
                {/* <IconButton> */}
                {/*     <ListIcon /> */}
                {/* </IconButton> */}
                <IconButton onClick={() => setOpen(false)}>
                    <CollapseIcon color={'secondary'} />
                </IconButton>
            </DrawerHeader>

            <ButtonGroup sx={{display: 'flex', justifyContent: 'flex-end'}}>
                <Tooltip disableFocusListener={!user} title={collapsed ? 'Свернуть все' : 'Развернуть все'}>
                    <IconButton disabled={!user} onClick={() => setCollapsed((prevState) => !prevState)}>
                        {collapsed ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
                    </IconButton>
                </Tooltip>

                <Tooltip disableFocusListener={!user} title={'Создать заметку'}>
                    <IconButton disabled={!user} onClick={() => setIsOpenCreateNoteDialog(true)}>
                        <NoteAddIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip disableFocusListener={!user} title={'Создать папку'}>
                    <IconButton disabled={!user} onClick={() => setIsOpenCreateDialog(true)}>
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
                        <Folder
                            onDirCreateClick={() => setIsOpenCreateDialog(true)}
                            handleCreateNote={() => setIsOpenCreateNoteDialog(true)}
                            refetchNotes={refetchNotes}
                            folder={fullDirTree}
                            setDirIdForCreate={setDirIdForCreate}
                            isLoading={
                                isLoadingDirTree || isLoadingNotes || isLoadingDirCreation || isLoadingNoteCreation
                            }
                        />
                    ) : (
                        <Typography>Войдите для доступа к заметкам</Typography>
                    )}
                </Box>
            )}

            <Dialog open={isOpenCreateDialog} onClose={() => setIsOpenCreateDialog(false)}>
                <DialogTitle id="alert-dialog-title">Создать директорию</DialogTitle>
                <DialogContent>
                    <Stack gap={3}>
                        <TextField
                            type="text"
                            margin="dense"
                            id="zoom-url"
                            label="Имя папки"
                            size="small"
                            variant="outlined"
                            fullWidth
                            value={dirName}
                            onChange={(e) => {
                                setDirName(e.target.value);
                            }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button color={'secondary'} onClick={() => setIsOpenCreateDialog(false)}>
                        Закрыть
                    </Button>
                    <Button
                        color={'secondary'}
                        onClick={() => {
                            handleCreateDir(dirIdForCreate, dirName);
                            setIsOpenCreateDialog(false);
                        }}
                    >
                        Подтвердить
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isOpenCreateNoteDialog} onClose={() => setIsOpenCreateNoteDialog(false)}>
                <DialogTitle id="alert-dialog-title">Создать заметку</DialogTitle>
                <DialogContent>
                    <Stack gap={3}>
                        <TextField
                            type="text"
                            margin="dense"
                            id="zoom-url"
                            label="Название заметки"
                            size="small"
                            variant="outlined"
                            fullWidth
                            value={noteTitle}
                            onChange={(e) => {
                                setNoteTitle(e.target.value);
                            }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button color={'secondary'} onClick={() => setIsOpenCreateNoteDialog(false)}>
                        Закрыть
                    </Button>
                    <Button
                        color={'secondary'}
                        onClick={() => {
                            handleCreateNote(noteTitle, dirIdForCreate);
                            setIsOpenCreateNoteDialog(false);
                        }}
                    >
                        Подтвердить
                    </Button>
                </DialogActions>
            </Dialog>
        </Drawer>
    );
};

export default Sidebar;
