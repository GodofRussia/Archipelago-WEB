import React from 'react';
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    ButtonGroup,
    ClickAwayListener,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grow,
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
import {CallsDetail, CallsDetailEnum, NoteDoc} from '../../types/notes';
import {useDocument} from '@automerge/automerge-repo-react-hooks';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import * as A from '@automerge/automerge/next';
import {useAppDispatch, useAppSelector} from '../../hooks/useRedux';
import {notesApi} from '../../services/NotesService';
import {setActiveNote, setTabType} from '../../store/reducers/NotesSlice';
import {callAPI} from '../../services/CallService';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LinkIcon from '@mui/icons-material/Link';
import ChatSumStepper from '../../components/ChatSumStepper';
import {TabType} from '../../components/Layout';
import SummariesList from '../../components/SummariesList';
import {AccessEnum} from '../../types/access';
import {FetchBaseQueryError} from '@reduxjs/toolkit/query';
import BreadCrumbs from '../../components/BreadCrumbs';
import NoteSharing from '../../components/NoteSharing';

function Note() {
    const {id = ''} = useParams();

    const {user} = useAppSelector((store) => store.userReducer);
    const {sharedNotes} = useAppSelector((store) => store.notesReducer);
    const dispatch = useAppDispatch();

    const {
        data: note,
        isError,
        error,
    } = notesApi.useGetNoteQuery(
        {
            noteId: id,
            userId: user?.id || '',
        },
        {skip: !user},
    );

    const [startRecording, {isLoading: isLoadingStartRecording}] = callAPI.useStartCallRecordingMutation();
    const [attachSummary, {isLoading: isAttachingSummary}] = notesApi.useAttachSummaryMutation();

    const ref = React.useRef<MDXEditorMethods>(null);

    const [doc, changeDoc] = useDocument<NoteDoc>(note?.automergeUrl);

    const [callsDetail, setCallsDetail] = React.useState<string | null>(CallsDetailEnum.AVERAGE);
    const [callUrl, setCallUrl] = React.useState<string>('');

    const [infoModalIsOpen, setInfoModalIsOpen] = React.useState(false);
    const [formModalIsOpen, setFormModalIsOpen] = React.useState(false);
    const [accessRightsDialogIsOpen, setAccessRightsDialogIsOpen] = React.useState(false);

    const handleFormSubmit = async () => {
        if (!!callUrl) {
            const summId = await startRecording({
                url: callUrl,
                detalization: callsDetail || CallsDetailEnum.AVERAGE,
            }).unwrap();

            attachSummary({userId: user?.id || '', noteId: id, summId});
            setFormModalIsOpen(false);
        }
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
        if (note) {
            dispatch(setActiveNote(note));
            if (sharedNotes.find(({id: noteId}) => id === noteId)) {
                dispatch(setTabType({tab: TabType.SHARED}));
            }
        }
    }, [dispatch, id, note, sharedNotes]);

    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef<HTMLDivElement>(null);

    const handleCopyLink = async () => await navigator.clipboard.writeText(window.location.href);

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event: Event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
            return;
        }

        setOpen(false);
    };

    return !isError ? (
        <>
            <BreadCrumbs />
            <Stack gap={2} sx={{p: 2}}>
                <Box gap={2} display="flex" alignItems={'center'} justifyContent={'space-between'}>
                    <Box gap={2} display="flex" alignItems={'center'}>
                        <Button
                            disabled={!note?.allowedMethods.includes(AccessEnum.attach_summary)}
                            variant="outlined"
                            color="primary"
                            onClick={() => setInfoModalIsOpen(true)}
                        >
                            Привязать чат
                        </Button>
                        <Button
                            disabled={!note?.allowedMethods.includes(AccessEnum.attach_summary)}
                            variant="outlined"
                            color="primary"
                            onClick={() => setFormModalIsOpen(true)}
                        >
                            Привязать звонок
                        </Button>
                    </Box>

                    <ButtonGroup variant="outlined" ref={anchorRef} aria-label="Button group with a nested menu">
                        <Button
                            disabled={!note?.allowedMethods.includes(AccessEnum.set_access)}
                            onClick={() => setAccessRightsDialogIsOpen(true)}
                        >
                            Поделиться заметкой
                        </Button>
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

                    <NoteSharing isOpen={accessRightsDialogIsOpen} close={() => setAccessRightsDialogIsOpen(false)} />

                    <Dialog
                        open={infoModalIsOpen}
                        onClose={() => setInfoModalIsOpen(false)}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">Привязать телеграм-чат</DialogTitle>
                        <DialogContent>
                            <ChatSumStepper noteId={id} />
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
                                    autoFocus
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
                                        <TextField
                                            {...params}
                                            label="Степень детализации звонка"
                                            InputProps={{...params.InputProps, readOnly: true}}
                                            size="small"
                                        />
                                    )}
                                    clearIcon={<></>}
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
                                Начать запись
                            </LoadingButton>
                        </DialogActions>
                    </Dialog>
                </Box>

                <SummariesList noteId={id} />

                <MDXEditor
                    ref={ref}
                    className="dark-theme dark-editor"
                    placeholder="Введите текст сюда"
                    readOnly={!note?.allowedMethods.includes(AccessEnum.update)}
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
        </>
    ) : (
        <Alert severity={'error'}>
            Ошибка получения заметки. {(error as FetchBaseQueryError).status === 403 ? 'Нет доступа к заметке.' : ''}
        </Alert>
    );
}

export default Note;
