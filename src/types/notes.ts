import * as A from '@automerge/automerge';
import {AnyDocumentId} from '@automerge/automerge-repo';
import {AccessEnum} from './access';

export interface Note {
    id: string;
    automergeUrl: AnyDocumentId;
    title: string;
    dirId: number; // int value
    defaultAccess: string;
    allowedMethods: Array<AccessEnum>;
}

export interface NoteDto {
    id: string;
    automerge_url: AnyDocumentId;
    title: string;
    dir_id: number; // int value
    default_access: string;
    allowed_methods: Array<AccessEnum>;
}

export interface NoteDoc {
    text: A.Text;
}

export const Role = ['обычный', 'пират', 'деловой'];
export const CallsType = ['Zoom', 'GoogleMeets', 'Microsoft Teams'];
export const CallsDetail = ['Краткая', 'Средняя', 'Развёрнутая'];

export enum CallsDetailEnum {
    SHORT = 'Краткая',
    AVERAGE = 'Средняя',
    FULL = 'Развёрнутая',
}

export enum CallsTypeEnum {
    ZOOM = 'Zoom',
    GOOGLE_MEETS = 'GoogleMeets',
    MICROSOFT_TEAMS = 'Microsoft Teams',
}

export enum RoleEnum {
    DEFAULT = 'обычный',
    PIRATE = 'пират',
    BUSINESS = 'деловой',
}

export const AccessRole = ['без доступа', 'читатель', 'редактор', 'управлять заметкой', 'выдача прав'];

export enum AccessRoleEnum {
    EMPTY = 'без доступа',
    READ = 'читатель',
    WRITE = 'редактор',
    MODIFY = 'управлять заметкой',
    MANAGE = 'выдача прав',
}

export const CONVERT_DEFAULT_ACCESS_ROLE_MAP: Record<AccessRoleEnum, string> = {
    [AccessRoleEnum.EMPTY]: 'e',
    [AccessRoleEnum.READ]: 'r',
    [AccessRoleEnum.WRITE]: 'w',
    [AccessRoleEnum.MODIFY]: 'm',
    [AccessRoleEnum.MANAGE]: 'ma',
};
