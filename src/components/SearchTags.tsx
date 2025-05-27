import React from 'react';
import {Autocomplete, InputAdornment, ListItem, TextField} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import {tagsApi} from '../services/TagsService';
import {useAppDispatch, useAppSelector} from '../hooks/useRedux';
import {Tag} from '../types/tags';
import {setActiveTag} from '../store/reducers/TagsSlice';
import TagInfoDialog from './TagInfoDialog';
import {useAvoidMissingFetchingData} from '../hooks/useAvoidMissingFetchingData';
import {debounce} from 'lodash';

const SearchTags = () => {
    const {user} = useAppSelector((state) => state.userReducer);
    const dispatch = useAppDispatch();

    const [searchTagsByName, {data: closestTags, isLoading: isLoadingSearching}] = tagsApi.useClosestTagsMutation();
    const [tagDialogIsOpen, setTagDialogIsOpen] = React.useState<boolean>(false);
    const [inputValue, setInputValue] = React.useState<string>('');

    const closestTagsAvoidMissing = useAvoidMissingFetchingData({
        data: closestTags || null,
        isLoading: isLoadingSearching,
    });

    const debouncedSearch = React.useMemo(
        () =>
            debounce((input: string) => {
                if (input.length > 1) {
                    searchTagsByName({name: input, limit: 5, userId: user?.id || ''});
                }
            }, 500),
        [searchTagsByName, user?.id],
    );

    const handleTagClicked = React.useCallback(
        (tag: Tag) => {
            dispatch(setActiveTag(tag));
            setTagDialogIsOpen(true);
        },
        [dispatch],
    );

    React.useEffect(() => {
        debouncedSearch(inputValue);
    }, [inputValue, debouncedSearch]);

    return (
        <>
            <Autocomplete
                sx={{
                    minWidth: 500,
                    '.MuiAutocomplete-listbox': {
                        fontSize: '0.8rem',
                        padding: '0',
                    },
                    '.MuiAutocomplete-inputRoot': {
                        padding: '4px',
                    },
                    '.MuiOutlinedInput-root': {
                        padding: '2px',
                        fontSize: '0.875rem',
                    },
                }}
                id={'searchTags'}
                options={closestTagsAvoidMissing || []}
                filterOptions={(options) => (options.length ? options : [])}
                filterSelectedOptions
                noOptionsText={'Не найдено тегов. Попробуйте ввести минимум 2 символа.'}
                getOptionLabel={(option) => option.name}
                renderOption={(props, option) => (
                    <li {...props}>
                        <ListItem onClick={() => handleTagClicked(option)}>{option.name}</ListItem>
                    </li>
                )}
                inputValue={inputValue}
                onInputChange={(_, newInputValue, reason) => {
                    if (reason !== 'reset') {
                        setInputValue(newInputValue);
                    }
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="outlined"
                        placeholder="Введите имя тега"
                        InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ml: 1}} />
                                </InputAdornment>
                            ),
                        }}
                    />
                )}
            />

            <TagInfoDialog
                notesNeeded={true}
                handleTagClicked={handleTagClicked}
                isOpen={tagDialogIsOpen}
                onClose={() => setTagDialogIsOpen(false)}
            />
        </>
    );
};

export default SearchTags;
