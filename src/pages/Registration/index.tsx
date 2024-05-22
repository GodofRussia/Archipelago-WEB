import React from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {Alert, Box, Card, CardContent, CardHeader, Stack, styled, TextField, Typography} from '@mui/material';
import {authApi} from '../../services/AuthService';
import {userAPI} from '../../services/UserService';
import {useAppDispatch, useAppSelector} from '../../hooks/useRedux';
import {dirsApi} from '../../services/DirsService';
import {setUser} from '../../store/reducers/UserSlice';
import {Field, FieldProps, Form, Formik} from 'formik';
import * as Yup from 'yup';
import Tooltip from '@mui/material/Tooltip';
import {LoadingButton} from '@mui/lab';
import {FetchBaseQueryError} from '@reduxjs/toolkit/query';

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

interface RegistrationFormValues {
    email: string;
    name: string;
    password: string;
    confirmPassword: string;
}

function Registration() {
    const [userId, setUserId] = React.useState<string | null>(null);

    const dispatch = useAppDispatch();
    const {user: currUser} = useAppSelector((store) => store.userReducer);
    const navigate = useNavigate();

    const [
        register,
        {data: userData, isLoading: isLoadingRegistration, isError: isErrorRegistration, error: registrationError},
    ] = authApi.useRegistrationMutation();

    const {
        data: user,
        isLoading: isLoadingUser,
        isError: isErrorUser,
    } = userAPI.useGetUserQuery(userId || '', {skip: userId === null});

    const [createRootDir, {data: rootDir, isLoading: isLoadingRootDir, isError: isErrorRootDir}] =
        dirsApi.useCreateDirMutation();

    const [setUserRootDir, {isLoading: isLoadingSetting, isError: isErrorSetting}] =
        userAPI.useSetUserRootDirMutation();

    const validationSchema = Yup.object().shape({
        email: Yup.string()
            .email('Пожалуйста, проверьте, правильно ли указан адрес')
            .required('Необходимо указать почту'),
        name: Yup.string().required('Необходимо указать имя'),
        password: Yup.string()
            .required('Необходимо придумать пароль')
            .matches(
                /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/,
                'Пароль должен содержать как минимум 8 символов, включая одну прописную букву, одну строчную букву, одну цифру и один специальный символ',
            ),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password')], 'Пароли должны совпадать')
            .required('Пожалуйста, подтвердите ваш пароль'),
    });

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

    const isErrorSomeRegistrationStep = isErrorRegistration || isErrorUser || isErrorRootDir || isErrorSetting;

    return (
        <Formik
            initialValues={{email: '', name: '', password: '', confirmPassword: ''}}
            validationSchema={validationSchema}
            onSubmit={(values: RegistrationFormValues) => {
                register({email: values.email, name: values.name, password: values.password});
            }}
        >
            {({errors, touched}) => (
                <Form>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100vh',
                            width: '100vw',
                        }}
                    >
                        <Card sx={{width: '375px', backgroundColor: 'transparent', boxShadow: 'unset'}}>
                            <CardHeader sx={{color: 'rgba(0, 0, 0, 0.87)', pb: 0}} title="Регистрация" />
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
                                    {isErrorSomeRegistrationStep && (
                                        <Alert sx={{color: 'white'}} severity={'error'} variant={'filled'}>
                                            <Stack>
                                                <Typography variant={'body1'}>
                                                    {isErrorSomeRegistrationStep &&
                                                        ((
                                                            (registrationError as FetchBaseQueryError)?.data as {
                                                                error: string;
                                                            }
                                                        )?.error?.includes('User exist')
                                                            ? 'Пользователь уже существует'
                                                            : 'Технические неполадки')}
                                                </Typography>

                                                <Typography variant={'body2'}>
                                                    {isErrorSomeRegistrationStep &&
                                                        ((
                                                            (registrationError as FetchBaseQueryError)?.data as {
                                                                error: string;
                                                            }
                                                        )?.error?.includes('User exist')
                                                            ? 'Проверьте правильность введенных данных'
                                                            : 'Попробуйте войти позже')}
                                                </Typography>
                                            </Stack>
                                        </Alert>
                                    )}

                                    <Field name="email">
                                        {({field}: FieldProps<string, RegistrationFormValues>) => (
                                            <StyledTextField
                                                {...field}
                                                label="Почта"
                                                variant="outlined"
                                                error={(errors.email && touched.email) || isErrorSomeRegistrationStep}
                                                helperText={
                                                    errors.email && touched.email ? errors.email : <div>&nbsp;</div>
                                                }
                                            />
                                        )}
                                    </Field>

                                    <Field name="name">
                                        {({field}: FieldProps<string, RegistrationFormValues>) => (
                                            <StyledTextField
                                                {...field}
                                                label="Имя пользователя"
                                                variant="outlined"
                                                error={(errors.name && touched.name) || isErrorSomeRegistrationStep}
                                                helperText={
                                                    errors.name && touched.name ? errors.name : <div>&nbsp;</div>
                                                }
                                            />
                                        )}
                                    </Field>
                                    <Field name="password">
                                        {({field}: FieldProps<string, RegistrationFormValues>) => (
                                            <StyledTextField
                                                {...field}
                                                type="password"
                                                label="Придумайте пароль"
                                                variant="outlined"
                                                error={
                                                    (errors.password && touched.password) || isErrorSomeRegistrationStep
                                                }
                                                helperText={
                                                    <Tooltip title={errors.password} arrow>
                                                        <div
                                                            style={{
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                maxWidth: '100%',
                                                            }}
                                                        >
                                                            {errors.password && touched.password ? (
                                                                errors.password
                                                            ) : (
                                                                <div>&nbsp;</div>
                                                            )}
                                                        </div>
                                                    </Tooltip>
                                                }
                                            />
                                        )}
                                    </Field>

                                    <Field name="confirmPassword">
                                        {({field}: FieldProps<string, RegistrationFormValues>) => (
                                            <StyledTextField
                                                {...field}
                                                type="password"
                                                label="Введите пароль повторно"
                                                variant="outlined"
                                                error={
                                                    (!!errors.confirmPassword && touched.confirmPassword) ||
                                                    isErrorSomeRegistrationStep
                                                }
                                                helperText={
                                                    errors.confirmPassword && touched.confirmPassword ? (
                                                        errors.confirmPassword
                                                    ) : (
                                                        <Box sx={{height: '16px'}}>&nbsp;</Box>
                                                    )
                                                }
                                            />
                                        )}
                                    </Field>

                                    <LoadingButton
                                        loading={
                                            isLoadingRegistration ||
                                            isLoadingUser ||
                                            isLoadingRootDir ||
                                            isLoadingSetting
                                        }
                                        variant="contained"
                                        color="primary"
                                        type="submit"
                                        sx={{
                                            minWidth: '343px',
                                            '& .MuiLoadingButton-loadingIndicator': {
                                                color: 'black',
                                            },
                                        }}
                                    >
                                        Зарегистрироваться
                                    </LoadingButton>
                                    <Typography
                                        component={Link}
                                        to="/login"
                                        sx={{textDecoration: 'none', color: 'black'}}
                                    >
                                        Войти в аккаунт
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                </Form>
            )}
        </Formik>
    );
}

export default Registration;
