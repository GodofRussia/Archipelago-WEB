import React, {useEffect} from 'react';
import {
    Autocomplete,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Stack,
    TextField,
    CircularProgress,
    Card,
    CardHeader,
    CardContent,
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
import {CallsDetail, CallsDetailEnum, CallsType, CallsTypeEnum, NoteDoc, Role, RoleEnum} from '../../types/notes';
import {useDocument} from '@automerge/automerge-repo-react-hooks';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import * as A from '@automerge/automerge/next';
import {useAppDispatch, useAppSelector} from '../../hooks/useRedux';
import {notesApi} from '../../services/NotesService';
import {setActiveNote} from '../../store/reducers/DirsSlice';
import {callAPI, GetCallSummarizationResponseDto} from '../../services/CallService';
import {chatAPI} from '../../services/ChatService';
import {Summary, SummaryWithLoading} from '../../types/summary';
import {useSelector} from 'react-redux';
import axios from 'axios';
import {formatDate} from '../../utils/convert';

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
            text: response.has_summ ? (response.summ_text || '') : '', // no-lint
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
    const [attachSummary, {}] = notesApi.useAttachSummaryMutation();
    const [detachSummary, {}] = notesApi.useDetachSummaryMutation();

    const {data: summaryList} = notesApi.useListSummariesQuery(
        {
            noteId: id,
            userId: user?.id || '',
        },
        {
            skip: !user,
            pollingInterval: 20000,
        },
    );

    // const emptyStringList: string[] = []
    // const summaryIdstNonActive = useSelector(summaryList?.summaryIds || emptyStringList, (state) => )

    const [summaries, setSummaries] = React.useState<KVSummary>({});

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

                    if (id in summaries) {
                        role = summaries[id].role;
                    }

                    console.log('id:', id);
                    console.log('before callAPI.useGetSummarizationQuery');

                    fetchAndSetSumm({summ_id, role, active: ind >= summaryList.nonActiveSummaryIds.length});
                },
            );
        }

        if (summaryList) {
            const interval = setInterval(() => {
                console.log('summaries in interval:', summaries);

                summaryList.activeSummaryIds.forEach((summ_id: string) => {
                    const role = summaries[summ_id].role;
                    const loading = summaries[summ_id].loading;
                    fetchAndUpdateSumm({summ_id, role, loading});
                });
            }, 10000); // Polling interval

            return () => clearInterval(interval); // Cleanup on component unmount
        }
    }, [summaryList]);

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
    // const [getChatSum, {data: chatSumData}] = chatAPI.useGetSummarizationMutation();

    const ref = React.useRef<MDXEditorMethods>(null);
    // const summRef = React.useRef<MDXEditorMethods>(null);

    const [doc, changeDoc] = useDocument<NoteDoc>(note?.automergeUrl);
    // const [sum, setSum] = React.useState<string>('');

    // const [isSummActive, setIsSummActive] = React.useState<boolean>(false);
    //const [callsType, setCallsType] = React.useState<string | null>(CallsTypeEnum.ZOOM);
    const [callsDetail, setCallsDetail] = React.useState<string | null>(CallsDetailEnum.AVERAGE);
    const [callUrl, setCallUrl] = React.useState<string>('');

    // TODO: ручка добавится для short polling
    // const [canSummarizeChat, setCanSummarizeChat] = React.useState<boolean>(false);

    const [infoModalIsOpen, setInfoModalIsOpen] = React.useState(false);
    const [formModalIsOpen, setFormModalIsOpen] = React.useState(false);

    // const fetchChatSum = () => {
    //     getChatSum({id});
    // };

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

    const handleChangeMd = (value: string) => {
        changeDoc((doc: NoteDoc) => {
            A.updateText(doc, ['text'], value);
        });
    };

    React.useEffect(() => {
        ref.current?.setMarkdown(typeof doc?.text === 'string' ? doc?.text || '' : doc?.text.join('') || '');
    }, [doc?.text]);

    /*React.useEffect(() => {
        if (callSumData?.summ_text) {
            summRef.current?.setMarkdown(callSumData.summ_text);
        }
    }, [callSumData?.summ_text]);*/

    /*React.useEffect(() => {
        if (chatSumData?.summ_text) {
            summRef.current?.setMarkdown(chatSumData.summ_text);
        }
    }, [chatSumData?.summ_text]);*/

    React.useEffect(() => {
        if (note) {
            dispatch(setActiveNote(note));
        }
    }, [dispatch, note]);

    return (
        <Stack gap={2} sx={{p: 2}}>
            <Box gap={2} display="flex" alignItems={'center'}>
                {/* <Button variant="outlined" color="secondary" onClick={fetchChatSum}>
                    Получить суммаризацию чата
                </Button> */}
                {/* <Button variant="outlined" color="secondary" onClick={() => setInfoModalIsOpen(true)}>
                    Привязать чат
                </Button> */}
                <Button variant="outlined" color="secondary" onClick={() => setFormModalIsOpen(true)}>
                    Привязать звонок
                </Button>

                {/* <Dialog
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
                </Dialog> */}

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

            {Object.entries(summaries).map(([id, v]) => (
                <Card key={id}>
                    <div key={id} style={{margin: '10px 20px 30px 40px'}}>
                        {/* <CardHeader > */}
                        <Box gap={2} display="flex" alignItems={'center'}>
                            <div>{v.date}</div>
                            <div>{v.detalization}</div>
                            <div>{v.platform}</div>
                            <Autocomplete
                                defaultValue={'обычный'}
                                options={Role}
                                value={v.role}
                                onChange={(_, newValue) => {
                                    setRole(id)(newValue || 'обычный');
                                }}
                                sx={{minWidth: 200}}
                                renderInput={(params) => <TextField {...params} label="Роль" size="small" />}
                            />
                            <Button variant="outlined" color="secondary" onClick={handleDetachSumm(id)}>
                                Отвязать заметку
                            </Button>
                        </Box>
                        {/* </CardHeader> */}

                        <CardContent>
                            {v.text === '' ? (
                                v.loading ? (
                                    <Box sx={{display: 'flex'}}>
                                        <CircularProgress />
                                    </Box>
                                ) : (
                                    <div>Звонок слишком рано прервался</div>
                                )
                            ) : (
                                <MDXEditor
                                    //ref={summRef}
                                    className="dark-theme dark-editor"
                                    placeholder="Здесь будет текст с суммаризацией"
                                    markdown={v.text}
                                    readOnly={true}
                                    plugins={[
                                        headingsPlugin(),
                                        listsPlugin(),
                                        quotePlugin(),
                                        tablePlugin(),
                                        thematicBreakPlugin(),
                                        markdownShortcutPlugin(),
                                    ]}
                                />
                            )}
                        </CardContent>
                    </div>
                </Card>
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
