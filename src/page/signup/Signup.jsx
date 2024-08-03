import "./signup.css";
import {Link, useNavigate} from "react-router-dom";
import { useRef, useState } from "react";
import { checkDuplicateId, checkValidateEmail, checkVerificationCode, signup } from "../../api/api";
import { useAxios } from "../../hook/useAxios";

function Signup() {
    // useRef 추가
    const emailRef = useRef(null);
    const codeRef = useRef(null);
    const passwordRef = useRef(null);
    const nicknameRef = useRef(null);

    const [isDuplicated, setIsDuplicated] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { connect } = useAxios();

    const handleSignup = async (e) => {
        e.preventDefault();
        const email = emailRef.current.value;
        const password = passwordRef.current.value;
        const nickname = nicknameRef.current.value;
        
        try {
            const response = await signup(connect, email, password, nickname);
            alert("회원가입이 완료되었습니다.");
            navigate("/login");
        } catch (e) {
            console.log(e);
            setError(e?.response?.data?.msg);
        }
    }

    const handleEmailCheck = async (e) => {
        e.preventDefault();
        console.log("hello");
        
        const email = emailRef.current.value;

        // 이메일 중복 확인 시작,

        try {
            const response = await checkDuplicateId(connect, email);
            setError(response?.msg);
            if (!response.find) {
                // 중복된 아이디가 없는 것이므로
                // 이메일 인증 요청을 날린다.
                const response = await checkValidateEmail(connect, email);
                // 이메일 인증 번호 입력
                setError("인증 번호가 메일로 전송되었습니다. 10분 내로 입력해주세요.");
                setIsDuplicated(false);
            } else {
                setIsDuplicated(true);
            }
        } catch (e) {
            console.error(e?.response?.data?.msg);
            setIsDuplicated(true);
            setError(e?.response?.data?.msg);
        }
    }

    const handleVerify = async (e) => {
        e.preventDefault();
        const email = emailRef.current.value;
        const code = codeRef.current.value;
        try{
            const response = await checkVerificationCode(connect, code, email);
            setError(response);
            console.log(response);
            setIsDuplicated(true);
        } catch (e) {
            console.log(e?.response?.data?.msg);
            setError(e?.response?.data?.msg);
        }
    }

    return (
        <div className="signup">
            <img src="images/signup.jpg" alt="signup image" className="signup__img"/>

                <form action="" className="container">
                    <h1 className="signup__title">Sign Up</h1>

                    {error && <p className="login__error" style={{marginBottom: "35px"}}>{error}</p>}

                    <div className="signup__content">
                        <div className="signup__box">
                            <i className="ri-user-3-line signup__icon"></i>

                            <div className="signup__box-input">
                                <div>Email</div>
                                <input ref={emailRef} type="email" required className="signup__input" id="signup-email" placeholder=" "/>
                                    {/* <label htmlFor="signup-email" className="signup__label">Email</label> */}
                                                                        
                                <button className="signup__button" onClick={handleEmailCheck}>메일확인</button>
                                
                                { isDuplicated !== null && !isDuplicated && <>
                                <div>인증번호</div>
                                <input ref={codeRef} type="text" required className="signup__input" id="signup-email" placeholder=" "/>
                                <button className="signup__button" onClick={handleVerify}>인증번호 확인</button>
                                </>}
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