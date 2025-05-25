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
                    background: 'url("/background2.jpg") center/cover',
                    textAlign: 'center',
                }}
            >
                <Typography
                    color="white"
                    sx={{
                        fontFamily: 'Montserrat',
                        fontSize: 110,
                        fontWeight: 'bold',
                        marginTop: '-8%',
                        color: 'black',
                        textShadow: `-1px -1px 0 white,
                        1px -1px 0 white,
                        -1px 1px 0 white,
                        1px 1px 0 white;`,
                    }}
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
                            color: 'black',
                            textShadow: `-1px -1px 0 white,
                        1px -1px 0 white,
                        -1px 1px 0 white,
                        1px 1px 0 white;`,
                        }}
                    >
                        НАЧАТЬ
                    </Typography>
                </Button>

                <Typography
                    sx={{
                        fontFamily: 'Montserrat',
                        fontSize: 30,
                        color: 'rgb(7, 13, 26)',
                        textShadow: `-0.5px -0.5px 0 white,
                        0.5px -0.5px 0 white,
                        -0.5px 0.5px 0 white,
                        0.5px 0.5px 0 white;`,
                    }}
                >
                    ПОЛУЧАЙ ИТОГИ<br></br>ВСТРЕЧ И ЧАТОВ ОДНИМ КЛИКОМ
                </Typography>
            </Box>

            <Box
                sx={{
                    position: 'relative',
                    backgroundColor: 'rgb(23, 23, 23)',
                    width: '100%',
                    minHeight: 250,
                    borderTopLeftRadius: {xs: '14vw', md: '12vw'},
                    borderTopRightRadius: {xs: '14vw', md: '12vw'},
                    marginTop: {xs: '-23vw', md: '-16vw'},
                    pb: {xs: 6, md: 9},
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Box
                    sx={{
                        width: {xs: '95vw', sm: '85vw', md: '70vw', lg: '60vw'},
                        maxWidth: 1200,
                        mx: 'auto',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: {xs: 1, sm: 3, md: 8},
                        mt: {xs: 7, md: 9},
                    }}
                >
                    <img
                        src="/zoom-logo.png"
                        alt="Zoom Logo"
                        style={{
                            width: '120px',
                            height: '120px',
                            objectFit: 'contain',
                            userSelect: 'none',
                            pointerEvents: 'none',
                            display: 'block',
                        }}
                    />
                    <img
                        src="/meets-logo.png"
                        alt="Google Meet Logo"
                        style={{
                            width: '120px',
                            height: '120px',
                            objectFit: 'contain',
                            userSelect: 'none',
                            pointerEvents: 'none',
                            display: 'block',
                        }}
                    />
                    <img
                        src="/teams-logo.png"
                        alt="Teams Logo"
                        style={{
                            width: '120px',
                            height: '120px',
                            objectFit: 'contain',
                            userSelect: 'none',
                            pointerEvents: 'none',
                            display: 'block',
                        }}
                    />
                    <img
                        src="/tg-logo.png"
                        alt="Telegram Logo"
                        style={{
                            width: '120px',
                            height: '120px',
                            objectFit: 'contain',
                            userSelect: 'none',
                            pointerEvents: 'none',
                            display: 'block',
                        }}
                    />
                </Box>
                <Box
                    sx={{
                        mt: {xs: 5, md: 8},
                        width: {xs: '90vw', sm: '75vw', md: '65vw', lg: '50vw'},
                        maxWidth: 1000,
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <img
                        src="/points.svg"
                        alt="Points"
                        style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block',
                        }}
                    />
                </Box>
            </Box>

            <Footer />
        </Box>
    );
}

export default WelcomePage;
