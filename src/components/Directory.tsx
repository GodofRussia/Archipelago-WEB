import React from 'react';
import {Collapse, ListItem, ListItemText, Menu, MenuItem, Skeleton, Typography} from '@mui/material';
import {ExpandLess, ExpandMore} from '@mui/icons-material';
import {FullDirTreeWithNotes} from '../types/dirs';
import NoteCard from './NoteCard';
import List from '@mui/material/List';
import {useAppSelector} from '../hooks/useRedux';

interface FolderProps {
    folder?: FullDirTreeWithNotes;
    onDirCreateClick: () => void;
    handleCreateNote: () => void;
    refetchNotes: () => void;
    setDirIdForCreate: (dirId: number) => void;
    isLoading: boolean;
}

function Folder({folder, onDirCreateClick, refetchNotes, handleCreateNote, setDirIdForCreate, isLoading}: FolderProps) {
    const innerFullDirTree = useAppSelector((state) => state.dirsReducer.dirTree);

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

    return !isLoading ? (
        <List sx={{m: 0, p: 0}}>
            {!folder || !folder.notes ? (
                <Typography>Ещё нет заметок</Typography>
            ) : (
                <>
                    {folder.id !== innerFullDirTree?.id && (
                        <ListItem
                            button
                            sx={{display: 'flex', gap: 1, px: 1, cursor: 'pointer'}}
                            onClick={handleClick}
                            onContextMenu={handleContextMenu}
                        >
                            {isOpen ? <ExpandLess /> : <ExpandMore />}
                            <ListItemText sx={{m: 0, p: 0}} primary={folder.name} />
                        </ListItem>
                    )}

                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                        <List sx={{p: 0, pl: folder.id !== innerFullDirTree?.id ? 2 : 0}}>
                            {folder.children.map((subFolder, idx) => (
                                <ListItem button key={`folder-${idx}`} sx={{p: 0}}>
                                    <Folder
                                        key={subFolder.id}
                                        folder={subFolder}
                                        handleCreateNote={handleCreateNote}
                                        onDirCreateClick={onDirCreateClick}
                                        refetchNotes={refetchNotes}
                                        setDirIdForCreate={setDirIdForCreate}
                                        isLoading={isLoading}
                                    />
                                </ListItem>
                            ))}
                            {folder.notes.map((note, idx) => (
                                <ListItem button key={`note-${idx}`} sx={{p: 0}}>
                                    <NoteCard key={note.id} {...note} refetchNotes={refetchNotes} />
                                </ListItem>
                            ))}
                        </List>
                    </Collapse>
                    <Menu
                        open={contextMenu !== null}
                        onClose={handleClose}
                        anchorReference="anchorPosition"
                        anchorPosition={
                            contextMenu !== null
                                ? {
                                      top: contextMenu.mouseY,
                                      left: contextMenu.mouseX,
                                  }
                                : undefined
                        }
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
                </>
            )}
        </List>
    ) : (
        <Skeleton width={200} />
    );
}

export default Folder;
