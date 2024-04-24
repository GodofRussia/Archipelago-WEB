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
