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
        const response = await instance.post('/users/password', { email });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to send password reset email.');
    }
};

// 비밀번호 재설정
export const resetPassword = async (userId, currentPassword, newPassword) => {
    try {
        const response = await instance.put('/users/password', {
            password: currentPassword,
            newPassword
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to reset password.');
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