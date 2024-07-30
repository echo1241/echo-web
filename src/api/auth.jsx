import {instance} from './axios';

export const login = async (email, password) => {
    return await instance.post('/auth/login', {
        email,
        password,
    });
};

export const signup = async (email, password, nickname) => {
    return await instance.post('/users/signup', {
        email,
        password,
        nickname
    });
}