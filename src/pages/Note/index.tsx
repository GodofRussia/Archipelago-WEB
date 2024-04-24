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
import {getZoomSum, produceZoomJoin} from '../../api/zoom';
import {getChatSum} from '../../api/chat';
import {CallsDetail, CallsType, Note as NoteType, NoteDoc, Role} from '../../types/notes';
import {getNote} from '../../api/notes';
import {useDocument} from '@automerge/automerge-repo-react-hooks';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import * as A from '@automerge/automerge/next';

function Note() {
    const {id = ''} = useParams();

    const ref = React.useRef<MDXEditorMethods>(null);
    const summRef = React.useRef<MDXEditorMethods>(null);

    const [note, setNote] = React.useState<NoteType | undefined>(undefined);
    const [role, setRole] = React.useState<string | null>('обычный');
    const [callsType, setCallsType] = React.useState<string | null>('Zoom');
    const [callsDetail, setCallsDetail] = React.useState<string | null>('Средняя');
    const [doc, changeDoc] = useDocument<NoteDoc>(note?.automergeUrl);
    const [sum, setSum] = React.useState<string>('');
    const [infoModalIsOpen, setInfoModalIsOpen] = React.useState(false);
    const [formModalIsOpen, setFormModalIsOpen] = React.useState(false);
    const [userId] = React.useState<string>('a25addc2-ec6b-4960-9779-05a846dc94fd');
    const [zoomUrl, setZoomUrl] = React.useState<string>('');
    const [canSummarizeChar, setCanSummarizeChar] = React.useState<boolean>(false);

    const fetchZoomJoin = React.useCallback(
        async (url: string, userId: string) => {
            try {
                const response = await produceZoomJoin(url, userId, callsDetail);
                console.log(response);
                return true;
            } catch (error) {
                console.error('Error fetching data:', error);
                return false;
            }
        },
        [callsDetail],
    );

    // const fetchZoomState = React.useCallback(async (userId: string): Promise<string | void> => {
    //     try {
    //         const response = await getZoomState(userId);
    //         console.log(response);
    //
    //         return response.data.state;
    //     } catch (error) {
    //         console.error('Error fetching data:', error);
    //     }
    // }, []);

    // const fetchZoomLeave = React.useCallback(async (userId: string): Promise<boolean> => {
    //     try {
    //         const response = await produceZoomLeave(userId);
    //         console.log(response);
    //
    //         return true;
    //     } catch (error) {
    //         console.error('Error fetching data:', error);
    //         return false;
    //     }
    // }, []);

    const fetchZoomGetSum = React.useCallback(async (user_id: string, role: string): Promise<string | undefined> => {
        try {
            const response = await getZoomSum(user_id, role);
            console.log(response);

            if (response.data.has_sum) {
                return response.data.summ_text;
            }

            return '';
        } catch (error) {
            console.error('Error fetching data:', error);
            return undefined;
        }
    }, []);

    const fetchChatSum = React.useCallback(async () => {
        try {
            const response = await getChatSum(id);
            console.log(response);

            if (response.data.summ_text) {
                setSum(response.data.summ_text);
                return response.data.summ_text;
            }

            return '';
        } catch (error) {
            console.error('Error fetching data:', error);
            return undefined;
        }
    }, [id]);

    const handleFormSubmit = React.useCallback(async () => {
        if (!!userId && !!zoomUrl) {
            await fetchZoomJoin(zoomUrl, userId);
            setFormModalIsOpen(false);
        }
    }, [fetchZoomJoin, userId, zoomUrl]);

    const handleChangeMd = React.useCallback(
        (value: string) => {
            changeDoc((doc: NoteDoc) => {
                A.updateText(doc, ['text'], value);
            });
        },
        [changeDoc],
    );

    React.useEffect(() => {
        getNote({id}).then((noteData) => {
            setNote(noteData);
        });
    }, [id, setNote]);

    React.useEffect(() => {
        const intervalId = setInterval(() => {
            if (userId && zoomUrl && !!note) {
                fetchZoomGetSum(userId, role || 'обычный').then((text) => {
                    console.log(text);
                    if (text) {
                        setSum(text);
                    }
                });
            }
        }, 20000);

        return () => clearInterval(intervalId);
    }, [fetchZoomGetSum, note, role, userId, zoomUrl]);

    React.useEffect(() => {
        const intervalId = setInterval(() => {
            if (userId && zoomUrl && !!note) {
                fetchZoomGetSum(userId, role || 'обычный').then((text) => {
                    console.log(text);
                    if (text) {
                        setSum(text);
                    }
                });
            }
        }, 20000);

        return () => clearInterval(intervalId);
    }, [fetchZoomGetSum, note, role, userId, zoomUrl]);

    React.useEffect(() => {
        ref.current?.setMarkdown(typeof doc?.text === 'string' ? doc?.text || '' : doc?.text.join('') || '');
    }, [doc?.text]);

    React.useEffect(() => {
        summRef.current?.setMarkdown(sum);
    }, [sum]);

    React.useEffect(() => {
        getZoomSum(userId).then(() => {
            const intervalId = setInterval(() => {
                fetchZoomGetSum(userId, role || 'обычный').then((text) => {
                    if (text) {
                        setSum(text);
                    }
                });
            }, 20000);

            return () => clearInterval(intervalId);
        });
    }, [fetchZoomGetSum, note, role, userId, zoomUrl]);

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
                                disablePortal
                                defaultValue={'Zoom'}
                                options={CallsType}
                                value={callsType}
                                onChange={(_, newValue) => {
                                    setCallsType(newValue);
                                }}
                                sx={{width: 300}}
                                renderInput={(params) => <TextField {...params} label="Конференция" size="small" />}
                                clearIcon={false}
                            />
                            <TextField
                                type="text"
                                margin="dense"
                                id="zoom-url"
                                label="Ссылка на конференцию"
                                size="small"
                                variant="outlined"
                                fullWidth
                                value={zoomUrl}
                                onChange={(e) => {
                                    setZoomUrl(e.target.value);
                                }}
                            />
                            <Autocomplete
                                disablePortal
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
                                clearIcon={false}
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
