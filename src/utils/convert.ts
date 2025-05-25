import {User, UserDto} from '../types/user';
import {Note, NoteDto} from '../types/notes';
import {AuthResponse, AuthResponseDto} from '../types/auth';
import {Access, AccessDto} from '../types/access';
import {Tag, TagDto, TagWithLinkName, TagWithLinkNameDto} from '../types/tags';

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
        ...authData,
        userId: authData.user_id,
    };
}

export function convertFromTagsDto(tag: TagDto): Tag {
    return {
        ...tag,
        id: tag.tag_id,
        userId: tag.user_id,
    };
}

export function convertFromTagWithLinkNameDto(tag: TagWithLinkNameDto): TagWithLinkName {
    return {
        ...tag,
        id: tag.tag_id,
        userId: tag.user_id,
        linkName: tag.link_name,
    };
}

export function convertFromAccessToDto(access: Access): AccessDto {
    return {
        access: access.access,
        with_invitation: access.withInvitation,
    };
}
