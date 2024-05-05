import React, {useEffect, useState} from 'react';
import {
    Autocomplete,
    Box,
    Button,
    ButtonGroup,
    Card,
    CardContent,
    Checkbox,
    CircularProgress,
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
    Role,
} from '../../types/notes';
import {useDocument} from '@automerge/automerge-repo-react-hooks';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import * as A from '@automerge/automerge/next';
import {useAppDispatch, useAppSelector} from '../../hooks/useRedux';
import {notesApi} from '../../services/NotesService';
import {setActiveNote} from '../../store/reducers/DirsSlice';
import {callAPI, GetCallSummarizationResponseDto} from '../../services/CallService';
import {chatAPI} from '../../services/ChatService';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LinkIcon from '@mui/icons-material/Link';
import {userAPI} from '../../services/UserService';
import {useSnackbar} from 'notistack';
import List from '@mui/material/List';
import {SummaryWithLoading} from '../../types/summary';
import axios from 'axios';
import {formatDate} from '../../utils/convert';
import {CallSummary, CallSummaryProps} from '../../components/CallSummary';

// костыль
const makeSumm = async ({summ_id, role}: {summ_id: string; role: string}) => {
    const url = 'https://archipelago.team/meeting-bots-api/get_sum';
    const method = 'POST';
    const body = {
        summ_id,
        role,
        token: import.meta.env.VITE_SERVICE_TOKEN,
    };

    return await axios({
        url,
        method,
        data: body, // Axios uses 'data' instead of 'body' for the request body
        headers: {
            'Content-Type': 'application/json', // Ensure the server knows you're sending JSON
        },
    });
};

const fetchSumm = async ({summ_id, role}: {summ_id: string; role: string | undefined}) => {
    try {
        const r = role || 'обычный';
        const resp = await makeSumm({summ_id, role: r});
        console.log(resp);
        const response: GetCallSummarizationResponseDto = resp.data;
        console.log('FIRST:', response);
        const ret = {
            platform: response.platform || '',
            date: response.date ? formatDate(response.date) : '',
            // isActive: response.is_active || false,
            // eslint-disable-next-line prettier/prettier
            text: response.has_summ ? response.summ_text || '' : '', // no-lint
            role: (response.role || '') === '' ? 'обычный' : response.role,
            detalization: response.detalization || '',
        };
        console.log('SECOND:', ret);
        return ret;
    } catch (error) {
        console.error('Error fetching data:', error);
        return undefined;
    }
};
// костыль

type KVSummary = {
    [key: string]: SummaryWithLoading;
};

function Note() {
    const {id = ''} = useParams();

    const [loading, setLoading] = useState<boolean>(true);

    const [summaries, setSummaries] = React.useState<KVSummary>({});

    useEffect(() => {
        setLoading(true);
        setSummaries({});
        setLoading(false);
    }, [id]);

    const {user} = useAppSelector((store) => store.userReducer);
    const dispatch = useAppDispatch();

    const {data: note} = notesApi.useGetNoteQuery(
        {
            noteId: id,
            userId: user?.id || '',
        },
        {skip: !user},
    );

    const [startRecording, {}] = callAPI.useStartCallRecordingMutation();
    const [stopCall, {}] = callAPI.useStopCallRecordingMutation();
    const [attachSummary, {}] = notesApi.useAttachSummaryMutation();
    const [detachSummary, {}] = notesApi.useDetachSummaryMutation();

    // const [role, setRole] = React.useState<string | null>(RoleEnum.DEFAULT);
    // const {data: callSumData} = callAPI.useGetSummarizationQuery(
    //     {user_id: user?.id || '', role: role || undefined},
    //     {
    //         pollingInterval: 20000,
    //         skip: !user,
    //     },
    // );
    const {data: summaryList} = notesApi.useListSummariesQuery(
        {
            noteId: id,
            userId: user?.id || '',
        },
        {
            skip: !user,
            pollingInterval: 8000,
        },
    );
    console.log('summary list: ', summaryList);

    // callAPI.useGetSummarizationQuery({role: undefined, summ_id: id}, {skip: !summaryList});

    // TODO: move to reducer
    useEffect(() => {
        const fetchAndSetSumm = async ({
            summ_id,
            role,
            active,
        }: {
            summ_id: string;
            role: string | undefined;
            active: boolean;
        }) => {
            const callSumData = await fetchSumm({role: role, summ_id});
            console.log('callAPI.useGetSummarizationQuery res:', callSumData);

            if (callSumData) {
                const newSum: SummaryWithLoading = active
                    ? {
                          ...callSumData,
                          loading: true,
                      }
                    : {
                          ...callSumData,
                          loading: false,
                      };

                setSummaries((prev) => ({...prev, [summ_id]: newSum}));
            }
        };

        const fetchAndUpdateSumm = async ({
            summ_id,
            role,
            loading,
        }: {
            summ_id: string;
            role: string | undefined;
            loading: boolean;
        }) => {
            const callSumData = await fetchSumm({role: role || undefined, summ_id});
            console.log('summ in fetchAndUpdateSumm: ', callSumData);
            if (callSumData) {
                const newSum: SummaryWithLoading = {
                    ...callSumData,
                    loading,
                };
                setSummaries((prev) => ({...prev, [summ_id]: newSum}));
            }
        };

        if (summaryList) {
            console.log('summaryList:', summaryList);
            [...summaryList.nonActiveSummaryIds, ...summaryList.activeSummaryIds].forEach(
                (summ_id: string, ind: number) => {
                    console.log('ind:', ind);
                    // TODO: maybe add loader
                    let role = 'обычный';

                    if (summ_id in summaries) {
                        role = summaries[summ_id].role;
                    }

                    console.log('id:', summ_id);
                    console.log('before callAPI.useGetSummarizationQuery');

                    fetchAndSetSumm({summ_id, role, active: ind >= summaryList.nonActiveSummaryIds.length});
                    console.log('after fetchAndSetSumm: %s', Object.entries(summaries));
                },
            );
        }

        if (summaryList) {
            const foo = (summaryList, summaries) => {
                summaryList.activeSummaryIds.forEach((summ_id: string) => {
                    if (summ_id in summaries) {
                        const role = summaries[summ_id].role || '';
                        const loading = summaries[summ_id].loading || false;
                        fetchAndUpdateSumm({summ_id, role, loading});
                        console.log('after fetchAndUpdateSumm: %s', Object.entries(summaries).entries());
                    }
                });
            };

            foo(summaryList, summaries);

            const interval = setInterval(foo, 3000, summaryList, summaries); // Polling interval

            return () => {
                clearInterval(interval);
                //setSummaries({});
            };
        }
    }, [summaryList, id]);

    console.log('summaries: ', summaries);

    const setRole = (id: string) => (newRole: string) => {
        const oldSum = summaries[id];
        setSummaries((prev) => ({
            ...prev,
            [id]: {
                ...oldSum,
                role: newRole,
            },
        }));
    };

    // const [role, setRole] = React.useState<string | null>(RoleEnum.DEFAULT);
    const [getChatSum, {data: chatSumData}] = chatAPI.useGetSummarizationMutation();

    const [usersMailQuery, setUsersMailQuery] = React.useState<string>('');
    const [query, setQuery] = React.useState<string>('');
    const {data: searchedUsers} = userAPI.useSearchUsersQuery(query, {skip: query.length < 3});

    console.log(query, usersMailQuery);

    const setMailQuery = debounce((query) => {
        setQuery(query);
    }, 700);

    const [updateNote, {data: updatedNote}] = notesApi.useUpdateNoteMutation();
    const [setUserAccess, {}] = notesApi.useSetAccessMutation();

    const {enqueueSnackbar} = useSnackbar();

    const ref = React.useRef<MDXEditorMethods>(null);
    const summRef = React.useRef<MDXEditorMethods>(null);

    const [doc, changeDoc] = useDocument<NoteDoc>(note?.automergeUrl);
    // const [sum, setSum] = React.useState<string>('');
    const [accessRole, setAccessRole] = React.useState<string | null>(null);

    // const [callsType, setCallsType] = React.useState<string | null>(CallsTypeEnum.ZOOM);
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
            console.log('summId:', summId);
            attachSummary({userId: user?.id || '', noteId: id, summId});
            setFormModalIsOpen(false);
        }
        // TODO: подумать над провалом условия !!user?.id && !!callUrl
    };

    const handleDetachSumm = (summId: string) => () => {
        detachSummary({userId: user?.id || '', noteId: id, summId});
        delete summaries[summId];
    };

    const handleStopSumm = (summId: string) => () => {
        stopCall({summ_id: summId});
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
                <Button variant="outlined" color="secondary" onClick={fetchChatSum}>
                    Получить суммаризацию чата
                </Button>
                <Button variant="outlined" color="secondary" onClick={() => setInfoModalIsOpen(true)}>
                    Привязать чат
                </Button>
                <Button variant="outlined" color="secondary" onClick={() => setFormModalIsOpen(true)}>
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
                            <Box display={'flex'} alignItems={'center'}>
                                <Checkbox checked={checked} onChange={(state) => setChecked(state.target.checked)} />
                                <Typography>Отправить приглашение на почту</Typography>
                            </Box>

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
                        <Button color={'primary'} onClick={handleCopyLink}>
                            Копировать ссылку
                        </Button>
                        <Button color={'primary'} onClick={() => setAccessRightsDialogIsOpen(false)}>
                            Готово
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* <Autocomplete */}
                {/*     defaultValue={'обычный'} */}
                {/*     options={Role} */}
                {/*     value={role} */}
                {/*     onChange={(_, newValue) => { */}
                {/*         setRole(newValue); */}
                {/*     }} */}
                {/*     sx={{minWidth: 200}} */}
                {/*     renderInput={(params) => <TextField {...params} label="Роль" size="small" />} */}
                {/* /> */}

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
                                defaultValue={'Средняя'}
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
                        <Button color={'secondary'} onClick={handleFormSubmit}>
                            Подтвердить
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>

            {!loading &&
                Object.entries(summaries).map(([id, v]) => (
                    <CallSummary
                        key={id}
                        summary={v}
                        id={id}
                        handleDetachSumm={handleDetachSumm(id)}
                        handleStopSumm={handleStopSumm(id)}
                        setRole={setRole(id)}
                    />
                ))}

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
