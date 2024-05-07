import React from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {Box, Card, CardContent, CardHeader, styled, TextField, Typography} from '@mui/material';
import {userAPI} from '../../services/UserService';
import {authApi} from '../../services/AuthService';
import {useAppDispatch, useAppSelector} from '../../hooks/useRedux';
import {setUser} from '../../store/reducers/UserSlice';
import {LoadingButton} from '@mui/lab';
import * as Yup from 'yup';
import {Field, FieldProps, Form, Formik} from 'formik';
import Tooltip from '@mui/material/Tooltip';

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

interface LoginFormValues {
    email: string;
    password: string;
}

function Login() {
    const [userId, setUserId] = React.useState<string | null>(null);

    const dispatch = useAppDispatch();
    const currUser = useAppSelector((store) => store.userReducer.user);
    const navigate = useNavigate();

    const [login, {data: userData, isLoading: isLoadingLogin, isError: isErrorLogin}] = authApi.useLoginMutation();
    const {
        data: user,
        isLoading: isLoadingUser,
        isError: isErrorUser,
    } = userAPI.useGetUserQuery(userId || '', {skip: userId === null});

    const validationSchema = Yup.object().shape({
        email: Yup.string().required('Необходимо указать почту'),
        password: Yup.string().required('Необходимо указать пароль'),
    });

    React.useEffect(() => {
        if (userData?.userId) {
            setUserId(userData.userId);
        }
    }, [userData]);

    React.useEffect(() => {
        if (user) {
            dispatch(setUser(user));
        }
    }, [dispatch, navigate, user]);

    React.useEffect(() => {
        if (currUser) {
            navigate('/');
        }
    }, [currUser, navigate]);

    return (
        <Formik
            initialValues={{email: '', password: ''}}
            validationSchema={validationSchema}
            onSubmit={(values: LoginFormValues) => {
                login({email: values.email, password: values.password});
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
                        }}
                    >
                        <Card sx={{width: '375px', backgroundColor: 'transparent', boxShadow: 'unset'}}>
                            <CardHeader
                                sx={{color: 'rgba(0, 0, 0, 0.87)'}}
                                subheaderTypographyProps={{color: 'rgba(0, 0, 0, 0.87)', variant: 'body2'}}
                                title="Войти в аккаунт"
                                subheader="Для использования всех функций сервиса"
                            />
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
                                        {({field}: FieldProps<string, LoginFormValues>) => (
                                            <StyledTextField
                                                {...field}
                                                label="Почта"
                                                variant="outlined"
                                                error={(errors.email && touched.email) || isErrorLogin || isErrorUser}
                                                helperText={
                                                    errors.email && touched.email ? errors.email : <div>&nbsp;</div>
                                                }
                                            />
                                        )}
                                    </Field>

                                    <Field name="password">
                                        {({field}: FieldProps<string, LoginFormValues>) => (
                                            <StyledTextField
                                                {...field}
                                                type="password"
                                                label="Пароль"
                                                variant="outlined"
                                                error={
                                                    (errors.password && touched.password) || isErrorLogin || isErrorUser
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

                                    <LoadingButton
                                        loading={isLoadingLogin || isLoadingUser}
                                        variant="contained"
                                        color="primary"
                                        type={'submit'}
                                        sx={{
                                            minWidth: '343px',
                                            '& .MuiLoadingButton-loadingIndicator': {
                                                color: 'black',
                                            },
                                        }}
                                    >
                                        Войти
                                    </LoadingButton>
                                    <Typography
                                        component={Link}
                                        to="/registration"
                                        sx={{textDecoration: 'none', color: 'black'}}
                                    >
                                        Зарегистрироваться
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

export default Login;
