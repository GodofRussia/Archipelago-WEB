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
import {useAppDispatch, useAppSelector} from '../../hooks/useRedux';
import {dirsApi} from '../../services/DirsService';
import {setUser} from '../../store/reducers/UserSlice';
import {Formik, Form, Field, ErrorMessage} from 'formik';
import * as Yup from 'yup';

const StyledTextField = styled(TextField)(({theme}) => ({
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: theme.palette.mode !== 'dark' ? 'auto' : 'rgba(0, 0, 0, 0.87)',
        },
        '&:hover fieldset': {
            borderColor: theme.palette.mode !== 'dark' ? 'auto' : 'rgba(0, 0, 0, 0.87)',
        },
        '&.Mui-focused fieldset': {
            borderColor: theme.palette.primary.main,
        },
    },
    '& .MuiInputBase-input': {
        color: theme.palette.mode !== 'dark' ? 'auto' : 'rgba(0, 0, 0, 0.87)',
    },
    '& .MuiFormLabel-root': {
        color: theme.palette.mode !== 'dark' ? 'auto' : 'rgba(0, 0, 0, 0.87)',
        '&.Mui-focused': {
            color: theme.palette.primary.main,
        },
    },
}));

function Registration() {
    const [email, setEmail] = React.useState('');
    const [name, setName] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [userId, setUserId] = React.useState<string | null>(null);
    const [passwordError, setPasswordError] = React.useState(false);
    const [isPasswordError, setError] = React.useState<boolean>(false);

    const dispatch = useAppDispatch();
    const {user: currUser} = useAppSelector((store) => store.userReducer);
    const navigate = useNavigate();

    const [register, {data: userData, isLoading: isLoadingRegistration, isError: isErrorRegistration}] =
        authApi.useRegistrationMutation();
    const {
        data: user,
        isLoading: isLoadingUser,
        isError: isErrorUser,
    } = userAPI.useGetUserQuery(userId || '', {skip: userId === null});

    const validationSchema = Yup.object().shape({
        email: Yup.string()
            .email('Пожалуйста, проверьте, правильно ли указан адрес')
            .required('Необходимо указать почту'),
    });

    const [createRootDir, {data: rootDir, isLoading: isLoadingRootDir, isError: isErrorRootDir}] =
        dirsApi.useCreateDirMutation();

    const [setUserRootDir, {isLoading: isLoadingSetting, isError: isErrorSetting}] =
        userAPI.useSetUserRootDirMutation();

    const handleRegistration = React.useCallback(() => {
        if (confirmPassword !== password) {
            setError(true); // Set a general error state
            setPasswordError(true); // Set an error state for password fields
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
    }, [isLoadingSetting, rootDir, userData]);

    React.useEffect(() => {
        if (user) {
            dispatch(setUser(user));
        }
    }, [dispatch, user]);

    React.useEffect(() => {
        if (currUser) {
            navigate('/');
        }
    }, [currUser, navigate]);

    return (
        <Formik
            initialValues={{email: '', name: '', password: '', confirmPassword: ''}}
            validationSchema={validationSchema}
            onSubmit={handleRegistration}
        >
            {({errors, touched}) => (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '140vh',
                        width: '140vw',
                    }}
                >
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
                                <Field name="email">
                                    {({field}) => (
                                        <StyledTextField
                                            {...field}
                                            label="Почта"
                                            variant="outlined"
                                            error={errors.email && touched.email}
                                        />
                                    )}
                                </Field>
                                <ErrorMessage name="email">
                                    {(msg) => <div style={{color: 'red', fontSize: '14px'}}>{msg}</div>}
                                </ErrorMessage>

                                <Field name="name">
                                    {({field}) => (
                                        <StyledTextField
                                            {...field}
                                            label="Имя пользователя"
                                            variant="outlined"
                                            error={errors.name && touched.name}
                                        />
                                    )}
                                </Field>
                                <ErrorMessage name="name" component="div" />

                                <StyledTextField
                                    label="Пароль"
                                    type="password"
                                    variant="outlined"
                                    error={
                                        isErrorRegistration ||
                                        isErrorUser ||
                                        isErrorRootDir ||
                                        isErrorSetting ||
                                        passwordError
                                    }
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setError(false);
                                        setPasswordError(false); // Reset password error state when changing password
                                    }}
                                />

                                <StyledTextField
                                    label="Подтверждение пароля"
                                    type="password"
                                    variant="outlined"
                                    error={
                                        isErrorRegistration ||
                                        isErrorUser ||
                                        isErrorRootDir ||
                                        isErrorSetting ||
                                        passwordError
                                    }
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />

                                {passwordError && (
                                    <Typography sx={{color: 'red', fontSize: '14px'}}>Пароли не совпадают</Typography>
                                )}

                                <Button variant="contained" color="primary" type="submit" sx={{minWidth: '343px'}}>
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
            )}
        </Formik>
    );
}

export default Registration;
