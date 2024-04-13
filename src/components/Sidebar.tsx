import React from 'react';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import {createNote} from '../api/notes';
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
} from '@mui/material';
import CollapseIcon from '../icons/CollapseIcon';
import HomeIcon from '@mui/icons-material/Home';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import {createDir, getDirTree} from '../api/dirs';
import {User} from '../types/user';
import {DirTreeDto} from '../types/dirs';
import Folder from './Directory';

const DrawerHeader = styled(ButtonGroup)(({theme}) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'space-between',
}));

interface SidebarProps {
    setWidth: (width: number) => Promise<void>;
    open: boolean;
    setOpen: (val: boolean) => Promise<void>;
    width: number;
}

const Sidebar: React.FC<SidebarProps> = ({width, setOpen, open}: SidebarProps) => {
    const repo = useRepo();
    const navigate = useNavigate();

    const [user, setUser] = React.useState<User | null>({id: 1, rootDirId: 1, login: 'moch', name: 'ilya'});
    const [collapsed, setCollapsed] = React.useState<boolean>(true);
    const [isOpenCreateDialog, setIsOpenCreateDialog] = React.useState(false);
    const [dirName, setDirName] = React.useState<string>('');
    const [dirIdForCreate, setDirIdForCreate] = React.useState<number>(1);

    // const [notes, setNotes] = React.useState<Note[]>([]);
    const [dirTree, setDirTree] = React.useState<DirTreeDto | null>(null);

    const refetchDirsTree = React.useCallback(() => {
        if (user) {
            getDirTree({id: user.rootDirId}).then((treeData) => setDirTree(treeData.data));
        }
    }, [user]);

    const handleCreateNote = React.useCallback(
        async (dirId: number) => {
            const note = await createNote({title: 'Untitled', dirId}, repo);
            await refetchDirsTree();
            navigate(`/notes/${note.id}`);
        },
        [navigate, refetchDirsTree, repo],
    );

    const handleCreateDir = React.useCallback(
        async (parentDirId: number, name: string) => {
            await createDir({name, parentDirId});
            refetchDirsTree();
        },
        [refetchDirsTree],
    );

    React.useEffect(() => {
        const currentUser = sessionStorage.getItem('user');
        if (currentUser && !user) {
            setUser(JSON.parse(currentUser));
        }
    }, [user]);

    React.useEffect(() => {
        if (user) {
            getDirTree({id: user.rootDirId}).then((treeData) => setDirTree(treeData.data));
        }
    }, [user]);

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
                {/* <IconButton> */}
                {/*     <ListIcon /> */}
                {/* </IconButton> */}
                <IconButton onClick={() => setOpen(false)}>
                    <CollapseIcon color={'secondary'} />
                </IconButton>
            </DrawerHeader>

            <ButtonGroup sx={{display: 'flex', justifyContent: 'flex-end'}}>
                <Tooltip title={collapsed ? 'Свернуть все' : 'Развернуть все'}>
                    <IconButton onClick={() => setCollapsed((prevState) => !prevState)}>
                        {collapsed ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
                    </IconButton>
                </Tooltip>

                <Tooltip title={'Создать заметку'}>
                    <IconButton onClick={() => handleCreateNote(user?.id || 1)}>
                        <NoteAddIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title={'Создать папку'}>
                    <IconButton onClick={() => setIsOpenCreateDialog(true)}>
                        <CreateNewFolderIcon />
                    </IconButton>
                </Tooltip>
            </ButtonGroup>

            <Divider />
            {dirTree && (
                <Box sx={{p: 2}}>
                    <Folder
                        active={1}
                        onDirCreateClick={() => setIsOpenCreateDialog(true)}
                        handleCreateNote={handleCreateNote}
                        refetchDirTree={refetchDirsTree}
                        folder={dirTree}
                        setDirIdForCreate={setDirIdForCreate}
                    />
                </Box>
            )}

            <Dialog open={isOpenCreateDialog}>
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
        </Drawer>
    );
};

export default Sidebar;
