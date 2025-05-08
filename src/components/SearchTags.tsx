import React from 'react';
import {Autocomplete, InputAdornment, ListItem, TextField} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import {tagsApi} from '../services/TagsService';
import {useAppDispatch, useAppSelector} from '../hooks/useRedux';
import {Tag} from '../types/tags';
import {setActiveTag} from '../store/reducers/TagsSlice';
import TagInfoDialog from './TagInfoDialog';

const SearchTags = () => {
    const {user} = useAppSelector((state) => state.userReducer);
    const dispatch = useAppDispatch();

    const [findClosestTags, {data: closestTags}] = tagsApi.useClosestTagsMutation();
    const [tagDialogIsOpen, setTagDialogIsOpen] = React.useState<boolean>(false);

    const handleTagClicked = React.useCallback(
        (tag: Tag) => {
            dispatch(setActiveTag(tag));
            setTagDialogIsOpen(true);
        },
        [dispatch],
    );

    return (
        <>
            <Autocomplete
                sx={{
                    minWidth: 500,
                    '.MuiAutocomplete-inputRoot': {
                        padding: '4px',
                    },
                    '.MuiOutlinedInput-root': {
                        padding: '2px',
                        fontSize: '0.875rem',
                    },
                }}
                id={'searchTags'}
                options={closestTags || []}
                filterOptions={(options) => (options.length ? options : [])}
                filterSelectedOptions
                noOptionsText={'Не найдено тегов. Попробуйте ввести минимум 3 символа.'}
                getOptionLabel={(option) => option.name}
                renderOption={(props, option) => (
                    <li {...props}>
                        <ListItem onClick={() => handleTagClicked(option)}>{option.name}</ListItem>
                    </li>
                )}
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
                        onChange={(event) => {
                            const newValue = event.target.value;

                            if (newValue.length > 3) {
                                findClosestTags({userId: user?.id || '', limit: 8, name: newValue});
                            }
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
