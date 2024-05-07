import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import {Facebook, Instagram, Telegram, Twitter} from '@mui/icons-material';
import {Box} from '@mui/material';

export default function Footer() {
    return (
        <Box
            sx={{
                backgroundColor: 'rgb(23, 23, 23)',
                p: 6,
                position: 'relative',
                boxShadow: '0px -20px 20px rgba(0, 0, 0, 0.3)',
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={5}>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" color="text.primary" gutterBottom>
                            О нас
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Мы команд yavka, мы делаем наш сервис, чтобы ваша работа в команде стала удобнее.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" color="text.primary" gutterBottom>
                            Контакты
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            archipelago_team@mail.ru <br></br>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Telegram PR Manager: @yarik_tri
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Telegram Software Lead: @puzzypizza
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Telegram Frontend Lead: @god_of_ru
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Telegram ML Lead: @rbeketov
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" color="text.primary" gutterBottom>
                            Подпишитесь на нас
                        </Typography>
                        <Link href="https://tlgg.ru/@rbeketov" color="inherit">
                            <Telegram />
                        </Link>
                    </Grid>
                </Grid>
                <Box mt={5}>
                    <Typography variant="body2" color="text.secondary" align="center">
                        {'Copyright © '}
                        <Link color="inherit" href="https://archipelago.team/">
                            Yavka
                        </Link>{' '}
                        {new Date().getFullYear()}
                        {'.'}
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}
