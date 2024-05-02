import {User} from '../types/user';

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
