import {useState} from 'react';
import {Link} from 'react-router-dom';
import {Box, Card, CardHeader, CardContent, TextField, Button} from '@mui/material';
import {loginRequest} from '../../api/auth';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const response = await loginRequest(email, password);
            console.log('Login response:', response.data);
        } catch (error) {
            console.error('Login request error:', error);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
            }}
        >
            <Card sx={{height: '55vh', width: '33vw'}}>
                <CardHeader
                    sx={{marginTop: '7%'}}
                    title="Войти в аккаунт"
                    subheader="Для использования всех функций сервиса"
                />
                <CardContent>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            gap: 4,
                        }}
                    >
                        <TextField
                            label="Почта"
                            variant="outlined"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            label="Пароль"
                            type="password"
                            variant="outlined"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button variant="contained" color="primary" onClick={handleLogin}>
                            Войти
                        </Button>
                        <Button sx={{marginTop: '-5%'}} component={Link} to="/registration">
                            Зарегистрироваться
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}

export default Login;
