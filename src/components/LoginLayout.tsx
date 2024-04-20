import {Box, CssBaseline, styled} from '@mui/material';
import Navbar from './Navbar';
import React, {useState} from 'react';

interface LayoutProps {
    children: React.ReactNode;
}

const RightHalfBox = styled(Box)({
    marginLeft: '40vw',
    width: '60vw',
    height: '100vh',
    backgroundColor: 'rgba(255,255,255, 1)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
});

export default function LoginLayout({children}: LayoutProps) {
    const width = -1;
    const [open, setOpen] = useState(true);

    return (
        <RightHalfBox>
            <CssBaseline />
            <Navbar setOpen={setOpen} width={width} itemsList={[]} open={open} /> {/* Pass the 'open' state directly */}
            {children}
        </RightHalfBox>
    );
}
