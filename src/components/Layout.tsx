import React, {useState} from 'react';
import {Box, CssBaseline, styled} from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export enum TabType {
    HOME = 'home',
    SHARED = 'shared',
}

interface LayoutProps {
    children: React.ReactNode;
    tab?: TabType;
}

export const DrawerHeader = styled('div')(({theme}) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
}));

export const Main = styled('main', {shouldForwardProp: (prop) => prop !== 'open'})<{
    open?: boolean;
    width: number;
}>(({theme, open, width}) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${width}px`,
    ...(open && {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
    }),
}));

export default function Layout({children, tab = TabType.HOME}: LayoutProps) {
    const [width, setWidth] = useState(240);
    const [open, setOpen] = React.useState(true);

    return (
        <Box sx={{display: 'flex'}}>
            <CssBaseline />
            <Navbar setOpen={setOpen} width={width} itemsList={[]} open={open} />
            <Sidebar tab={tab} setWidth={setWidth} width={width} open={open} setOpen={setOpen} />
            <Main open={open} width={width}>
                <DrawerHeader />
                {children}
            </Main>
        </Box>
    );
}
