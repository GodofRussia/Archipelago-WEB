import React from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    styled,
    TextField,
    Typography,
} from '@mui/material';
import {authApi} from '../../services/AuthService';
import {userAPI} from '../../services/UserService';
import {useAppDispatch} from '../../hooks/useRedux';
import {dirsApi} from '../../services/DirsService';
import {setUser} from '../../store/reducers/UserSlice';

const StyledTextField = styled(TextField)(() => ({
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: 'rgba(0, 0, 0, 0.87)',
        },
        '&:hover fieldset': {
            borderColor: 'rgba(0, 0, 0, 0.87)',
        },
    },
    '& .MuiInputBase-input': {
        color: 'rgba(0, 0, 0, 0.87)',
    },
    '& label.Mui-focused': {
        color: 'rgba(0, 0, 0, 0.87)',
    },
    '& .MuiFormLabel-root': {
        color: 'rgba(0, 0, 0, 0.87)',
    },
}));

function Registration() {
    const [email, setEmail] = React.useState('');
    const [name, setName] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [userId, setUserId] = React.useState<string | null>(null);
    const [isPasswordError, setError] = React.useState<boolean>(false);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [register, {data: userData, isLoading: isLoadingRegistration, isError: isErrorRegistration}] =
        authApi.useRegistrationMutation();
    const {
        data: user,
        isLoading: isLoadingUser,
        isError: isErrorUser,
    } = userAPI.useGetUserQuery(userId || '', {skip: userId === null});

    const [createRootDir, {data: rootDir, isLoading: isLoadingRootDir, isError: isErrorRootDir}] =
        dirsApi.useCreateDirMutation();

    const [setUserRootDir, {isLoading: isLoadingSetting, isError: isErrorSetting}] =
        userAPI.useSetUserRootDirMutation();

    const handleRegistration = React.useCallback(() => {
        if (confirmPassword !== password) {
            setError(true);
            return;
        }
        register({email, password, name});
    }, [confirmPassword, email, name, password, register]);

    React.useEffect(() => {
        if (userData?.userId) {
            createRootDir({
                name: 'root_dir',
                parentDirId: 0,
                userId: userData?.userId,
            });
        }
    }, [createRootDir, dispatch, user, userData?.userId]);

    React.useEffect(() => {
        if (rootDir && userData?.userId) {
            setUserRootDir({
                rootDirID: rootDir.id,
                userId: userData?.userId,
            });
        }
    }, [createRootDir, dispatch, navigate, rootDir, setUserRootDir, user, userData?.userId]);

    React.useEffect(() => {
        if (rootDir && !isLoadingSetting && userData?.userId) {
            setUserId(userData.userId);
        }
    }, [isLoadingSetting, navigate, rootDir, userData]);

    React.useEffect(() => {
        if (user) {
            dispatch(setUser(user));
            navigate('/');
        }
    }, [dispatch, isLoadingSetting, navigate, rootDir, user, userData]);

    return (
        <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '140vh', width: '140vw'}}>
            <Card sx={{width: '375px', backgroundColor: 'transparent', boxShadow: 'unset'}}>
                <CardHeader sx={{color: 'rgba(0, 0, 0, 0.87)'}} title="Регистрация" />
                <CardContent>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            gap: 2,
                            textDecoration: 'none',
                        }}
                    >
                        <StyledTextField
                            label="Почта"
                            variant="outlined"
                            value={email}
                            error={isErrorRegistration || isErrorUser || isErrorRootDir || isErrorSetting}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <StyledTextField
                            label="Имя пользователя"
                            variant="outlined"
                            value={name}
                            error={isErrorRegistration || isErrorUser || isErrorRootDir || isErrorSetting}
                            onChange={(e) => {
                                setName(e.target.value);
                                setError(false);
                            }}
                        />
                        <StyledTextField
                            label="Пароль"
                            type="password"
                            variant="outlined"
                            error={
                                isErrorRegistration ||
                                isErrorUser ||
                                isPasswordError ||
                                isErrorRootDir ||
                                isErrorSetting
                            }
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError(false);
                            }}
                        />
                        <StyledTextField
                            label="Подтверждение пароля"
                            type="password"
                            variant="outlined"
                            error={
                                isErrorRegistration ||
                                isErrorUser ||
                                isPasswordError ||
                                isErrorRootDir ||
                                isErrorSetting
                            }
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleRegistration}
                            sx={{minWidth: '343px'}}
                        >
                            {isLoadingRegistration || isLoadingUser || isLoadingRootDir || isLoadingSetting ? (
                                <CircularProgress />
                            ) : (
                                'Зарегистрироваться'
                            )}
                        </Button>
                        <Typography component={Link} to="/login" sx={{textDecoration: 'none', color: 'black'}}>
                            Войти в аккаунт
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}

export default Registration;
