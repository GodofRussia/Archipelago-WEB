import React from 'react';
import './App.css';
import '@fontsource/inter';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {createTheme as createMuiTheme, ThemeProvider as MuiThemeProvider} from '@mui/material/styles';
import {ruRU} from '@mui/material/locale';
import MainPage from './pages/MainPage';
import Note from './pages/Note';
import Login from './pages/Login';
import {ColorMode} from './types/color-mode';
import Layout, {TabType} from './components/Layout';
import LoginLayout from './components/LoginLayout';
import Registration from './pages/Registration';
import {ProtectedRoute} from './components/ProtectedRoute';
import {SnackbarProvider} from 'notistack';
import WelcomePage from './pages/WelcomePage';
import Navbar from './components/Navbar';

export default function App() {
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
                        primary: {main: '#0288d1', dark: '#015f92', light: '#349fda', contrastText: '#ffffff'},
                        secondary: {main: '#1de9b6', dark: '#14a37f', light: '#4aedc4', contrastText: '#ffffff'},
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
        <SnackbarProvider>
            <MuiThemeProvider theme={theme}>
                {/* <JoyThemeProvider theme={joyTheme}> */}
                <BrowserRouter>
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <Layout>
                                    <MainPage />
                                </Layout>
                            }
                        />
                        <Route path="/welcome" element={<WelcomePage />} />
                        <Route
                            path="/shared"
                            element={
                                <Layout tab={TabType.SHARED}>
                                    <MainPage />
                                </Layout>
                            }
                        />
                        <Route
                            path="/notes/:id"
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <Note />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/login/"
                            element={
                                <LoginLayout>
                                    <Login />
                                </LoginLayout>
                            }
                        />
                        <Route
                            path="/registration/"
                            element={
                                <LoginLayout>
                                    <Registration />
                                </LoginLayout>
                            }
                        />
                    </Routes>
                </BrowserRouter>
            </MuiThemeProvider>
        </SnackbarProvider>
    );
}
