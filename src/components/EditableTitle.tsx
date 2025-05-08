import React, {useState} from 'react';
import {Box, CircularProgress, IconButton, TextField, Typography} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

interface EditableTitleProps {
    defaultTitle: string;
    onUpdateTitle: (newTitle: string) => void;
    isLoading: boolean;
}

const EditableTitle = ({defaultTitle, onUpdateTitle, isLoading}: EditableTitleProps) => {
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

    const handleClick = () => {
        if (!isLoading) {
            setIsEditing(true);
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
        <Box display="flex" alignItems="center">
            {isEditing ? (
                <TextField
                    value={title}
                    onChange={handleChange}
                    onBlur={handleBlurOrEnter}
                    onKeyDown={handleKeyDown}
                    variant="outlined"
                    size="small"
                    autoFocus
                    disabled={isLoading}
                    sx={{
                        width: '100%',
                        input: {padding: '8px'},
                    }}
                />
            ) : (
                <Typography
                    variant="h6"
                    onClick={handleClick}
                    sx={{
                        cursor: isLoading ? 'default' : 'pointer',
                        borderBottom: '1px dashed gray',
                        color: isLoading ? 'gray' : 'inherit',
                    }}
                >
                    {title}
                </Typography>
            )}
            {isEditing && (
                <IconButton onClick={handleBlurOrEnter} disabled={isLoading}>
                    {isLoading ? <CircularProgress size={24} /> : <CheckIcon />}
                </IconButton>
            )}
        </Box>
    );
};

export default EditableTitle;
