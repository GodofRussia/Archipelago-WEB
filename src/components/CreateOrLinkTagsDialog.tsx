import React from 'react';
import {
    Autocomplete,
    Box,
    Button,
    ButtonGroup,
    Dialog,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
} from '@mui/material';
import {tagsApi} from '../services/TagsService';
import {useAppSelector} from '../hooks/useRedux';
import {useSnackbar} from 'notistack';
import {Tag} from '../types/tags';
import {LoadingButton} from '@mui/lab';
import Tooltip from '@mui/material/Tooltip';

type DialogType = 'suggest' | 'only_link';

interface CreateOrLinkTagsDialogProps {
    noteId: string;
    isOpen: boolean;
    onClose: () => void;
    type: DialogType;
}

const CreateOrLinkTagsDialog = ({isOpen, type, onClose, noteId}: CreateOrLinkTagsDialogProps) => {
    const {user} = useAppSelector((state) => state.userReducer);

    // Active tag to link DialogType = 'only_link'
    const {activeTag} = useAppSelector((state) => state.tagsReducer);
    const {enqueueSnackbar} = useSnackbar();

    const [tagValues, setTagValues] = React.useState<Tag[]>([]);
    const [inputValue, setInputValue] = React.useState<string>('');
    const [searchTagsByName, {data: searchedTags}] = tagsApi.useClosestTagsMutation();
    const [suggestTagNames, {isLoading: isLoadingSuggest}] = tagsApi.useSuggestTagNamesMutation();
    const [createAndLinkTag, {isLoading: isLoadingCreation}] = tagsApi.useCreateAndLinkTagMutation();
    const [linkTagToTag, {isLoading: isLoadingLinking}] = tagsApi.useLink2TagsMutation();

    const handleCreateAndLinkTags = async () => {
        const promises = tagValues.map((tag) => {
            if (type === 'suggest') {
                return createAndLinkTag({name: tag.name, note_id: noteId, userId: user?.id || ''}).unwrap();
            }

            return linkTagToTag({tag1_id: activeTag?.id || '', tag2_id: tag.id, userId: user?.id || ''});
        });

        try {
            const results = await Promise.allSettled(promises);

            const success = results
                .filter((result): result is PromiseFulfilledResult<Tag> => result.status === 'fulfilled')
                .map((result) => result.value.name);

            const failures = results
                .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
                .map((result) => result.reason.data?.error || '');

            if (success.length > 0) {
                enqueueSnackbar(`Успешно ${type === 'suggest' ? 'созданы' : 'связаны'} теги: ${success.join(', ')}`, {
                    variant: 'success',
                });
            }
            if (failures.length > 0) {
                enqueueSnackbar(
                    `Ошибка при ${type === 'suggest' ? 'создании' : 'связывании'} тегов: ${failures.join(', ')}`,
                    {variant: 'error'},
                );
            }
        } catch {
            enqueueSnackbar(`Ошибка во время ${type === 'suggest' ? 'создании' : 'связывании'} тегов`, {
                variant: 'error',
            });
        }
    };

    const handleSuggestTags = async () => {
        try {
            const suggested = await suggestTagNames({
                tags_num: 3,
                text: inputValue,
                userId: user?.id || '',
            }).unwrap();

            const newTags = suggested.tagNames.map((tagName) => ({id: tagName, name: tagName, userId: user?.id || ''}));

            setTagValues((prev) => [...prev, ...newTags]);
            setInputValue('');
        } catch {
            enqueueSnackbar('Не получилось подсказать, что-то сломалось...', {
                variant: 'error',
            });
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && inputValue) {
            if (inputValue.length < 3) {
                enqueueSnackbar('Длина тега должна быть больше 3 символов', {
                    variant: 'error',
                });

                return;
            }

            if (!tagValues.map((tag) => tag.name).includes(inputValue)) {
                setTagValues([
                    ...tagValues,
                    {
                        id: inputValue,
                        name: inputValue,
                        userId: user?.id || '',
                    },
                ]);

                setInputValue('');
            }

            event.preventDefault();
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose}>
            <DialogTitle>{type === 'suggest' ? 'Создание и связка тегов к заметке' : 'Связка тегов'}</DialogTitle>
            <DialogContent>
                <Stack>
                    <Autocomplete
                        multiple
                        id="tags-autocomplete"
                        options={searchedTags || []}
                        getOptionLabel={(option) => option.name}
                        noOptionsText={`Не найдено тегов. Попробуйте ввести минимум 3 символа. ${type === 'suggest' ? `Нажмите 'Enter' для нового тега.` : ''}`}
                        value={tagValues}
                        filterOptions={(options) => (options.length ? options : [])}
                        filterSelectedOptions
                        onChange={(_, value) => setTagValues(value)}
                        inputValue={inputValue}
                        onInputChange={(_, newInputValue, reason) => {
                            if (reason !== 'reset') {
                                setInputValue(newInputValue);
                            }
                        }}
                        renderInput={(params) => (
                            <Box display={'flex'} flexDirection={'column'} alignItems={'flex-end'}>
                                <TextField
                                    {...params}
                                    onChange={(event) => {
                                        const {value} = event.target;
                                        if (value.length > 3) {
                                            searchTagsByName({name: value, limit: 8, userId: user?.id || ''});
                                        }
                                    }}
                                    onKeyDown={type === 'suggest' ? handleKeyDown : () => {}}
                                    variant="standard"
                                    label="Теги"
                                    disabled={isLoadingSuggest}
                                />
                                {type === 'suggest' && (
                                    <Tooltip
                                        placement={'right-end'}
                                        title={'Напишите текст в поле ввода и нажмите кнопку для генерации вариантов'}
                                    >
                                        <LoadingButton
                                            loading={isLoadingSuggest}
                                            variant="text"
                                            color="primary"
                                            onClick={handleSuggestTags}
                                            sx={{mt: 2}}
                                        >
                                            Подсказать
                                        </LoadingButton>
                                    </Tooltip>
                                )}
                            </Box>
                        )}
                    />

                    <ButtonGroup sx={{mt: 2}}>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                onClose();
                                setTagValues([]);
                                setInputValue('');
                            }}
                        >
                            Отменить создание
                        </Button>
                        <LoadingButton
                            loading={isLoadingCreation || isLoadingLinking}
                            variant="contained"
                            onClick={() => {
                                if (inputValue && !tagValues.map((tag) => tag.name).includes(inputValue)) {
                                    setTagValues([
                                        ...tagValues,
                                        {
                                            id: inputValue,
                                            name: inputValue,
                                            userId: user?.id || '',
                                        },
                                    ]);
                                    setInputValue('');
                                }

                                handleCreateAndLinkTags();
                            }}
                        >
                            {type === 'suggest' ? 'Создать и привязать теги' : 'Связать теги'}
                        </LoadingButton>
                    </ButtonGroup>
                </Stack>
            </DialogContent>
        </Dialog>
    );
};

export default CreateOrLinkTagsDialog;
