export enum AccessEnum {
    delete = 'delete',
    update = 'update',
    get = 'get',
    set_access = 'set_access',
}

export interface Access {
    access: string;
    withInvitation: boolean;
}

export interface AccessDto {
    access: string;
    with_invitation: boolean;
}
