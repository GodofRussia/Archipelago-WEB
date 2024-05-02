import * as A from '@automerge/automerge';
import {AnyDocumentId} from '@automerge/automerge-repo';

export interface Note {
    id: string;
    automergeUrl: AnyDocumentId;
    title: string;
    dirId: number; // int value
    defaultAccess: string;
    allowedMethods: Array<string>;
}

export interface NoteDto {
    id: string;
    automerge_url: AnyDocumentId;
    title: string;
    dir_id: number; // int value
    default_access: string;
    allowed_methods: Array<string>;
}

export interface NoteDoc {
    text: A.Text;
}

export const Role = ['обычный', 'пират', 'гопник'];
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
    YOB = 'гопник',
}
