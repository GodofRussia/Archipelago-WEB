import React from 'react';
import './App.css';
import '@fontsource/inter';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {createTheme, CssBaseline, ThemeProvider} from '@mui/material';
import {ruRU} from '@mui/material/locale';
import {blue} from '@mui/material/colors';
import MainPage from './pages/MainPage';
import Note from './pages/Note';
import {ColorMode} from './types/color-mode';
import Navbar from './components/Navbar';

function App() {
    const [colorMode] = React.useState<ColorMode>(ColorMode.DARK);

    const theme = React.useMemo(
        () =>
            createTheme(
                {
                    components: {
                        MuiButton: {
                            styleOverrides: {
                                root: {
                                    boxShadow: 'none !important',
                                },
                            },
                        },
                    },
                    palette: {
                        mode: colorMode,
                        primary: {main: '#270025', dark: '#040221', contrastText: '#ffffff'},
                        secondary: {...blue, contrastText: '#ffffff'},
                        error: {
                            main: '#f44336',
                            dark: '#e53935',
                            light: '#ef5350',
                        },
                        warning: {
                            main: '#fb8c00',
                            dark: '#f57c00',
                            light: '#ff9800',
                        },
                        info: {
                            main: '#0288d1',
                            dark: '#01579b',
                            light: '#03a9f4',
                        },
                        success: {
                            main: '#7cb342',
                            dark: '#689f38',
                            light: '#8bc34a',
                            contrastText: '#ffffff',
                        },
                    },
                    typography: {
                        fontFamily: ['Arial', 'sans-serif'].join(','),
                    },
                },
                ruRU,
            ),
        [colorMode],
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <>
                                <Navbar itemsList={[]} />
                                <MainPage />
                            </>
                        }
                    />
                    <Route
                        path="/notes/:id"
                        element={
                            <>
                                <Navbar itemsList={[]} />
                                <Note />
                            </>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
