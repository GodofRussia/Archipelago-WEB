import React from 'react';
import {
    Autocomplete,
    Box,
    Button,
    ButtonGroup,
    Checkbox,
    Chip,
    debounce,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import {AccessRole, AccessRoleEnum, CONVERT_DEFAULT_ACCESS_ROLE_MAP} from '../types/notes';
import {userAPI} from '../services/UserService';
import {notesApi} from '../services/NotesService';
import {useAppSelector} from '../hooks/useRedux';
import {useSnackbar} from 'notistack';
import {User} from '../types/user';
import {FetchBaseQueryError} from '@reduxjs/toolkit/query';
import {SerializedError} from '@reduxjs/toolkit';

interface NoteSharingProps {
    isOpen: boolean;
    close: () => void;
}

const NoteSharing = ({isOpen, close}: NoteSharingProps) => {
    const {user} = useAppSelector((selector) => selector.userReducer);
    const {activeNote} = useAppSelector((selector) => selector.notesReducer);
    const {enqueueSnackbar} = useSnackbar();
    const [accessType, setAccessType] = React.useState<'default' | 'personal' | null>(null);
    const [usersValue, setUsersValue] = React.useState<User[]>([]);

    const [usersMailQuery, setUsersMailQuery] = React.useState<string>('');
    const [query, setQuery] = React.useState<string>('');
    const {data: searchedUsers} = userAPI.useSearchUsersQuery(query, {skip: !query.length});

    const setMailQuery = debounce((query) => {
        setQuery(query);
    }, 700);

    const [updateNote, {data: updatedNote}] = notesApi.useUpdateNoteMutation();
    const [setUserAccess, {}] = notesApi.useSetAccessMutation();

    const [accessRole, setAccessRole] = React.useState<string | null>(null);
    const [defaultAccessRole, setDefaultAccessRole] = React.useState<string | null>(null);
    const [checked, setChecked] = React.useState(false);

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(window.location.href);
        enqueueSnackbar('Ссылка скопирована', {variant: 'info'});
    };

    const handleSetRoleButtonClicked = () => {
        console.log(usersValue, accessType);
        if (accessType === 'personal') {
            Promise.all(
                usersValue.map(({id}) =>
                    setUserAccess({
                        userID: id,
                        noteID: activeNote?.id || '',
                        selfUserId: user?.id || '',
                        access: {
                            withInvitation: checked,
                            access: CONVERT_DEFAULT_ACCESS_ROLE_MAP[
                                (accessRole as AccessRoleEnum) || AccessRoleEnum.EMPTY
                            ],
                        },
                    }),
                ),
            ).then((data) => {
                if (data.find((e) => (e as {error: FetchBaseQueryError | SerializedError}).error)) {
                    enqueueSnackbar('Ошибка при обновлении прав', {variant: 'error'});
                } else {
                    enqueueSnackbar('Доступ успешно выдан всем пользователям', {variant: 'success'});
                }
            });
        } else if (accessType === 'default') {
            if (activeNote && defaultAccessRole) {
                updateNote({
                    note: {
                        ...activeNote,
                        defaultAccess:
                            CONVERT_DEFAULT_ACCESS_ROLE_MAP[
                                (defaultAccessRole as AccessRoleEnum) || AccessRoleEnum.EMPTY
                            ],
                    },
                    userId: user?.id || '',
                });
            }
        }
    };

    React.useEffect(() => {
        if (!!updatedNote) {
            enqueueSnackbar('Права на заметку обновлены', {variant: 'success'});
        }
    }, [enqueueSnackbar, updatedNote]);

    React.useEffect(() => {
        if (usersValue.length && !defaultAccessRole?.length) {
            setAccessType('personal');
        }

        if (defaultAccessRole?.length && !usersValue.length) {
            setAccessType('default');
        }

        if (!usersValue.length && !defaultAccessRole?.length) {
            setAccessType(null);
        }
    }, [defaultAccessRole?.length, usersValue]);

    return (
        <Dialog
            open={isOpen}
            onClose={() => {
                close();
                setAccessType(null);
            }}
            aria-labelledby="zoom-alert-dialog-title"
            aria-describedby="zoom-alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">Доступ к заметке {activeNote?.title || ''}</DialogTitle>
            <DialogContent>
                <Stack gap={3}>
                    {accessType !== 'default' && (
                        <Stack gap={2}>
                            <Box display={'flex'} alignItems={'center'} gap={2} justifyContent={'space-between'}>
                                <Autocomplete
                                    multiple
                                    id="tags-standard"
                                    options={
                                        searchedUsers?.filter(
                                            ({id}) => !usersValue.find(({id: userID}) => userID === id),
                                        ) || []
                                    }
                                    getOptionLabel={(option) => option.email}
                                    onChange={(_, newValue) => {
                                        setUsersValue(newValue);
                                    }}
                                    filterSelectedOptions
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, index) => (
                                            <Stack key={index}>
                                                <Chip
                                                    variant="outlined"
                                                    label={option.email}
                                                    {...getTagProps({index})}
                                                />
                                            </Stack>
                                        ))
                                    }
                                    sx={{
                                        flexGrow: 1,
                                        '& .chipsContainer': {
                                            maxHeight: '120px',
                                            overflow: 'auto',
                                        },
                                    }}
                                    value={usersValue}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            variant="standard"
                                            value={usersMailQuery}
                                            onChange={(event) => {
                                                setUsersMailQuery(event.target.value);
                                                setMailQuery(event.target.value);
                                            }}
                                            label="Почта пользователя"
                                        />
                                    )}
                                />
                                {!!usersValue.length && (
                                    <Autocomplete
                                        options={AccessRole}
                                        value={accessRole}
                                        onChange={(_, newValue) => {
                                            setAccessRole(newValue);
                                        }}
                                        sx={{minWidth: 150}}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Роль"
                                                InputProps={{...params.InputProps, readOnly: true}}
                                                variant={'standard'}
                                                size="small"
                                            />
                                        )}
                                        clearIcon={<></>}
                                    />
                                )}
                            </Box>

                            {!!usersValue.length && (
                                <Box display={'flex'} alignItems={'center'}>
                                    <Checkbox
                                        checked={checked}
                                        onChange={(state) => setChecked(state.target.checked)}
                                    />
                                    <Typography>Отправить приглашение на почту</Typography>
                                </Box>
                            )}
                        </Stack>
                    )}

                    {accessType !== 'personal' && (
                        <Box display={'flex'} alignItems={'center'} gap={2}>
                            <Typography variant={'subtitle1'}>Всем, у кого есть ссылка</Typography>
                            <Autocomplete
                                options={AccessRole.filter((_, idx) => idx <= 2)}
                                value={defaultAccessRole}
                                onChange={(_, newValue) => {
                                    setDefaultAccessRole(newValue);
                                }}
                                sx={{minWidth: 150}}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Роль"
                                        InputProps={{...params.InputProps, readOnly: true}}
                                        variant={'standard'}
                                        size="small"
                                    />
                                )}
                            />
                        </Box>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions sx={{display: 'flex', gap: 3}}>
                <Button onClick={() => close()}>Закрыть</Button>
                <ButtonGroup>
                    <Button onClick={handleCopyLink}>Скопировать ссылку</Button>
                    <Button variant={'contained'} onClick={() => handleSetRoleButtonClicked()}>
                        Выдать права
                    </Button>
                </ButtonGroup>
            </DialogActions>
        </Dialog>
    );
};

export default NoteSharing;
