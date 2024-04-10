import React from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Paper,
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
import {Note as NoteType, NoteDoc} from '../../types/notes';
import {getNote} from '../../api/notes';
import {useDocument, useRepo} from '@automerge/automerge-repo-react-hooks';
import {AnyDocumentId} from '@automerge/automerge-repo';

function Note() {
    const {id = ''} = useParams();

    const repo = useRepo();

    const ref = React.useRef<MDXEditorMethods>(null);

    const [note, setNote] = React.useState<NoteType | undefined>(undefined);
    // let handle;
    // if (note?.automerge_url !== undefined) {
    //     handle = repo.find(note.automerge_url as AnyDocumentId);
    // }
    const [doc, changeDoc] = useDocument<NoteDoc>(note?.automerge_url as AnyDocumentId);
    console.log('doc', doc);
    const [sum, setSum] = React.useState<string>('');
    const [infoModalIsOpen, setInfoModalIsOpen] = React.useState(false);
    const [formModalIsOpen, setFormModalIsOpen] = React.useState(false);
    const [userId, setUserId] = React.useState<string>('');
    const [zoomUrl, setZoomUrl] = React.useState<string>('');

    const fetchZoomJoin = React.useCallback(async (url: string, userId: string) => {
        try {
            const response = await produceZoomJoin(url, userId);
            console.log(response);
            return true;
        } catch (error) {
            console.error('Error fetching data:', error);
            return false;
        }
    }, []);

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
    //
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

    const fetchZoomGetSum = React.useCallback(async (user_id: string): Promise<string | undefined> => {
        try {
            const response = await getZoomSum(user_id);
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
            const response = await getChatSum(115);
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
    }, []);

    const handleFormSubmit = React.useCallback(async () => {
        console.log(userId, zoomUrl);
        if (!!userId && !!zoomUrl) {
            await fetchZoomJoin(zoomUrl, userId);
            setFormModalIsOpen(false);
        }
    }, [fetchZoomJoin, userId, zoomUrl]);

    console.log(note?.automerge_url);

    const handleChangeMd = (value: string) => {
        changeDoc((doc: NoteDoc) => {
            console.log(doc.text);
            return (doc.text = value);
        });
    };

    React.useEffect(() => {
        getNote({id}).then((noteData) => {
            setNote(noteData.data);
            // ref.current?.setMarkdown(noteData.data.plain_text || '');
        });
    }, [id]);

    React.useEffect(() => {
        const intervalId = setInterval(() => {
            if (userId && zoomUrl && !!note) {
                fetchZoomGetSum(userId).then((text) => {
                    setSum(text || '');
                });
            }
        }, 20000);

        return () => clearInterval(intervalId);
    }, [fetchZoomGetSum, note, userId, zoomUrl]);

    React.useEffect(() => {
        ref.current?.setMarkdown(doc?.text || '');
    }, [doc]);

    return (
        <Stack gap={2} sx={{p: 2}}>
            <Box gap={2} display="flex">
                <Button variant="outlined" color="secondary" onClick={fetchChatSum}>
                    Получить суммаризацию чата
                </Button>
                <Button variant="outlined" color="secondary" onClick={() => setInfoModalIsOpen(true)}>
                    Получить токен заметки
                </Button>
                <Button variant="outlined" color="secondary" onClick={() => setFormModalIsOpen(true)}>
                    Привязать звонок к заметке
                </Button>

                <Dialog
                    open={infoModalIsOpen}
                    onClose={() => setInfoModalIsOpen(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        Токен заметки:
                        {id}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Добавьте бота @ArchipelagoSummarizer_bot в ваш tg.
                            <br /> Затем напишите `/config 115`
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
                    <DialogTitle id="alert-dialog-title">Привязать звонок ZOOM к заметке</DialogTitle>
                    <DialogContent>
                        <Stack gap={3}>
                            <TextField
                                type="text"
                                margin="dense"
                                id="zoom-url"
                                label="Ссылка на ZOOM конференцию"
                                size="small"
                                variant="outlined"
                                fullWidth
                                value={zoomUrl}
                                onChange={(e) => {
                                    setZoomUrl(e.target.value);
                                }}
                            />
                            <TextField
                                type="text"
                                margin="dense"
                                id="zoom-url"
                                label="User id"
                                size="small"
                                variant="outlined"
                                fullWidth
                                value={userId}
                                onChange={(e) => {
                                    setUserId(e.target.value);
                                }}
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

            <Paper elevation={0} dangerouslySetInnerHTML={{__html: sum || ''}} />

            <MDXEditor
                ref={ref}
                className="dark-theme dark-editor"
                placeholder="Введите текст сюда"
                markdown={doc?.text || ''}
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
