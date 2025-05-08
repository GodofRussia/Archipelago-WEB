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
import {useDocument} from '@automerge/automerge-repo-react-hooks';
import {NoteDoc} from '../types/notes';
import {useAvoidMissingFetchingData} from '../hooks/useAvoidMissingFetchingData';
import {debounce} from 'lodash';

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
    const {activeNote} = useAppSelector((state) => state.notesReducer);
    const {enqueueSnackbar} = useSnackbar();

    const [tagValues, setTagValues] = React.useState<Tag[]>([]);
    const [inputValue, setInputValue] = React.useState<string>('');

    const [searchTagsByName, {data: searchedTags, isLoading: isLoadingSearch}] = tagsApi.useClosestTagsMutation();
    const [suggestTagNames, {isLoading: isLoadingSuggest}] = tagsApi.useSuggestTagNamesMutation();

    const [createAndLinkTag, {isLoading: isLoadingCreation}] = tagsApi.useCreateAndLinkTagMutation();
    const [linkTagToTag, {isLoading: isLoadingLinking}] = tagsApi.useLink2TagsMutation();

    const [doc] = useDocument<NoteDoc>(activeNote?.automergeUrl);

    const closestTagsAvoidMissing = useAvoidMissingFetchingData({
        data: searchedTags || null,
        isLoading: isLoadingSearch,
    });

    const throttledSearch = React.useCallback(
        () =>
            debounce((input: string) => {
                if (input.length > 1) {
                    searchTagsByName({name: input, limit: 5, userId: user?.id || ''});
                }
            }, 500),
        [user?.id],
    );

    const noteText = React.useMemo(() => {
        return typeof doc?.text === 'string' ? (doc?.text as string) || '' : doc?.text.join('') || '';
    }, [doc?.text]);

    const handleCreateAndLinkTags = React.useCallback(async () => {
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
                .map((result) => result.value);

            const failures = results
                .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
                .map((result) => result.reason.data?.error || '');

            if (success.length > 0) {
                // Если пришли созданные теги, то выводим имена
                if (success.some(({name}) => !!name)) {
                    enqueueSnackbar(
                        `Успешно ${type === 'suggest' ? 'созданы' : 'связаны'} теги: ${success
                            .map(({name}) => name)
                            .filter((name) => !!name)
                            .join(', ')}`,
                        {
                            variant: 'success',
                        },
                    );
                }

                // Если при status = fulfilled пришла ошибка 409 - коллизия - надо вывести такие ошибки для юзера
                const alreadyExistsNames = results
                    .filter(
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-expect-error
                        (result) => result?.value?.error?.status === 409,
                    )
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    .map((result) => result?.value?.error?.data?.error || '');

                if (alreadyExistsNames.length > 0) {
                    enqueueSnackbar(
                        `Уже ${type === 'suggest' ? 'созданы' : 'связаны'} теги: ${alreadyExistsNames.join(', ')}`,
                        {
                            variant: 'success',
                        },
                    );
                }

                // При успешном создании удаляем values
                setTagValues((prevTags) => prevTags.filter(({name}) => !success.map(({name}) => name).includes(name)));
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
    }, [activeTag?.id, createAndLinkTag, enqueueSnackbar, linkTagToTag, noteId, tagValues, type, user?.id]);

    const handleSuggestTags = React.useCallback(async () => {
        try {
            const suggested = await suggestTagNames({
                tags_num: 1,
                text: noteText,
                userId: user?.id || '',
            }).unwrap();

            const newTags = suggested.tagNames.map((tagName) => ({
                id: tagName,
                name: tagName,
                userId: user?.id || '',
            }));

            if (newTags.some(({name}) => tagValues.map(({name}) => name).includes(name))) {
                enqueueSnackbar('Сгенерированный тег уже введен', {
                    variant: 'error',
                });

                return;
            }

            setTagValues((prev) => [...prev, ...newTags]);
            setInputValue('');
        } catch {
            enqueueSnackbar('Не получилось подсказать, что-то сломалось...', {
                variant: 'error',
            });
        }
    }, [enqueueSnackbar, noteText, suggestTagNames, tagValues, user?.id]);

    const handleKeyDown = React.useCallback(
        (event: React.KeyboardEvent) => {
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
        },
        [enqueueSnackbar, inputValue, tagValues, user?.id],
    );

    React.useEffect(() => {
        throttledSearch()(inputValue);
    }, [inputValue]);

    return (
        <Dialog open={isOpen} onClose={onClose}>
            <DialogTitle>{type === 'suggest' ? 'Создание и связка тегов к заметке' : 'Связка тегов'}</DialogTitle>
            <DialogContent>
                <Stack>
                    <Autocomplete
                        multiple
                        id="tags-autocomplete"
                        options={closestTagsAvoidMissing || []}
                        getOptionLabel={(option) => option.name}
                        noOptionsText={`Не найдено тегов. Попробуйте ввести минимум 2 символа. ${type === 'suggest' ? `Нажмите 'Enter' для нового тега.` : ''}`}
                        value={tagValues}
                        filterOptions={(options) => (options.length ? options : [])}
                        filterSelectedOptions
                        onChange={(_, value) => {
                            setTagValues(value);
                            setInputValue('');
                        }}
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
                                    onKeyDown={type === 'suggest' ? handleKeyDown : () => {}}
                                    variant="standard"
                                    label="Теги"
                                    disabled={isLoadingSuggest}
                                />
                                {type === 'suggest' && (
                                    <Tooltip placement={'right-end'} title={'Генерирует варианты по тексту заметки'}>
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

                    <ButtonGroup sx={{mt: 2, justifyContent: 'flex-end'}}>
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
                            onClick={async () => {
                                if (inputValue && !tagValues.find(({name}) => name === inputValue)) {
                                    setTagValues([
                                        ...tagValues,
                                        {
                                            name: inputValue,
                                            id: inputValue,
                                            userId: user?.id || '',
                                        },
                                    ]);
                                }

                                if (inputValue) {
                                    setInputValue('');
                                }

                                await handleCreateAndLinkTags();
                                onClose();
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
