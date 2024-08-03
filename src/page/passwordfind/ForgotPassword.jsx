import React, { useEffect, useRef, useState } from 'react';
import './ForgotPassword.css'; // 스타일 시트
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail, resetPassword, verifyVerificationCode } from '../../api/api'; // API 함수

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showResetForm, setShowResetForm] = useState(false); // 비밀번호 재설정 폼 보이기 상태
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [uuid, setUuid] = useState('');

    const [showCodeForm, setShowCodeForm] = useState(false);  

    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const codeRef = useRef(null);
    const confirmPasswordRef = useRef(null);

    const handleSendResetLink = async (e) => {
        e.preventDefault();
        setUuid(null);

        const email = emailRef.current.value;

        e.preventDefault();
        try {
            const response = await sendPasswordResetEmail(email);
            console.log(response);
            setUuid(response);
            setMessage('해당 이메일로 인증번호 전송을 완료했습니다. 5분 이내에 입력해주세요.');
            setError('');
            setShowCodeForm(true); 
        } catch (err) {
            console.error(e?.response?.data?.msg);
            setError(e?.response?.data?.msg);
            setMessage('');
            console.error(err);
        }
    };

    // 인증번호 확인
    const handleCodeVerify = async (e) => {
        e.preventDefault();
        const code = codeRef.current.value;
        console.log(uuid);
        try {
            if (uuid) {
                await verifyVerificationCode(uuid, code);
                setMessage('인증이 완료되었습니다.');
                setError('');
                setShowResetForm(true); // 비밀번호 재설정 폼 보이기
                setShowCodeForm(false); //인증번호 입력 폼 삭제
            } else {
                setError('에러가 발생했습니다.');
            }
        } catch (err) {
            console.error(e?.response?.data?.msg);
            setError(e?.response?.data?.msg);
            setMessage('');
        }
    };

    // 비밀번호 재설정 처리
    const handlePasswordReset = async (e) => {
        e.preventDefault();

        const email = emailRef.current.value;
        const newPassword = passwordRef.current.value;
        const confirmPassword = confirmPasswordRef.current.value;
        
        if (newPassword !== confirmPassword) {
            setError('비밀번호가 동일하지 않습니다. 다시 입력해주세요.');
            setMessage('');
            return;
        }

        try {
            if (uuid) {
                const response = await resetPassword(uuid, email, newPassword);
                setError('비밀번호 재설정이 완료되었습니다.');
                console.log(response);
            } else {
                setError('에러가 발생했습니다.');
            }
        } catch (err) {
            console.error(e?.response?.data?.msg);
            setError(e?.response?.data?.msg);
        }
    };

    return (
        <div className="signup">
            <img src="images/signup.jpg" alt="signup image" className="signup__img"/>

            <form className="container">
                <h1 className="signup__title">Find Account</h1>

                <div className="signup__content">
                    <div className="signup__box">
                        <i className="ri-user-3-line signup__icon"></i>

                        <div className="signup__box-input">
                            <input ref={emailRef}
                                type="email"
                                required
                                className="signup__input"
                                id="reset-email"
                                placeholder=" "
                            />
                            <label htmlFor="reset-email" className="signup__label">Email</label>
                        </div>
                    </div>
                </div>

                {message && <p className="signup__message">{message}</p>}
                {error && <p className="signup__error">{error}</p>}

                {!showResetForm && (
                    <button onClick={handleSendResetLink} className="signup__button">
                        Send Reset Link
                    </button>
                )}

                { showCodeForm && <>
                        <div>인증번호</div>
                        <input ref={codeRef} type="text" required className="signup__input" id="signup-email" placeholder=" "/>
                        <button className="signup__button" onClick={handleCodeVerify}>인증번호 확인</button>
                    </>}

                {showResetForm && (
                    <div className="reset-form">
                        <input ref={passwordRef}
                            type="password"
                            required
                            className="signup__input"
                            placeholder="New Password"
                        />
                        <input ref={confirmPasswordRef}
                            type="password"
                            required
                            className="signup__input"
                            placeholder="Confirm New Password"
                        />
                        <button
                            onClick={handlePasswordReset}
                            className="signup__button"
                        >
                            Reset Password
                        </button>
                    </div>
                )}

                <p className="signup__login">
                    Remember your password? <Link to="/login">Login</Link>
                </p>
            </form>
        </div>
    );
}

export default ForgotPassword;
