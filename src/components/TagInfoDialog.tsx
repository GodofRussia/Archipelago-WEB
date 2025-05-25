import React from 'react';
import {
    Box,
    CircularProgress,
    Dialog,
    DialogContent,
    IconButton,
    ListItem,
    Skeleton,
    Stack,
    Typography,
} from '@mui/material';
import {useAppSelector} from '../hooks/useRedux';
import DeleteIcon from '@mui/icons-material/Delete';
import AddLinkIcon from '@mui/icons-material/AddLink';
import List from '@mui/material/List';
import {tagsApi} from '../services/TagsService';
import EditableTitle from './EditableTitle';
import CreateOrLinkTagsDialog from './CreateOrLinkTagsDialog';
import {Tag} from '../types/tags';
import Tooltip from '@mui/material/Tooltip';
import {useNavigate} from 'react-router-dom';

interface TagInfoDialogProps {
    isOpen: boolean;
    onClose: () => void;
    handleTagClicked: (tag: Tag) => void;
    notesNeeded: boolean;
}

const TagInfoDialog = ({isOpen, onClose, handleTagClicked, notesNeeded}: TagInfoDialogProps) => {
    const {activeTag = {name: '', id: '', userId: ''}} = useAppSelector((state) => state.tagsReducer);
    const {activeNote, tab} = useAppSelector((state) => state.notesReducer);
    const {user = {id: '', email: '', name: '', rootDirId: 0}} = useAppSelector((state) => state.userReducer);
    const navigate = useNavigate();

    const {data: linkedTagsList, isLoading: isLoadingLinkedTagsList} = tagsApi.useListLinkedTagsQuery(
        {userId: user.id, tagId: activeTag.id},
        {skip: !activeTag.id || !isOpen},
    );

    const {data: linkedNotesList, isLoading: isLoadingLinkedNotesList} = tagsApi.useListTagNotesQuery(
        {userId: user.id, tagId: activeTag.id},
        {skip: !activeTag.id || !isOpen},
    );

    const [updateTag, {isLoading: isLoadingTagUpdate}] = tagsApi.useUpdateTagMutation();
    const [deleteTag, {isLoading: isLoadingDelete}] = tagsApi.useDeleteTagMutation();
    const [unlink2Tags, {isLoading: isLoadingUnlinkingTags}] = tagsApi.useUnlink2TagsMutation();
    const [unlinkTagFromNote, {isLoading: isLoadingUnlinkingFromNote}] = tagsApi.useUnlinkTagFromNoteMutation();
    const [updateTagLinkName, {isLoading: isLoadingTagLinkNameUpdating}] = tagsApi.useUpdateTagLinkNameMutation();

    const [linkTagsDialogIsOpen, setLinkTagsDialogIsOpen] = React.useState<boolean>(false);

    return (
        <Dialog open={isOpen} onClose={onClose}>
            <DialogContent sx={{minWidth: '500px'}}>
                <Stack p={2} gap={2}>
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        flexDirection="row"
                        flexGrow={1}
                    >
                        <EditableTitle
                            defaultTitle={activeTag.name}
                            onUpdateTitle={(newTitle) => {
                                updateTag({
                                    tag_id: activeTag.id,
                                    name: newTitle,
                                    userId: user.id,
                                    noteId: activeNote?.id || '',
                                });
                            }}
                            isLoading={isLoadingTagUpdate}
                            variant={'h5'}
                        />

                        <Box gap={1}>
                            <Tooltip title="Добавление связи с тегами">
                                <IconButton onClick={() => setLinkTagsDialogIsOpen(true)} sx={{alignSelf: 'flex-end'}}>
                                    <AddLinkIcon />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Удаление тега приведет к удалению всех его связей">
                                <IconButton
                                    onClick={async () => {
                                        await deleteTag({
                                            tag_id: activeTag.id,
                                            userId: user.id,
                                            noteId: activeNote?.id || '',
                                        });

                                        onClose();
                                    }}
                                    sx={{alignSelf: 'flex-end'}}
                                >
                                    {isLoadingDelete ? <CircularProgress size={20} /> : <DeleteIcon />}
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>

                    <Stack gap={1}>
                        <Typography variant="h6" color="text.primary" fontWeight={500}>
                            Список связей
                        </Typography>

                        <List sx={{flexGrow: 1, p: 0, height: 150, overflow: 'scroll', overflowY: 'scroll'}}>
                            {!isLoadingLinkedTagsList ? (
                                linkedTagsList?.map((tag) => (
                                    <ListItem
                                        key={tag.id}
                                        sx={{
                                            pl: 2,
                                            pr: 1,
                                            display: 'flex',
                                            flexGrow: 1,
                                            width: '100%',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            '&:hover': {bgcolor: 'rgba(0, 0, 0, 0.09)'},
                                        }}
                                        onClick={() => handleTagClicked(tag)}
                                    >
                                        <Typography variant="body1">{tag.name}</Typography>
                                        <Box display="flex" gap={2}>
                                            <EditableTitle
                                                defaultTitle={tag.linkName}
                                                onUpdateTitle={(newLinkName) => {
                                                    updateTagLinkName({
                                                        tag1_id: activeTag.id,
                                                        tag2_id: tag.id,
                                                        userId: user.id,
                                                        link_name: newLinkName,
                                                    });
                                                }}
                                                isLoading={isLoadingTagLinkNameUpdating}
                                                variant={'body1'}
                                            />
                                            <Tooltip title={'Отвязать тег от другого тега'}>
                                                <IconButton
                                                    onClick={(event) => {
                                                        unlink2Tags({
                                                            tag1_id: activeTag.id,
                                                            tag2_id: tag.id,
                                                            userId: user.id,
                                                        });

                                                        event.stopPropagation();
                                                    }}
                                                >
                                                    {isLoadingUnlinkingTags ? (
                                                        <CircularProgress size={24} />
                                                    ) : (
                                                        <DeleteIcon fontSize={'small'} />
                                                    )}
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </ListItem>
                                ))
                            ) : (
                                <Stack gap={1}>
                                    {Array.from(Array(5)).map((_, idx) => (
                                        <Skeleton key={idx} variant="rounded" width={400} height={36.5} />
                                    ))}
                                </Stack>
                            )}

                            {!linkedTagsList?.length && !isLoadingLinkedTagsList && (
                                <Typography pl={1} mt={1} color="text.secondary" variant="body2">
                                    Нет связанных тегов
                                </Typography>
                            )}
                        </List>
                    </Stack>

                    {notesNeeded && (
                        <Stack gap={1}>
                            <Typography variant="h6" color="text.primary" fontWeight={500}>
                                Список заметок
                            </Typography>

                            <List sx={{flexGrow: 1, p: 0, height: 150, overflow: 'scroll', overflowY: 'scroll'}}>
                                {!isLoadingLinkedNotesList ? (
                                    linkedNotesList?.map(({id, title}) => (
                                        <ListItem
                                            key={id}
                                            sx={{
                                                pl: 2,
                                                pr: 1,
                                                display: 'flex',
                                                flexGrow: 1,
                                                width: '100%',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                '&:hover': {bgcolor: 'rgba(0, 0, 0, 0.09)'},
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => {
                                                navigate(`/notes/${id}?tab=${tab}`);
                                                onClose();
                                            }}
                                        >
                                            <Typography variant="body1">{title}</Typography>

                                            <Tooltip title={'Отвязать тег от заметки'}>
                                                <IconButton
                                                    onClick={(event) => {
                                                        unlinkTagFromNote({
                                                            note_id: id,
                                                            tag_id: activeTag.id,
                                                            userId: user.id,
                                                        });

                                                        event.stopPropagation();
                                                    }}
                                                >
                                                    {isLoadingUnlinkingFromNote ? (
                                                        <CircularProgress size={20} />
                                                    ) : (
                                                        <DeleteIcon fontSize={'small'} />
                                                    )}
                                                </IconButton>
                                            </Tooltip>
                                        </ListItem>
                                    ))
                                ) : (
                                    <Stack gap={1}>
                                        {Array.from(Array(5)).map((_, idx) => (
                                            <Skeleton key={idx} variant="rounded" width={400} height={36.5} />
                                        ))}
                                    </Stack>
                                )}

                                {!linkedNotesList?.length && !isLoadingLinkedNotesList && (
                                    <Typography pl={1} mt={1} color="text.secondary" variant="body2">
                                        Нет связанных заметок
                                    </Typography>
                                )}
                            </List>
                        </Stack>
                    )}
                </Stack>

                <CreateOrLinkTagsDialog
                    noteId={activeNote?.id || ''}
                    isOpen={linkTagsDialogIsOpen}
                    onClose={() => setLinkTagsDialogIsOpen(false)}
                    type="only_link"
                />
            </DialogContent>
        </Dialog>
    );
};

export default TagInfoDialog;
