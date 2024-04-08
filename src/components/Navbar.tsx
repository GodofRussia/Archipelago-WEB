import React from 'react';
import {alpha, AppBar, Box, styled, Toolbar, Typography} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {Note} from '../types/notes';

interface NavbarProps {
    itemsList: Note[];
}

function Navbar(props: NavbarProps) {
    const {} = props;
    const navigate = useNavigate();

    const Search = styled('div')(({theme}) => ({
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: alpha(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: alpha(theme.palette.common.white, 0.25),
        },
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(1),
            width: 'auto',
        },
    }));

    return (
        <AppBar position="static">
            <Toolbar>
                {/* <IconButton size="large" edge="start" color="inherit" aria-label="open drawer" sx={{mr: 2}}> */}
                {/*     <MenuIcon /> */}
                {/* </IconButton> */}
                <Box onClick={() => navigate('/')}>
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{flexGrow: 1, display: {xs: 'none', sm: 'block', cursor: 'pointer'}}}
                    >
                        ARCHIPELAGO
                    </Typography>
                </Box>

                <Search>
                    {/* <SearchIconWrapper> */}
                    {/*     <SearchIcon /> */}
                    {/* </SearchIconWrapper> */}
                    {/* <StyledInputBase placeholder="Search…" inputProps={{'aria-label': 'search'}} /> */}
                </Search>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;
