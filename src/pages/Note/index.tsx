import React from 'react';
import {
    Autocomplete,
    Box,
    Button,
    ButtonGroup,
    Checkbox,
    ClickAwayListener,
    debounce,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grow,
    ListItem,
    MenuItem,
    MenuList,
    Paper,
    Popper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import {LoadingButton} from '@mui/lab';
import {useParams} from 'react-router-dom';
import {
    BlockTypeSelect,
    BoldItalicUnderlineToggles,
    diffSourcePlugin,
    DiffSourceToggleWrapper,
    headingsPlugin,
    imagePlugin,
    InsertImage,
    listsPlugin,
    ListsToggle,
    markdownShortcutPlugin,
    MDXEditor,
    MDXEditorMethods,
    quotePlugin,
    tablePlugin,
    thematicBreakPlugin,
    toolbarPlugin,
    UndoRedo,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import {
    AccessRole,
    AccessRoleEnum,
    CallsDetail,
    CallsDetailEnum,
    CONVERT_DEFAULT_ACCESS_ROLE_MAP,
    NoteDoc,
} from '../../types/notes';
import {useDocument} from '@automerge/automerge-repo-react-hooks';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import * as A from '@automerge/automerge/next';
import {useAppDispatch, useAppSelector} from '../../hooks/useRedux';
import {notesApi} from '../../services/NotesService';
import {setActiveNote} from '../../store/reducers/DirsSlice';
import {callAPI} from '../../services/CallService';
import {chatAPI} from '../../services/ChatService';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LinkIcon from '@mui/icons-material/Link';
import {userAPI} from '../../services/UserService';
import {useSnackbar} from 'notistack';
import List from '@mui/material/List';
import CallSummariesList from '../../components/CallSummariesList';

function Note() {
    const {id = ''} = useParams();

    const {user} = useAppSelector((store) => store.userReducer);
    const dispatch = useAppDispatch();

    const {data: note} = notesApi.useGetNoteQuery(
        {
            noteId: id,
            userId: user?.id || '',
        },
        {skip: !user},
    );

    const [startRecording, {isLoading: isLoadingStartRecording}] = callAPI.useStartCallRecordingMutation();
    const [attachSummary, {isLoading: isAttachingSummary}] = notesApi.useAttachSummaryMutation();

    const [getChatSum, {data: chatSumData}] = chatAPI.useGetSummarizationMutation();

    const [usersMailQuery, setUsersMailQuery] = React.useState<string>('');
    const [query, setQuery] = React.useState<string>('');
    const {data: searchedUsers} = userAPI.useSearchUsersQuery(query, {skip: !query.length});

    const setMailQuery = debounce((query) => {
        setQuery(query);
    }, 700);

    const [updateNote, {data: updatedNote}] = notesApi.useUpdateNoteMutation();
    const [setUserAccess, {}] = notesApi.useSetAccessMutation();

    const {enqueueSnackbar} = useSnackbar();

    const ref = React.useRef<MDXEditorMethods>(null);
    const summRef = React.useRef<MDXEditorMethods>(null);

    const [doc, changeDoc] = useDocument<NoteDoc>(note?.automergeUrl);
    const [accessRole, setAccessRole] = React.useState<string | null>(null);

    const [callsDetail, setCallsDetail] = React.useState<string | null>(CallsDetailEnum.AVERAGE);
    const [callUrl, setCallUrl] = React.useState<string>('');

    // TODO: ручка добавится для short polling
    // const [canSummarizeChat, setCanSummarizeChat] = React.useState<boolean>(false);

    const [checked, setChecked] = React.useState(false);

    const [infoModalIsOpen, setInfoModalIsOpen] = React.useState(false);
    const [formModalIsOpen, setFormModalIsOpen] = React.useState(false);
    const [accessRightsDialogIsOpen, setAccessRightsDialogIsOpen] = React.useState(false);

    const fetchChatSum = () => {
        getChatSum({id});
    };

    const handleFormSubmit = async () => {
        if (!!callUrl) {
            const summId = await startRecording({
                url: callUrl,
                detalization: callsDetail || CallsDetailEnum.AVERAGE,
            }).unwrap();

            attachSummary({userId: user?.id || '', noteId: id, summId});
            setFormModalIsOpen(false);
        }
        // TODO: подумать над провалом условия !!user?.id && !!callUrl
    };

    const handleChangeMd = (value: string) => {
        changeDoc((doc: NoteDoc) => {
            A.updateText(doc, ['text'], value);
        });
    };

    React.useEffect(() => {
        ref.current?.setMarkdown(typeof doc?.text === 'string' ? doc?.text || '' : doc?.text.join('') || '');
    }, [doc?.text]);

    React.useEffect(() => {
        if (chatSumData?.summ_text) {
            enqueueSnackbar('Суммаризация чата получена');
            summRef.current?.setMarkdown(chatSumData.summ_text);
        }
    }, [chatSumData?.summ_text, enqueueSnackbar]);

    React.useEffect(() => {
        if (note) {
            dispatch(setActiveNote(note));
        }
    }, [dispatch, note]);

    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef<HTMLDivElement>(null);

    const handleCopyLink = async () => await navigator.clipboard.writeText(window.location.href);

    React.useEffect(() => {
        if (note && accessRole) {
            updateNote({
                note: {
                    ...note,
                    defaultAccess:
                        CONVERT_DEFAULT_ACCESS_ROLE_MAP[(accessRole as AccessRoleEnum) || AccessRoleEnum.EMPTY],
                },
                userId: user?.id || '',
            });
        }
    }, [accessRole, note, updateNote, user?.id]);

    React.useEffect(() => {
        if (!!updatedNote) {
            enqueueSnackbar('Права на заметку обновлены');
        }
    }, [enqueueSnackbar, updatedNote]);

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event: Event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
            return;
        }

        setOpen(false);
    };

    return (
        <Stack gap={2} sx={{p: 2}}>
            <Box gap={2} display="flex" alignItems={'center'}>
                <Button variant="outlined" color="primary" onClick={fetchChatSum}>
                    Получить суммаризацию чата
                </Button>
                <Button variant="outlined" color="primary" onClick={() => setInfoModalIsOpen(true)}>
                    Привязать чат
                </Button>
                <Button variant="outlined" color="primary" onClick={() => setFormModalIsOpen(true)}>
                    Привязать звонок
                </Button>
                <ButtonGroup variant="outlined" ref={anchorRef} aria-label="Button group with a nested menu">
                    <Button onClick={() => setAccessRightsDialogIsOpen(true)}>Настройки прав доступа</Button>
                    <Button
                        size="small"
                        aria-controls={open ? 'split-button-menu' : undefined}
                        aria-expanded={open ? 'true' : undefined}
                        aria-label="select merge strategy"
                        aria-haspopup="menu"
                        onClick={handleToggle}
                    >
                        <ArrowDropDownIcon />
                    </Button>
                </ButtonGroup>
                <Popper
                    sx={{
                        zIndex: 1000,
                    }}
                    open={open}
                    anchorEl={anchorRef.current}
                    role={undefined}
                    transition
                    disablePortal
                >
                    {({TransitionProps, placement}) => (
                        <Grow
                            {...TransitionProps}
                            style={{
                                transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                            }}
                        >
                            <Paper>
                                <ClickAwayListener onClickAway={handleClose}>
                                    <MenuList id="split-button-menu" autoFocusItem>
                                        <MenuItem key={'link'} onClick={handleCopyLink}>
                                            <LinkIcon sx={{mr: 2}} />
                                            <Typography>Копировать ссылку</Typography>
                                        </MenuItem>
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                </Popper>

                <Dialog
                    open={accessRightsDialogIsOpen}
                    onClose={() => setAccessRightsDialogIsOpen(false)}
                    aria-labelledby="zoom-alert-dialog-title"
                    aria-describedby="zoom-alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">Доступ к заметке {note?.title || ''}</DialogTitle>
                    <DialogContent>
                        <Stack gap={2} marginTop={0.5}>
                            <TextField
                                type="text"
                                margin="dense"
                                id="email"
                                label="Почта пользователя"
                                size="small"
                                variant="outlined"
                                fullWidth
                                value={usersMailQuery}
                                onChange={(e) => {
                                    setUsersMailQuery(e.target.value);
                                    setMailQuery(e.target.value);
                                }}
                            />

                            <List>
                                {searchedUsers?.map(({id, email}, idx) => (
                                    <ListItem key={idx}>
                                        <Box
                                            onClick={() =>
                                                setUserAccess({
                                                    userID: id,
                                                    noteID: note?.id || '',
                                                    access: {
                                                        withInvitation: checked,
                                                        access: CONVERT_DEFAULT_ACCESS_ROLE_MAP[
                                                            (accessRole as AccessRoleEnum) || AccessRoleEnum.EMPTY
                                                        ],
                                                    },
                                                })
                                            }
                                        >
                                            {email}
                                        </Box>
                                    </ListItem>
                                )) || null}
                            </List>

                            <Box display={'flex'} alignItems={'center'}>
                                <Checkbox checked={checked} onChange={(state) => setChecked(state.target.checked)} />
                                <Typography>Отправить приглашение на почту</Typography>
                            </Box>

                            <Box display={'flex'} alignItems={'center'} gap={2}>
                                <Typography variant={'subtitle1'}>Всем, у кого есть ссылка</Typography>
                                <Autocomplete
                                    options={AccessRole.filter((_, idx) => idx <= 2)}
                                    value={accessRole}
                                    onChange={(_, newValue) => {
                                        setAccessRole(newValue);
                                    }}
                                    sx={{minWidth: 150}}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Роль" variant={'standard'} size="small" />
                                    )}
                                />
                            </Box>
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCopyLink}>Копировать ссылку</Button>
                        <Button onClick={() => setAccessRightsDialogIsOpen(false)}>Закрыть</Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={infoModalIsOpen}
                    onClose={() => setInfoModalIsOpen(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">Привязать телеграм-чат</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            1. Добавьте бота @ArchipelagoSummarizer_bot в Ваш телеграм-чат
                            <br /> &#09; Нажмите на название чата, затем на кнопку &quot;Добавить&quot; и вставьте имя
                            бота
                            <br /> 2. Введите в чат /config {id}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button color={'secondary'} onClick={() => setInfoModalIsOpen(false)}>
                            Закрыть
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={formModalIsOpen}
                    onClose={() => setFormModalIsOpen(false)}
                    aria-labelledby="zoom-alert-dialog-title"
                    aria-describedby="zoom-alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">Привязать звонок к заметке</DialogTitle>
                    <DialogContent>
                        <Stack gap={3} marginTop={0.5}>
                            <TextField
                                type="text"
                                margin="dense"
                                id="zoom-url"
                                label="Ссылка на конференцию"
                                size="small"
                                variant="outlined"
                                fullWidth
                                value={callUrl}
                                onChange={(e) => {
                                    setCallUrl(e.target.value);
                                }}
                            />
                            <Autocomplete
                                options={CallsDetail}
                                value={callsDetail}
                                onChange={(_, newValue) => {
                                    setCallsDetail(newValue);
                                }}
                                sx={{width: 300}}
                                renderInput={(params) => (
                                    <TextField {...params} label="Степень детализации звонка" size="small" />
                                )}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button color={'secondary'} onClick={() => setFormModalIsOpen(false)}>
                            Закрыть
                        </Button>
                        <LoadingButton
                            loading={isAttachingSummary || isLoadingStartRecording}
                            color={'secondary'}
                            onClick={handleFormSubmit}
                        >
                            Подтвердить
                        </LoadingButton>
                    </DialogActions>
                </Dialog>
            </Box>

            <CallSummariesList noteId={id} />

            <MDXEditor
                ref={ref}
                className="dark-theme dark-editor"
                placeholder="Введите текст сюда"
                markdown={typeof doc?.text === 'string' ? doc?.text || '' : doc?.text.join('') || ''}
                onChange={(md) => handleChangeMd(md)}
                plugins={[
                    imagePlugin({
                        imageUploadHandler: (image) => {
                            return Promise.resolve(image.name);
                        },
                    }),
                    headingsPlugin(),
                    listsPlugin(),
                    quotePlugin(),
                    tablePlugin(),
                    thematicBreakPlugin(),
                    markdownShortcutPlugin(),
                    diffSourcePlugin({viewMode: 'rich-text'}),
                    toolbarPlugin({
                        toolbarContents: () => (
                            <DiffSourceToggleWrapper>
                                <UndoRedo />
                                <BoldItalicUnderlineToggles />
                                <BlockTypeSelect />
                                <ListsToggle />
                                <InsertImage />
                            </DiffSourceToggleWrapper>
                        ),
                    }),
                ]}
            />
        </Stack>
    );
}

export default Note;
