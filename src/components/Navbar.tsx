import {AppBarProps as MuiAppBarProps, Box, Button, ButtonGroup, styled, Toolbar, Typography} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import MuiAppBar from '@mui/material/AppBar';
import LoginIcon from '@mui/icons-material/Login';
import React from 'react';
import {useAppDispatch, useAppSelector} from '../hooks/useRedux';
import {logoutUser} from '../store/reducers/UserSlice';
import LogoutIcon from '@mui/icons-material/Logout';

interface NavbarProps {
    open: boolean;
    setOpen: (val: boolean) => void;
    width: number;
    isAuthenticationPage?: boolean;
}

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
    width: number;
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({theme, open, width}) => ({
    transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        width: `100%`,
        marginLeft: `${width}px`,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

function Navbar(props: NavbarProps) {
    const {open, width, isAuthenticationPage = false} = props;
    const {user} = useAppSelector((state) => state.userReducer);
    const dispatch = useAppDispatch();

    const navigate = useNavigate();
    const handleLoginClicked = React.useCallback(() => {
        navigate('/login');
    }, [navigate]);

    const handleRegisterClicked = React.useCallback(() => {
        navigate('/registration');
    }, [navigate]);

    const handleLogoutClicked = React.useCallback(() => {
        dispatch(logoutUser());
    }, [dispatch]);

    return (
        <AppBar position={'fixed'} open={open} width={width} sx={{backgroundColor: '#000000', zIndex: 100000}}>
            <Toolbar sx={{display: 'flex', justifyContent: 'space-between'}}>
                <Box display={'flex'} alignItems={'center'}>
                    <Box onClick={() => navigate('/')} sx={{cursor: 'pointer'}}>
                        <Typography variant="h6" noWrap component="div">
                            ARCHIPELAGO
                        </Typography>
                    </Box>
                </Box>

                {!isAuthenticationPage && !user && (
                    <ButtonGroup>
                        <Button onClick={handleLoginClicked} startIcon={<LoginIcon fontSize={'medium'} />}>
                            Войти
                        </Button>
                        <Button onClick={handleRegisterClicked}>Зарегистрироваться</Button>
                    </ButtonGroup>
                )}
                {!isAuthenticationPage && user && (
                    <Box display={'flex'} alignItems="center" gap={2}>
                        <Typography variant={'body1'}>{user.name}</Typography>
                        <Button onClick={handleLogoutClicked} startIcon={<LogoutIcon fontSize={'medium'} />}>
                            Выйти
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;
