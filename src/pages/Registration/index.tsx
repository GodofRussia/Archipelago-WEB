import {useState} from 'react';
import {Link} from 'react-router-dom';
import {Box, Card, CardHeader, CardContent, TextField, Button} from '@mui/material';
import {registrationRequest} from '../../api/auth';

function Registration() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRegistration = async () => {
        try {
            const response = await registrationRequest(email, email, password);
            console.log('Registration response:', response.data);
        } catch (error) {
            console.error('Registration request error:', error);
        }
    };

    return (
        <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '140vh', width: '140vw'}}>
            <Card sx={{height: '60vh', width: '33vw'}}>
                <CardHeader sx={{marginTop: '5%'}} title="Регистрация" />
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
                        <TextField
                            label="Подтверждение пароля"
                            type="password"
                            variant="outlined"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <Button variant="contained" color="primary" onClick={handleRegistration}>
                            Зарегистрироваться
                        </Button>
                        <Button sx={{marginTop: '-5%'}} component={Link} to="/login">
                            Войти
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}

export default Registration;
