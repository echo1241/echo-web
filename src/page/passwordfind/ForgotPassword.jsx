import React, { useState } from 'react';
import './ForgotPassword.css'; // 스타일 시트
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail, resetPassword } from '../../api/auth'; // API 함수

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showResetForm, setShowResetForm] = useState(false); // 비밀번호 재설정 폼 보이기 상태
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [userId, setUserId] = useState(null); // 사용자 ID (예시로 설정)

    // 비밀번호 재설정 링크 전송 처리
    const handleSendResetLink = async (e) => {
        e.preventDefault();
        try {
            await sendPasswordResetEmail(email);
            setMessage('Password reset link has been sent to your email.');
            setError('');
            setShowResetForm(true); // 비밀번호 재설정 폼 보이기
        } catch (err) {
            setError('Failed to send password reset email.');
            setMessage('');
            console.error(err);
        }
    };

    // 비밀번호 재설정 처리
    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            setMessage('');
            return;
        }
        try {
            if (userId) {
                await resetPassword(userId, currentPassword, newPassword);
                setMessage('Password has been reset successfully.');
                setError('');
            } else {
                setError('User ID is not available.');
            }
        } catch (err) {
            setError('Failed to reset password.');
            setMessage('');
            console.error(err);
        }
    };

    return (
        <div className="signup">
            <img src="images/signup.jpg" alt="signup image" className="signup__img"/>

            <form className="container">
                <h1 className="signup__title">Forgot Password</h1>

                <div className="signup__content">
                    <div className="signup__box">
                        <i className="ri-user-3-line signup__icon"></i>

                        <div className="signup__box-input">
                            <input
                                type="email"
                                required
                                className="signup__input"
                                id="reset-email"
                                placeholder=" "
                                value={email}
                                onChange={e => setEmail(e.target.value)}
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

                {showResetForm && (
                    <div className="reset-form">
                        <input
                            type="password"
                            required
                            className="signup__input"
                            placeholder="Current Password"
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            required
                            className="signup__input"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            required
                            className="signup__input"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                        />
                        <button
                            onClick={handlePasswordReset}
                            className="signup__button"
                            disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword}
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
