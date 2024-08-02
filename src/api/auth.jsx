import axiosInstance, {instance} from './axios';

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

// 비밀번호 재설정 링크 전송
export const sendPasswordResetEmail = async (email) => {
    try {
        const response = await instance.post('/users/find/password', { email });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to send password reset email.');
    }
};

export const checkDuplicateId = async (email) => {
    const response = await instance.post('/users/find/id', {
        email
    });
    return response.data;
}

export const checkValidateEmail = async (email) => {
    const response = await instance.post('/users/verify/email', {
        email
    });
    return response.data;
}

export const checkVerificationCode = async (code, email) => {
    const response = await instance.post(`/users/verify/${code}`, {
        email
    });
    return response.data;
}

export const verifyVerificationCode = async (uuid, code) => {
    const response = await instance.post(`/users/verify/${uuid}/${code}`)
    return response.data;
}

// 비밀번호 재설정
export const resetPassword = async (uuid, email, newPassword) => {
    try {
        const response = await instance.put(`/users/change/password/${uuid}`, {
            email,
            newPassword
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to reset password.');
    }
};