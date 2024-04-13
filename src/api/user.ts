import axios from 'axios';
import {convertFromUserDto} from '../utils/convert';
import {UserDto} from '../types/user';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_NOTES_URL}/api`,
});

export function getUser(requestData: {id: string}) {
    return api.get<UserDto>(`/users/${requestData.id}`).then((response) => convertFromUserDto(response.data));
}
