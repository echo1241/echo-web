import "./signup.css";
import {Link, useNavigate} from "react-router-dom";
import { useRef } from "react";
import { signup } from "../../api/auth";

function Signup() {
    // useRef 추가
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const nicknameRef = useRef(null);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        const email = emailRef.current.value;
        const password = passwordRef.current.value;
        const nickname = nicknameRef.current.value;
        
        try {
            const response = await signup(email, password, nickname);
            alert("회원가입이 완료되었습니다.");
            navigate("/login");
        } catch (e) {
            console.log(e);
        }
        
    }

    return (
        <div className="signup">
            <img src="images/signup.jpg" alt="signup image" className="signup__img"/>

                <form action="" className="container">
                    <h1 className="signup__title">Sign Up</h1>

                    <div className="signup__content">
                        <div className="signup__box">
                            <i className="ri-user-3-line signup__icon"></i>

                            <div className="signup__box-input">
                                <input ref={emailRef} type="email" required className="signup__input" id="signup-email" placeholder=" "/>
                                    <label htmlFor="signup-email" className="signup__label">Email</label>
                            </div>
                        </div>

                        <div className="signup__box">
                            <i className="ri-lock-2-line signup__icon"></i>

                            <div className="signup__box-input">
                                <input ref={passwordRef} type="password" required className="signup__input" id="signup-pass" placeholder=" "/>
                                    <label htmlFor="signup-pass" className="signup__label">Password</label>
                                    <i className="ri-eye-off-line signup__eye" id="signup-eye"></i>
                            </div>
                        </div>

                        <div className="signup__box">
                            <i className="ri-pencil-line signup__icon"></i>

                            <div className="signup__box-input">
                                <input ref={nicknameRef} type="text" required className="signup__input" id="signup-intro" placeholder=" "/>
                                    <label htmlFor="signup-intro" className="signup__label">nickname</label>
                            </div>
                        </div>
                    </div>

                    <button className="signup__button" onClick={handleSignup}>Sign Up</button>

                    <p className="signup__login">
                        Already have an account? <Link to="/login">Login</Link>
                    </p>
                </form>
        </div>
    );
}

export default Signup;