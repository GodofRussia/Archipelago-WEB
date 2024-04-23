enum AccessEnum {
    delete = 'delete',
    update = 'update',
    get = 'get',
    set_access = 'set_access',
}

export interface Access {
    access: AccessEnum;
    withInvitation: boolean;
}

export interface AccessDto {
    access: AccessEnum;
    with_invitation: boolean;
}
