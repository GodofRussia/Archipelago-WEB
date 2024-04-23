import {User, UserDto} from '../types/user';
import {Note, NoteDto} from '../types/notes';
import {AuthResponse, AuthResponseDto} from '../types/auth';
import {Access, AccessDto} from '../types/access';

export function convertFromUserDto(user: UserDto): User {
    return {
        ...user,
        rootDirId: user.root_dir_id,
    };
}

export function convertFromNoteDto(note: NoteDto): Note {
    return {
        ...note,
        defaultAccess: note.default_access,
        allowedMethods: note.allowed_methods,
        dirId: note.dir_id,
        automergeUrl: note.automerge_url,
    };
}

export function convertFromNoteToNoteDto(note: Note): NoteDto {
    return {
        ...note,
        default_access: note.defaultAccess,
        allowed_methods: note.allowedMethods,
        dir_id: note.dirId,
        automerge_url: note.automergeUrl,
    };
}

export function convertFromAuthDto(authData: AuthResponseDto): AuthResponse {
    return {
        userData: authData.user_data,
        userId: authData.user_id,
    };
}

export function convertFromAccessDto(access: AccessDto): Access {
    return {...access, withInvitation: access.with_invitation};
}

export function convertFromAccessToDto(access: Access): AccessDto {
    return {...access, with_invitation: access.withInvitation};
}
