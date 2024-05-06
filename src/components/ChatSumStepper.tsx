import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import {Link} from '@mui/material';
import {useSnackbar} from 'notistack';

interface Step {
    description: React.ReactNode;
    label: string;
}

export default function ChatSumStepper({noteId}: {noteId: string}) {
    const [activeStep, setActiveStep] = React.useState(0);
    const {enqueueSnackbar} = useSnackbar();

    const handleClickedLink = React.useCallback(
        async (what: string) => {
            await navigator.clipboard.writeText(what);
            enqueueSnackbar('Ссылка скопирована', {variant: 'info'});
        },
        [enqueueSnackbar],
    );

    const steps = React.useMemo<Step[]>(
        () => [
            {
                label: 'Добавьте бота в TG чат',
                description: (
                    <Typography sx={{textDecoration: 'none'}}>
                        Добавьте бота{' '}
                        <Link href="#" onClick={() => handleClickedLink('@ArchipelagoSummarizer_bot')} underline="none">
                            @ArchipelagoSummarizer_bot
                        </Link>{' '}
                        в Ваш телеграм-чат <br /> &#09; Нажмите на название чата, затем на кнопку &quot;Добавить&quot; и
                        вставьте имя бота
                    </Typography>
                ),
            },
            {
                label: 'Привяжите чат к заметке',
                description: (
                    <Typography sx={{textDecoration: 'none'}}>
                        {' '}
                        Введите в чат{' '}
                        <Link href="#" onClick={() => handleClickedLink(`/config ${noteId}`)} underline="none">
                            /config {noteId}
                        </Link>
                    </Typography>
                ),
            },
        ],
        [handleClickedLink, noteId],
    );

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    return (
        <Box sx={{maxWidth: 400}}>
            <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((step, index) => (
                    <Step key={step.label}>
                        <StepLabel optional={index === 2 ? <Typography variant="caption">Last step</Typography> : null}>
                            {step.label}
                        </StepLabel>
                        <StepContent>
                            <Typography>{step.description}</Typography>
                            <Box sx={{mb: 2}}>
                                <Button variant="contained" onClick={handleNext} sx={{mt: 1, mr: 1}}>
                                    {index === steps.length - 1 ? 'Конец' : 'Продолжить'}
                                </Button>
                                <Button disabled={index === 0} onClick={handleBack} sx={{mt: 1, mr: 1}}>
                                    Назад
                                </Button>
                            </Box>
                        </StepContent>
                    </Step>
                ))}
            </Stepper>
            {activeStep === steps.length && (
                <Paper square elevation={0} sx={{p: 3}}>
                    <Typography>Все действия для привязки чата выполнены</Typography>
                    <Button onClick={handleReset} sx={{mt: 1, mr: 1}}>
                        Сбросить
                    </Button>
                </Paper>
            )}
        </Box>
    );
}
