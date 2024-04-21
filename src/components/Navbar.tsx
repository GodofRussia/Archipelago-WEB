import {
    AppBarProps as MuiAppBarProps,
    Box,
    Button,
    ButtonGroup,
    IconButton,
    styled,
    Toolbar,
    Typography,
} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {Note} from '../types/notes';
import CollapseIcon from '../icons/CollapseIcon';
import MuiAppBar from '@mui/material/AppBar';
import LoginIcon from '@mui/icons-material/Login';
import React from 'react';

interface NavbarProps {
    itemsList: Note[];
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
        width: `calc(100% - ${width}px)`,
        marginLeft: `${width}px`,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

function Navbar(props: NavbarProps) {
    const {open, setOpen, width, isAuthenticationPage = false} = props;
    const navigate = useNavigate();

    const handleLoginClicked = React.useCallback(() => {
        navigate('/login');
    }, [navigate]);

    const handleRegisterClicked = React.useCallback(() => {
        navigate('/registration');
    }, [navigate]);

    return (
        <AppBar position={'fixed'} open={open} width={width} sx={{backgroundColor: '#000000'}}>
            <Toolbar sx={{display: 'flex', justifyContent: 'space-between'}}>
                <Box display={'flex'} alignItems={'center'}>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={() => setOpen(true)}
                        edge="start"
                        sx={{mr: 2, ...(open && {display: 'none'})}}
                    >
                        <CollapseIcon color={'secondary'} />
                    </IconButton>
                    <Box onClick={() => navigate('/')} sx={{cursor: 'pointer'}}>
                        <Typography variant="h6" noWrap component="div">
                            ARCHIPELAGO
                        </Typography>
                    </Box>
                </Box>

                {!isAuthenticationPage && (
                    <ButtonGroup>
                        <Button onClick={handleLoginClicked} startIcon={<LoginIcon fontSize={'medium'} />}>
                            Логин
                        </Button>
                        <Button onClick={handleRegisterClicked}>Зарегистрироваться</Button>
                        {/* <Button startIcon={<LogoutIcon fontSize={'medium'} />}>Выйти</Button> */}
                    </ButtonGroup>
                )}
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;
