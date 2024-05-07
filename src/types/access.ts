export enum AccessEnum {
    delete = 'delete',
    update = 'update',
    get = 'get',
    set_access = 'set_access',
    attach_summary = 'attach_summary',
    get_summary_list = 'get_summary_list',
}

export interface Access {
    access: string;
    withInvitation: boolean;
}

export interface AccessDto {
    access: string;
    with_invitation: boolean;
}
