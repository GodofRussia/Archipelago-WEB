import {User} from '../types/user';
import {Tag} from '../types/tags';

export const loadUser = (): User | undefined => {
    try {
        const serializedUser = localStorage.getItem('user');
        if (serializedUser === null) return undefined;
        return JSON.parse(serializedUser);
    } catch (err) {
        console.error('Load user failed', err);
        return undefined;
    }
};

export const saveUser = (user: User) => {
    try {
        const serializedUser = JSON.stringify(user);
        localStorage.setItem('user', serializedUser);
    } catch (err) {
        console.error('Save user failed', err);
    }
};

export const removeUser = () => {
    try {
        localStorage.removeItem('user');
    } catch (err) {
        console.error('Remove user failed', err);
    }
};

export const loadCollapsedDirIds = (): number[] | undefined => {
    try {
        const serialized = localStorage.getItem('collapsedDirIds');
        if (serialized === null) return undefined;
        return JSON.parse(serialized);
    } catch (err) {
        console.error('Load collapsedDirIds failed', err);
        return undefined;
    }
};

export const setCollapsedDirIds = (dirIds: number[]) => {
    try {
        const serialized = JSON.stringify(dirIds);
        localStorage.setItem('collapsedDirIds', serialized);
    } catch (err) {
        console.error('Save collapsedDirIds failed', err);
    }
};

export const loadActiveTag = (): Tag | undefined => {
    try {
        const serializedTag = localStorage.getItem('tag');
        if (serializedTag === null) return undefined;

        return JSON.parse(serializedTag);
    } catch (err) {
        console.error('Load tag failed', err);

        return undefined;
    }
};

export const saveOrUpdateActiveTag = (tag: Tag) => {
    try {
        const serializedTag = JSON.stringify(tag);
        localStorage.setItem('tag', serializedTag);
    } catch (err) {
        console.error('Save/update tag failed', err);
    }
};

export const removeActiveTag = () => {
    try {
        localStorage.removeItem('tag');
    } catch (err) {
        console.error('Remove tag failed', err);
    }
};
