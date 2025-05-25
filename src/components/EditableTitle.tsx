import React, {useState} from 'react';
import {Box, CircularProgress, IconButton, TextField, Typography} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import {Variant} from '@mui/material/styles/createTypography';

interface EditableTitleProps {
    defaultTitle: string;
    onUpdateTitle: (newTitle: string) => void;
    isLoading: boolean;
    variant: Variant;
}

const EditableTitle = ({defaultTitle, onUpdateTitle, isLoading, variant}: EditableTitleProps) => {
    const [title, setTitle] = useState(defaultTitle);
    const [isEditing, setIsEditing] = useState(false);
    const [isDebouncing, setIsDebouncing] = useState(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value);
    };

    const handleBlurOrEnter = () => {
        setIsEditing(false);
        setIsDebouncing(true);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleBlurOrEnter();
        }
    };

    const handleClick = (event: React.MouseEvent) => {
        if (!isLoading) {
            setIsEditing(true);
            event.stopPropagation();
        }
    };

    React.useEffect(() => {
        if (isDebouncing) {
            const handler = setTimeout(() => {
                if (title !== defaultTitle) {
                    onUpdateTitle(title);
                }

                setIsDebouncing(false);
            }, 300);

            return () => clearTimeout(handler);
        }
    }, [defaultTitle, isDebouncing, onUpdateTitle, title]);

    React.useEffect(() => {
        if (!!defaultTitle) {
            setTitle(defaultTitle);
        }
    }, [defaultTitle]);

    return (
        <Box display="flex" alignItems="center" minHeight={40} gap={1}>
            {isEditing ? (
                <TextField
                    value={title}
                    onChange={handleChange}
                    onBlur={handleBlurOrEnter}
                    onKeyDown={handleKeyDown}
                    variant="outlined"
                    size="small"
                    autoFocus
                    onClick={(event) => {
                        event.stopPropagation();
                    }}
                    disabled={isLoading}
                />
            ) : (
                <Typography
                    variant={variant}
                    onClick={handleClick}
                    sx={{
                        cursor: isLoading ? 'default' : 'pointer',
                        borderBottom: '1px solid gray',
                        color: isLoading || !title ? 'gray' : 'inherit',
                    }}
                >
                    {title || 'введите имя связи'}
                </Typography>
            )}
            {(isEditing || isLoading) && (
                <IconButton onClick={handleBlurOrEnter} disabled={isLoading}>
                    {isLoading ? <CircularProgress size={24} /> : <CheckIcon />}
                </IconButton>
            )}
        </Box>
    );
};

export default EditableTitle;
