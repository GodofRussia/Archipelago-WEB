import {Tag} from '../types/tags';
import {Box, Button, Chip, ListItem, Skeleton, Stack, Typography} from '@mui/material';
import List from '@mui/material/List';
import {AnyDocumentId} from '@automerge/automerge-repo';
import Editor from './Editor';
import React from 'react';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import CancelIcon from '@mui/icons-material/Cancel';
import Tooltip from '@mui/material/Tooltip';

interface EditorWithTagsWrapperProps {
    tags?: Tag[];
    isLoading: boolean;
    isTagsDisabled: boolean;
    automergeUrl?: AnyDocumentId;
    isDisabledEditor: boolean;
    handleAddTagButtonClicked: () => void;
    handleTagClicked: (tag: Tag) => void;
    handleTagUnlinked: (tag: Tag) => void;
}

const EditorWithTagsWrapper = ({
    tags,
    isLoading,
    isTagsDisabled,
    automergeUrl,
    isDisabledEditor,
    handleAddTagButtonClicked,
    handleTagUnlinked,
    handleTagClicked,
}: EditorWithTagsWrapperProps) => {
    const [isShortList, setIsShortList] = React.useState<boolean>(true);

    const handleShowButtonClicked = React.useCallback(() => {
        setIsShortList((prevState) => !prevState);
    }, []);

    return (
        <Stack flexGrow={1}>
            <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" p={1}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        overflow: 'hidden',
                        flexGrow: 1,
                    }}
                >
                    <List
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: 1,
                            whiteSpace: 'nowrap',
                            overflowX: 'auto',
                        }}
                    >
                        {!isLoading ? (
                            (isShortList ? tags?.slice(0, 8) : tags)?.map((tag) => (
                                <ListItem key={tag.id} sx={{p: 0, width: 'auto'}}>
                                    <Chip
                                        disabled={isTagsDisabled}
                                        label={tag.name}
                                        onClick={() => handleTagClicked(tag)}
                                        onDelete={() => handleTagUnlinked(tag)}
                                        deleteIcon={
                                            <Tooltip
                                                title={
                                                    'Отвязать тег от заметки. При единственной связи тег удалится полностью.'
                                                }
                                            >
                                                <CancelIcon />
                                            </Tooltip>
                                        }
                                    />
                                </ListItem>
                            ))
                        ) : (
                            <Skeleton variant="rounded" width={400} height={36.5} />
                        )}

                        {!tags?.length && !isLoading && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    minHeight: 32,
                                    alignItems: 'end',
                                }}
                            >
                                <Typography color="text.secondary" variant="body2">
                                    Нет привязанных тегов
                                </Typography>
                            </Box>
                        )}
                    </List>

                    {(tags?.length || 0) >= 8 && (
                        <Button
                            variant="text"
                            sx={{
                                color: 'gray',
                                borderColor: 'transparent',
                                minWidth: 'auto',
                                ml: 1,
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                },
                            }}
                            onClick={handleShowButtonClicked}
                        >
                            {isShortList ? <ArrowForwardIosIcon /> : <ArrowBackIosIcon />}
                        </Button>
                    )}
                </Box>

                <Button
                    sx={{minWidth: 150, ml: 2}}
                    color="primary"
                    variant="contained"
                    onClick={() => handleAddTagButtonClicked()}
                >
                    Добавить теги
                </Button>
            </Box>

            <Editor automergeUrl={automergeUrl} isDisabled={isDisabledEditor} />
        </Stack>
    );
};

export default EditorWithTagsWrapper;
