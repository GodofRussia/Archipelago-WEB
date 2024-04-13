import {User, UserDto} from '../types/user';
import {Note, NoteDto} from '../types/notes';

export function convertFromUserDto(user: UserDto): User {
    return {
        ...user,
        rootDirId: user.root_dir_id,
    };
}

export function convertFromNoteDto(note: NoteDto): Note {
    return {
        ...note,
        dirId: note.dir_id,
        automergeUrl: note.automerge_url,
    };
}
