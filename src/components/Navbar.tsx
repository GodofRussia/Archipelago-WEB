import {AppBarProps as MuiAppBarProps, Box, IconButton, styled, Toolbar, Typography} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {Note} from '../types/notes';
import CollapseIcon from '../icons/CollapseIcon';
import MuiAppBar from '@mui/material/AppBar';

interface NavbarProps {
    itemsList: Note[];
    open: boolean;
    setOpen: (val: boolean) => void;
    width: number;
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
    const {open, setOpen, width} = props;
    const navigate = useNavigate();

    console.log(open);

    return (
        <AppBar position={'fixed'} open={open} width={width}>
            <Toolbar>
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
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;
