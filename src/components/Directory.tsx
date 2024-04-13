import React from 'react';
import {Collapse, ListItem, ListItemText, Menu, MenuItem} from '@mui/material';
import {ExpandLess, ExpandMore} from '@mui/icons-material';
import {DirTreeDto} from '../types/dirs';
import NoteCard from './NoteCard';
import {convertFromNoteDto} from '../utils/convert';
import List from '@mui/material/List';

interface FolderProps {
    folder: DirTreeDto;
    active: number;
    onDirCreateClick: () => void;
    handleCreateNote: () => void;
    refetchDirTree: () => void;
    setDirIdForCreate: (dirId: number) => void;
}

function Folder({folder, active, onDirCreateClick, refetchDirTree, handleCreateNote, setDirIdForCreate}: FolderProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [contextMenu, setContextMenu] = React.useState<{mouseX: number; mouseY: number} | null>(null);

    const handleClick = () => {
        setIsOpen(!isOpen);
    };

    const handleContextMenu = React.useCallback(
        (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            event.preventDefault();
            setContextMenu(contextMenu === null ? {mouseX: event.clientX - 2, mouseY: event.clientY - 4} : null);
        },
        [contextMenu],
    );

    const handleClose = () => {
        setContextMenu(null);
    };

    return (
        <List sx={{m: 0, p: 0}}>
            <ListItem
                button
                sx={{display: 'flex', gap: 1, px: 1, cursor: 'pointer'}}
                onClick={handleClick}
                onContextMenu={handleContextMenu}
            >
                {isOpen ? <ExpandLess /> : <ExpandMore />}
                <ListItemText sx={{m: 0, p: 0}} primary={folder.name} />
            </ListItem>

            <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <List sx={{p: 0, pl: 4}}>
                    {folder.children.map((subFolder, idx) => (
                        <ListItem button key={`folder-${idx}`} sx={{p: 0}}>
                            <Folder
                                active={active}
                                key={subFolder.id}
                                folder={subFolder}
                                handleCreateNote={handleCreateNote}
                                onDirCreateClick={onDirCreateClick}
                                refetchDirTree={refetchDirTree}
                                setDirIdForCreate={setDirIdForCreate}
                            />
                        </ListItem>
                    ))}
                    {folder.notes.map((note, idx) => (
                        <ListItem button key={`note-${idx}`} sx={{p: 0}}>
                            <NoteCard key={note.id} {...convertFromNoteDto(note)} refetchNotes={refetchDirTree} />
                        </ListItem>
                    ))}
                </List>
            </Collapse>
            <Menu
                open={contextMenu !== null}
                onClose={handleClose}
                anchorReference="anchorPosition"
                anchorPosition={contextMenu !== null ? {top: contextMenu.mouseY, left: contextMenu.mouseX} : undefined}
            >
                <MenuItem
                    onClick={() => {
                        onDirCreateClick();
                        setDirIdForCreate(folder.id);
                        handleClose();
                    }}
                >
                    Создать папку
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        handleCreateNote();
                        setDirIdForCreate(folder.id);
                        handleClose();
                    }}
                >
                    Создать заметку
                </MenuItem>
            </Menu>
        </List>
    );
}

export default Folder;
