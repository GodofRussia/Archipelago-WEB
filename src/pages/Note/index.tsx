import React from 'react';
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
import {callAPI} from '../../services/CallService';
import {chatAPI} from '../../services/ChatService';

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

    const [role, setRole] = React.useState<string | null>(RoleEnum.DEFAULT);
    const {data: callSumData} = callAPI.useGetSummarizationQuery(
        {user_id: user?.id || '', role: role || undefined},
        {
            pollingInterval: 20000,
            skip: !user,
        },
    );
    const [getChatSum, {data: chatSumData}] = chatAPI.useGetSummarizationMutation();

    const ref = React.useRef<MDXEditorMethods>(null);
    const summRef = React.useRef<MDXEditorMethods>(null);

    const [doc, changeDoc] = useDocument<NoteDoc>(note?.automergeUrl);
    const [sum, setSum] = React.useState<string>('');
    const [callsType, setCallsType] = React.useState<string | null>(CallsTypeEnum.ZOOM);
    const [callsDetail, setCallsDetail] = React.useState<string | null>(CallsDetailEnum.AVERAGE);
    const [callUrl, setCallUrl] = React.useState<string>('');
    // TODO: ручка добавится для short polling
    // const [canSummarizeChat, setCanSummarizeChat] = React.useState<boolean>(false);

    const [infoModalIsOpen, setInfoModalIsOpen] = React.useState(false);
    const [formModalIsOpen, setFormModalIsOpen] = React.useState(false);

    const fetchChatSum = () => {
        getChatSum({id});
    };

    const handleFormSubmit = () => {
        if (!!user?.id && !!callUrl) {
            startRecording({url: callUrl, user_id: user.id, detalization: callsDetail || CallsDetailEnum.AVERAGE});
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
        if (callSumData?.summ_text) {
            summRef.current?.setMarkdown(callSumData.summ_text);
        }
        if (chatSumData?.summ_text) {
            summRef.current?.setMarkdown(chatSumData.summ_text);
        }
    }, [callSumData?.summ_text, chatSumData?.summ_text]);

    React.useEffect(() => {
        if (note) {
            dispatch(setActiveNote(note));
        }
    }, [dispatch, note]);

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
                <Autocomplete
                    defaultValue={'обычный'}
                    options={Role}
                    value={role}
                    onChange={(_, newValue) => {
                        setRole(newValue);
                    }}
                    sx={{minWidth: 200}}
                    renderInput={(params) => <TextField {...params} label="Роль" size="small" />}
                />

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
                            <Autocomplete
                                defaultValue={'Zoom'}
                                options={CallsType}
                                value={callsType}
                                onChange={(_, newValue) => {
                                    setCallsType(newValue);
                                }}
                                sx={{width: 300}}
                                renderInput={(params) => <TextField {...params} label="Конференция" size="small" />}
                            />
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

            {sum && (
                <MDXEditor
                    ref={summRef}
                    className="dark-theme dark-editor"
                    placeholder="Здесь будет текст с суммаризацией"
                    markdown={sum || ''}
                    onChange={(val) => {
                        setSum(val);
                    }}
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
                    ]}
                />
            )}

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
