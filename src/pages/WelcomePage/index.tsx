import {Box, Button, Typography} from '@mui/material';
import Navbar from '../../components/Navbar';
import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import Footer from '../../components/Footer';

function WelcomePage() {
    const width = -1;
    const [open, setOpen] = useState(true); // Corrected from React.useState
    const navigate = useNavigate();
    const handleButtonClick = React.useCallback(() => {
        navigate('/registration');
    }, [navigate]);
    return (
        <Box sx={{backgroundColor: 'rgb(30, 33, 68)'}}>
            <Navbar setOpen={setOpen} width={width} open={open} />
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    width: '100%',
                    height: '120vh',
                    background: 'url("/background_welcome.jpg") center/cover',
                    textAlign: 'center',
                }}
            >
                <Typography
                    color="white"
                    sx={{fontFamily: 'Montserrat', fontSize: 110, fontWeight: 'bold', marginTop: '-8%'}}
                >
                    ARCHIPELAGO
                </Typography>
                <Button
                    variant="text"
                    sx={{
                        color: 'white',
                        marginTop: '1rem',
                        marginBottom: '4rem',
                        borderRadius: '20px',
                        paddingTop: '1px',
                        dec: 'none',
                        backgroundColor: 'transparent',
                        '&:hover': {
                            transform: 'scale(1.05)',
                            backgroundColor: 'transparent',
                        },
                    }}
                    onClick={handleButtonClick}
                >
                    <Typography
                        color="inherit"
                        sx={{
                            fontFamily: 'Montserrat',
                            fontWeight: 'bold',
                            fontSize: 60,
                        }}
                    >
                        НАЧАТЬ
                    </Typography>
                </Button>

                <Typography color="white" sx={{fontFamily: 'Montserrat', fontSize: 30}}>
                    ПОЛУЧАЙ ИТОГИ<br></br> ВСТРЕЧ И ЧАТОВ ОДНИМ КЛИКОМ
                </Typography>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'start',
                    justifyContent: 'center',
                    backgroundColor: 'rgb(23, 23, 23)',
                    width: '100%',
                    height: '135vh',
                    borderTopLeftRadius: '20%',
                    borderTopRightRadius: '20%',
                    marginTop: '-21%',
                    boxShadow: '0px -20px 20px rgba(0, 0, 0, 0.3)',
                    gap: 20,
                    pt: '1.5%',
                }}
            >
                <img
                    src="/points.svg"
                    alt=""
                    style={{
                        width: '100%',
                        height: '110%',
                        position: 'absolute',
                        marginTop: '9%',
                    }}
                />
                <img src="/zoom-logo.png" alt="Zoom Logo" style={{width: '8%', height: '8%'}} />
                <img src="/meets-logo.png" alt="Meets Logo" style={{width: '8%', height: '8%'}} />
                <img src="/teams-logo.png" alt="Teams Logo" style={{width: '8%', height: '8%'}} />
                <img src="/tg-logo.png" alt="Telegram Logo" style={{width: '8%', height: '8%'}} />
            </Box>
            <Footer />
        </Box>
    );
}

export default WelcomePage;
