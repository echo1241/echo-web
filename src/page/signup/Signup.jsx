import "./signup.css";
import {Link} from "react-router-dom";

function Signup() {
    return (
        <div className="signup">
            <img src="images/signup.jpg" alt="signup image" className="signup__img"/>

                <form action="" className="container">
                    <h1 className="signup__title">Sign Up</h1>

                    <div className="signup__content">
                        <div className="signup__box">
                            <i className="ri-user-3-line signup__icon"></i>

                            <div className="signup__box-input">
                                <input type="email" required className="signup__input" id="signup-email" placeholder=" "/>
                                    <label for="signup-email" className="signup__label">Email</label>
                            </div>
                        </div>

                        <div className="signup__box">
                            <i className="ri-lock-2-line signup__icon"></i>

                            <div className="signup__box-input">
                                <input type="password" required className="signup__input" id="signup-pass" placeholder=" "/>
                                    <label for="signup-pass" className="signup__label">Password</label>
                                    <i className="ri-eye-off-line signup__eye" id="signup-eye"></i>
                            </div>
                        </div>

                        <div className="signup__box">
                            <i className="ri-pencil-line signup__icon"></i>

                            <div className="signup__box-input">
                                <input type="text" required className="signup__input" id="signup-intro" placeholder=" "/>
                                    <label for="signup-intro" className="signup__label">One-line Introduction</label>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="signup__button">Sign Up</button>

                    <p className="signup__login">
                        Already have an account? <Link to="/login">Login</Link>
                    </p>
                </form>
        </div>
    );
}

export default Signup;