import "./login.css";
import { Link, useNavigate } from "react-router-dom";
import { login } from '../../api/auth';
import React, { useEffect, useRef, useState } from "react";
import Popup from "../../component/modal/Popup";
import { connect } from "../../util/axiosUtil";

function Login() {
    const [isPopupOpened, setIsPopupOpened] = useState(false);
    const [error, setError] = useState('');
    const [isChecked, setIsChecked] = useState(false);
    const navigate = useNavigate(); // useNavigate 훅 사용

    // useRef 변경
    const emailRef = useRef(null);
    const passwordRef = useRef(null);

    useEffect(() => {
        // 체크박스 관련 체킹
        if (localStorage.getItem("email")) {
            setIsChecked(true);
            emailRef.current.value = localStorage.getItem("email");
        }
    }, [])

    const handleLogin = async (e) => {
        e.preventDefault();
        const email = emailRef.current.value;
        const password = passwordRef.current.value;

        emailLocalStorageSave(email);

        const response = await login(email, password);

        if (response?.status === 200){
            const { accessToken, refreshToken } = response.data;

            sessionStorage.setItem("accessToken", accessToken);
            sessionStorage.setItem("refreshToken", refreshToken);

            navigate("/main");
        } else {
            setError(response?.data?.msg)
        }
    };

    const emailLocalStorageSave = (email) => {
        if (!isChecked) {
            localStorage.removeItem("email");
            return;
        }
        localStorage.setItem("email", email);
    }

    const checkItemHanlder = (e) => {
        setIsChecked(!isChecked);
    }

    const openPopup = (e) => {
        setIsPopupOpened(true);
    }

    return (
        <div className="login">
            {isPopupOpened && <Popup closePopup={() => setIsPopupOpened(false)}>
                로그인에서 불러왔습니다.
                <input type="email" required className="login__input" id="login-email" placeholder=" " />
            </Popup>}
            <img src="images/login-bg.jpg" alt="login image" className="login__img"/>

            <form onSubmit={handleLogin} className="container">
                <h1 className="login__title">Login</h1>

                <div className="login__content">
                    <div className="login__box">
                        <i className="ri-user-3-line login__icon"></i>

                        <div className="login__box-input">
                            <input ref={emailRef} type="email" required className="login__input" id="login-email" placeholder=" " />
                            <label htmlFor="login-email" className="login__label">Email</label>
                        </div>
                    </div>

                    <div className="login__box">
                        <i className="ri-lock-2-line login__icon"></i>

                        <div className="login__box-input">
                            <input ref={passwordRef} type="password" required className="login__input" id="login-pass" placeholder=" "/>
                            <label htmlFor="login-pass" className="login__label">Password</label>
                            <i className="ri-eye-off-line login__eye" id="login-eye"></i>
                        </div>
                    </div>
                </div>

                <div className="login__check">
                    <div className="login__check-group">
                        <input type="checkbox" className="login__check-input" id="login-check" />
                        <label htmlFor="login-check" className="login__check-label">Remember me</label>
                    </div>

                    <Link to="/passwordfind" className="login__forgot">Forgot Password?</Link>
                </div>

                {error && <p className="login__error">{error}</p>}

                <button type="submit" className="login__button">Login</button>

                <p className="login__register">
                    Don't have an account? <Link to="/signup">Register</Link>
                </p>
            </form>
        </div>
    );
}

export default Login;
