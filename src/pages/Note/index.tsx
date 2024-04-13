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
import { useParams } from 'react-router-dom';
import {
    BlockTypeSelect,
    BoldItalicUnderlineToggles,
    Cell,
    createRootEditorSubscription$,
    currentSelection$,
    diffSourcePlugin,
    DiffSourceToggleWrapper,
    editorInFocus$,
    headingsPlugin,
    imagePlugin,
    InsertImage,
    insertMarkdown$,
    listsPlugin,
    ListsToggle,
    markdownShortcutPlugin,
    MDXEditor,
    MDXEditorMethods,
    quotePlugin,
    Realm,
    realmPlugin,
    rootEditor$,
    setMarkdown$,
    Signal,
    tablePlugin,
    thematicBreakPlugin,
    toolbarPlugin,
    UndoRedo,
    useCellValue,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import { getZoomSum, produceZoomJoin } from '../../api/zoom';
import { getChatSum } from '../../api/chat';
import { Note as NoteType, NoteDoc, Role } from '../../types/notes';
import { getNote } from '../../api/notes';
import { useDocument } from '@automerge/automerge-repo-react-hooks';
import { AnyDocumentId } from '@automerge/automerge-repo';
import { getRandomNumber } from '../../utils/generate-numbers';
import * as A from '@automerge/automerge/next';
import {
    $getSelection,
    $isRangeSelection,
    EditorState,
    RootNode,
    createCommand,
    $setSelection,
    BaseSelection,
    LexicalCommand,
} from 'lexical';

const position$ = Cell<BaseSelection | undefined | 5>(undefined);
// const SET_POSITION_COMMAND: LexicalCommand<BaseSelection> = createCommand();
const set_postition_signal$ = Signal<BaseSelection | undefined>();

/*const PostitionPlugin = realmPlugin<BaseSelection | undefined>({
    init: (realm, selection) => {
        realm.pub(createRootEditorSubscription$, (editor) => {
            return editor.registerUpdateListener((e) => {
                const selection = editor.getEditorState()._selection?.clone();

                console.log(selection);

                realm.pubIn({
                    [position$]: selection,
                });

                console.log('position$');
                console.log('position$ aaa', realm.getValue(position$), 'aaa');
            });
        });
        realm.pub(createRootEditorSubscription$, (editor) => {
            return editor.registerCommand(
                SET_POSITION_COMMAND,
                (pos, editor) => {
                    editor.update(() => {
                        if (pos) {
                            $setSelection(pos);
                        }
                    });
                    return true;
                },
                4,
            );
        });

        realm.pub(createRootEditorSubscription$, (editor) => {
            return realm.sub(set_postition_signal$, (pos) => {
                editor.update(() => {
                    if (pos) {
                        $setSelection(pos);
                    }
                });
            });
        });
    },
    update: (realm, pos) => {
        realm.pub(set_postition_signal$, pos);
    },
});*/

const PosPlugin = (
    pos: BaseSelection | undefined,
    setPos: React.Dispatch<React.SetStateAction<BaseSelection | undefined>>,
) => {
    //let set_postition_signal$: typeof Signal<BaseSelection | undefined>;
    //const r = new Realm();
    return realmPlugin<BaseSelection | undefined>({
        init: (realm, selection) => {
            // set_postition_signal$ = Signal<BaseSelection | undefined>();
            realm.pub(createRootEditorSubscription$, (editor) => {
                return editor.registerUpdateListener((e) => {
                    const selection = editor.getEditorState()._selection?.clone();

                    console.log(selection);

                    realm.pubIn({
                        [position$]: selection,
                        [set_postition_signal$]: Signal<BaseSelection | undefined>(),
                    });
                    setPos(selection);

                    console.log('position$');
                    console.log('position$ aaa', realm.getValue(position$), 'aaa');
                });
            });
            /*realm.pub(createRootEditorSubscription$, (editor) => {
                return editor.registerCommand(
                    SET_POSITION_COMMAND,
                    (pos, editor) => {
                        editor.update(() => {
                            if (pos) {
                                $setSelection(pos);
                            }
                        });
                        return true;
                    },
                    4,
                );
            });*/
            realm.sub(set_postition_signal$, console.log);

            realm.pub(createRootEditorSubscription$, (editor) => {
                return realm.sub(set_postition_signal$, (pos) => {
                    console.log('EDITOR update1', pos);
                    editor.update(() => {
                        console.log('EDITOR update');
                        if (pos) {
                            $setSelection(pos);
                        }
                    });
                });
            });
        },
        update: (realm, pos) => {
            console.log('update pos', pos);
            //r.sub(set_postition_signal$, console.log);
            realm.pub(set_postition_signal$, pos);
            //r.sub(set_postition_signal$, console.log);
            console.log('set_postition_signal$', realm.getValue(set_postition_signal$));
        },
    })(pos);
};

function Note() {
    const { id = '' } = useParams();

    const ref = React.useRef<MDXEditorMethods>(null);

    //const rootEditor = useCellValue(rootEditor$);
    // const editor = rootEditor$;
    const [pos, setPos] = React.useState<BaseSelection | undefined>();
    console.log('Pos', pos);

    //const posCell = useCellValue(position$);
    //console.log('posCell', posCell);

    //const curSel = useCellValue(currentSelection$);
    //console.log('currentSelection$', curSel);

    const [note, setNote] = React.useState<NoteType | undefined>(undefined);
    const [role, setRole] = React.useState<string | null>('обычный');
    const [doc, changeDoc] = useDocument<NoteDoc>(note?.automerge_url as AnyDocumentId);
    const [sum, setSum] = React.useState<string>('');
    const [infoModalIsOpen, setInfoModalIsOpen] = React.useState(false);
    const [formModalIsOpen, setFormModalIsOpen] = React.useState(false);
    const [userId] = React.useState<string>(String(getRandomNumber(1, 100)));
    const [zoomUrl, setZoomUrl] = React.useState<string>('');

    console.log(doc);

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
        getNote({ id }).then((noteData) => {
            setNote(noteData.data);
        });
    }, [id, setNote]);

    React.useEffect(() => {
        const intervalId = setInterval(() => {
            if (userId && zoomUrl && !!note) {
                fetchZoomGetSum(userId, role || 'обычный').then((text) => {
                    if (text) {
                        setSum(text);
                    }
                });
            }
        }, 20000);

        return () => clearInterval(intervalId);
    }, [fetchZoomGetSum, note, role, userId, zoomUrl]);

    React.useEffect(() => {
        console.log(doc);
        const oldPos = pos;
        console.log('oldPos', oldPos);
        // console.log('posCell', posCell);
        ref.current?.setMarkdown(typeof doc?.text === 'string' ? doc?.text || '' : doc?.text.join('') || '');
        setPos(oldPos);
    }, [doc?.text]);

    // React.useEffect(() => {
    //     ref.current?.setMarkdown(`${note?.title || ''}<br></br>${doc?.text ? doc?.text.join('') : ''}`);
    // }, [note?.title]);

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

    // console.log('editor:', rootEditor);
    // console.log('selection: ', $getSelection());

    return (
        <Stack gap={2} sx={{ p: 2 }}>
            <Box gap={2} display="flex" alignItems={'center'}>
                <Button variant="outlined" color="secondary" onClick={fetchChatSum}>
                    Получить суммаризацию чата
                </Button>
                <Button variant="outlined" color="secondary" onClick={() => setInfoModalIsOpen(true)}>
                    Получить токен заметки
                </Button>
                <Button variant="outlined" color="secondary" onClick={() => setFormModalIsOpen(true)}>
                    Привязать звонок к заметке
                </Button>
                <Autocomplete
                    defaultValue={'обычный'}
                    options={Role}
                    value={role}
                    onChange={(_, newValue) => {
                        setRole(newValue);
                    }}
                    renderInput={(params) => <TextField {...params} label="Роль" size="small" />}
                />

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
                            <br /> Затем напишите `/config {id}`
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
                    PosPlugin(pos, setPos),
                    diffSourcePlugin({ viewMode: 'rich-text' }),
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
