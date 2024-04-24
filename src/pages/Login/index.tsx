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
import {userAPI} from '../../services/UserService';
import {authApi} from '../../services/AuthService';
import {useAppDispatch} from '../../hooks/useRedux';
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

function Login() {
    const [email, setEmail] = React.useState<string>('');
    const [password, setPassword] = React.useState<string>('');
    const [userId, setUserId] = React.useState<string | null>(null);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [login, {data: userData, isLoading: isLoadingLogin, isError: isErrorLogin}] = authApi.useLoginMutation();
    const {
        data: user,
        isLoading: isLoadingUser,
        isError: isErrorUser,
    } = userAPI.useGetUserQuery(userId || '', {skip: userId === null});

    const handleLogin = React.useCallback(() => {
        login({email, password});
    }, [email, login, password]);

    React.useEffect(() => {
        if (userData?.userId) {
            setUserId(userData.userId);
        }
    }, [userData]);

    React.useEffect(() => {
        if (user) {
            dispatch(setUser(user));
            navigate('/');
        }
    }, [dispatch, navigate, user]);

    return (
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
                        <StyledTextField
                            label="Почта"
                            variant="outlined"
                            value={email}
                            error={isErrorLogin || isErrorUser}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <StyledTextField
                            label="Пароль"
                            type="password"
                            variant="outlined"
                            value={password}
                            error={isErrorLogin || isErrorUser}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button variant="contained" color="primary" onClick={handleLogin} sx={{minWidth: '343px'}}>
                            {isLoadingLogin || isLoadingUser ? <CircularProgress /> : 'Войти'}
                        </Button>
                        <Typography component={Link} to="/registration" sx={{textDecoration: 'none', color: 'black'}}>
                            Зарегистрироваться
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}

export default Login;
