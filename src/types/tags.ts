export interface Tag {
    id: string;
    name: string;
    userId: string;
}

export interface TagWithLinkName {
    id: string;
    name: string;
    userId: string;
    linkName: string;
}

export interface TagWithLinkNameDto {
    tag_id: string;
    name: string;
    user_id: string;
    link_name: string;
}

export interface TagDto {
    tag_id: string;
    name: string;
    user_id: string;
}
