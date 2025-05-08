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
    DialogContentText,
    DialogTitle,
    Grow,
    MenuItem,
    MenuList,
    Paper,
    Popper,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import {LoadingButton} from '@mui/lab';
import {useParams} from 'react-router-dom';
import '@mdxeditor/editor/style.css';
import {CallsDetail, CallsDetailEnum} from '../../types/notes';
import {useAppDispatch, useAppSelector} from '../../hooks/useRedux';
import {notesApi} from '../../services/NotesService';
import {setActiveNote} from '../../store/reducers/NotesSlice';
import {callAPI} from '../../services/CallService';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LinkIcon from '@mui/icons-material/Link';
import ChatSumStepper from '../../components/ChatSumStepper';
import SummariesList from '../../components/SummariesList';
import {AccessEnum} from '../../types/access';
import {FetchBaseQueryError} from '@reduxjs/toolkit/query';
import BreadCrumbs from '../../components/BreadCrumbs';
import NoteSharing from '../../components/NoteSharing';
import EditorWithTagsWrapper from '../../components/EditorWithTagsWrapper';
import {Tag} from '../../types/tags';
import {tagsApi} from '../../services/TagsService';
import {setActiveTag} from '../../store/reducers/TagsSlice';
import TagInfoDialog from '../../components/TagInfoDialog';
import CreateOrLinkTagsDialog from '../../components/CreateOrLinkTagsDialog';

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

    const {data: tags, isLoading: isLoadingListTags} = tagsApi.useListTagsQuery(
        {
            noteId: id,
            userId: user?.id || '',
        },
        {skip: !user},
    );

    const [unlinkTag, {isLoading: isUnlinkingTag}] = tagsApi.useUnlinkTagFromNoteMutation();

    const [startRecording, {isLoading: isLoadingStartRecording}] = callAPI.useStartCallRecordingMutation();
    const [attachSummary, {isLoading: isAttachingSummary}] = notesApi.useAttachSummaryMutation();

    const [callsDetail, setCallsDetail] = React.useState<string | null>(CallsDetailEnum.AVERAGE);
    const [callUrl, setCallUrl] = React.useState<string>('');

    const [infoModalIsOpen, setInfoModalIsOpen] = React.useState(false);
    const [formModalIsOpen, setFormModalIsOpen] = React.useState(false);
    const [accessRightsDialogIsOpen, setAccessRightsDialogIsOpen] = React.useState(false);
    const [tagsDialogIsOpen, setTagsDialogIsOpen] = React.useState<boolean>(false);
    const [createOrLinkTagsDialogIsOpen, setCreateOrLinkTagsDialogIsOpen] = React.useState<boolean>(false);

    const handleFormSubmit = async () => {
        if (!!callUrl) {
            const summId = await startRecording({
                url: callUrl,
                detalization: callsDetail || CallsDetailEnum.AVERAGE,
            }).unwrap();

            attachSummary({userId: user?.id || '', noteId: id, summId}).then(() => {
                setIsOpenCallNotification(true);
                setFormModalIsOpen(false);
            });
        }
    };

    const [open, setOpen] = React.useState(false);
    const [isOpenCallNotification, setIsOpenCallNotification] = React.useState<boolean>(false);
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

    const handleOpenTagsDialog = React.useCallback(
        (tag: Tag) => {
            dispatch(setActiveTag(tag));
            setTagsDialogIsOpen(true);
        },
        [dispatch],
    );

    const handleOpenLinkOrCreateTagsDialog = React.useCallback(() => {
        setCreateOrLinkTagsDialogIsOpen(true);
    }, []);

    const handleUnlinkTagFromNote = React.useCallback(
        (tag: Tag) => {
            unlinkTag({userId: user?.id || '', tag_id: tag.id, note_id: id});
        },
        [id, unlinkTag, user?.id],
    );

    React.useEffect(() => {
        if (note) {
            dispatch(setActiveNote(note));
        }
    }, [dispatch, id, note, sharedNotes]);

    return !isError ? (
        <>
            <BreadCrumbs />
            <Stack
                gap={2}
                sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                }}
            >
                <Box gap={2} display="flex" alignItems={'center'} justifyContent={'space-between'}>
                    <Box gap={2} display="flex" alignItems={'center'}>
                        <Tooltip title={'Привязать чат в Telegram для получения кратких итогов из чатов'}>
                            <Button
                                disabled={!note?.allowedMethods.includes(AccessEnum.attach_summary)}
                                variant="outlined"
                                color="primary"
                                onClick={() => setInfoModalIsOpen(true)}
                            >
                                Привязать чат
                            </Button>
                        </Tooltip>

                        <Tooltip title={'Привязать онлайн-звонок для получения кратких итогов'}>
                            <Button
                                disabled={!note?.allowedMethods.includes(AccessEnum.attach_summary)}
                                variant="outlined"
                                color="primary"
                                onClick={() => setFormModalIsOpen(true)}
                            >
                                Привязать звонок
                            </Button>
                        </Tooltip>
                    </Box>

                    <ButtonGroup variant="outlined" ref={anchorRef} aria-label="Button group with a nested menu">
                        <Tooltip
                            title={
                                'Вы можете выдать общие права по ссылке или отправить приглашение пользователю по его почте'
                            }
                        >
                            <Button
                                disabled={!note?.allowedMethods.includes(AccessEnum.set_access)}
                                onClick={() => setAccessRightsDialogIsOpen(true)}
                            >
                                Поделиться заметкой
                            </Button>
                        </Tooltip>

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

                    <TagInfoDialog
                        notesNeeded={false}
                        handleTagClicked={handleOpenTagsDialog}
                        isOpen={tagsDialogIsOpen}
                        onClose={() => setTagsDialogIsOpen(false)}
                    />
                    <CreateOrLinkTagsDialog
                        noteId={id}
                        isOpen={createOrLinkTagsDialogIsOpen}
                        onClose={() => setCreateOrLinkTagsDialogIsOpen(false)}
                        type="suggest"
                    />

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
                            <Button onClick={() => setInfoModalIsOpen(false)}>Закрыть</Button>
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
                            <Button onClick={() => setFormModalIsOpen(false)}>Закрыть</Button>
                            <LoadingButton
                                loading={isAttachingSummary || isLoadingStartRecording}
                                onClick={handleFormSubmit}
                            >
                                Добавить бота
                            </LoadingButton>
                        </DialogActions>
                    </Dialog>

                    <Dialog
                        open={isOpenCallNotification}
                        onClose={() => setIsOpenCallNotification(false)}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                        fullWidth
                        maxWidth="sm"
                    >
                        <DialogTitle id="alert-dialog-title">Обратите внимание!</DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                Сейчас к в звонок вам подлючится бот и начнёт суммаризировать ваш звонок.
                                <br />
                                Пожалуйста, впустите его и выдайте все необходимые права.
                                <br />
                                <br />
                                Суммаризацию вы сможете увидеть во вкладке &quot;Управление суммаризацией&quot;
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setIsOpenCallNotification(false)} color="primary" autoFocus>
                                ОК
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>

                <SummariesList noteId={id} />

                <EditorWithTagsWrapper
                    tags={tags}
                    isLoading={isLoadingListTags}
                    isTagsDisabled={isUnlinkingTag}
                    isDisabledEditor={!note}
                    automergeUrl={note?.automergeUrl}
                    handleTagClicked={handleOpenTagsDialog}
                    handleTagUnlinked={handleUnlinkTagFromNote}
                    handleAddTagButtonClicked={handleOpenLinkOrCreateTagsDialog}
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
