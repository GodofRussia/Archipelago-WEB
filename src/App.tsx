import React from 'react';
import './App.css';
import '@fontsource/inter';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {createTheme as createMuiTheme, ThemeProvider as MuiThemeProvider} from '@mui/material/styles';
// import {extendTheme as createJoyTheme, ThemeProvider as JoyThemeProvider} from '@mui/joy/styles';
import {ruRU} from '@mui/material/locale';
import {blue} from '@mui/material/colors';
import MainPage from './pages/MainPage';
import Note from './pages/Note';
import {ColorMode} from './types/color-mode';
import Layout from './components/ Layout';

function App() {
    const [colorMode] = React.useState<ColorMode>(ColorMode.DARK);

    const theme = React.useMemo(
        () =>
            createMuiTheme(
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
                        primary: {main: '#0288d1', dark: '#040221', contrastText: '#ffffff'},
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

    // const joyTheme = React.useMemo(() => createJoyTheme({}), []);

    return (
        <MuiThemeProvider theme={theme}>
            {/* <JoyThemeProvider theme={joyTheme}> */}
            <BrowserRouter>
                <Layout>
                    <Routes>
                        <Route path="/" element={<MainPage />} />
                        <Route path="/notes/:id" element={<Note />} />
                    </Routes>
                </Layout>
            </BrowserRouter>
            {/* </JoyThemeProvider> */}
        </MuiThemeProvider>
    );
}

export default App;
