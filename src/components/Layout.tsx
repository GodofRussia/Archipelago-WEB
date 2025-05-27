import React, {PropsWithChildren, useState} from 'react';
import {Box, CssBaseline, styled} from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export const DrawerHeader = styled('div')(({theme}) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
}));

export const Main = styled('main', {shouldForwardProp: (prop) => prop !== 'open'})<{
    open?: boolean;
    width: number;
}>(({theme, open, width}) => ({
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 10,
    overflow: 'hidden',
    padding: theme.spacing(3),
    paddingTop: 0,
    paddingBottom: 0,
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

export default function Layout<T>({children}: PropsWithChildren<T>) {
    const [width, setWidth] = useState(240);
    const [open, setOpen] = React.useState(true);
    const refContainer = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (open) setWidth(240);
        else setWidth(10);
    }, [open]);

    return (
        <Box ref={refContainer} sx={{display: 'flex', overflow: 'auto', position: 'relative'}}>
            <CssBaseline />
            <Navbar setOpen={setOpen} width={width} open={open} />
            <Sidebar refContainer={refContainer} setWidth={setWidth} width={width} open={open} setOpen={setOpen} />
            <Main open={open} width={width}>
                <DrawerHeader />
                {children}
            </Main>
        </Box>
    );
}
