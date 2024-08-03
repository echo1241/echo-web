export const login = async (connect, email, password) => {
    return await connect('post', '/auth/login', {
        email,
        password,
    });
};

//// 회원가입

// 1. 아이디 중복 체크 (아이디 찾기에서도 사용)
export const checkDuplicateId = async (connect, email) => {
    const response = await connect('post', '/users/find/id', {
        email
    });
    return response.data;
}

// 2. 이메일 인증 요청
export const checkValidateEmail = async (connect, email) => {
    const response = await connect('post', '/users/verify/email', {
        email
    });
    return response.data;
}

// 3. 인증번호 확인
export const checkVerificationCode = async (connect, code, email) => {
    const response = await connect('post', `/users/verify/${code}`, {
        email
    });
    return response.data;
}

// 4. 회원가입 완료
export const signup = async (connect, email, password, nickname) => {
    return await connect('post', '/users/signup', {
        email,
        password,
        nickname
    });
}

//// 

// 아이디 & 비밀번호 찾기

// 비밀번호 재설정 링크 전송
export const sendPasswordResetEmail = async (connect, email) => {
    try {
        const response = await connect('post', '/users/find/password', { email });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to send password reset email.');
    }
};


// 비밀번호 재설정 인증번호 요청
export const verifyVerificationCode = async (connect, uuid, code) => {
    const response = await connect('post', `/users/verify/${uuid}/${code}`)
    return response.data;
}

// 비밀번호 재설정
export const resetPassword = async (connect, uuid, email, newPassword) => {
    try {
        const response = await connect('put', `/users/change/password/${uuid}`, {
            email,
            newPassword
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to reset password.');
    }
};