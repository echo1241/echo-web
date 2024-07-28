import "./login.css";
import {Link} from "react-router-dom";

function Login() {
    return (
        <div className="login">
            <img src="images/login-bg.jpg" alt="login image" className="login__img"/>

            <form action="" className="container">
                <h1 className="login__title">Login</h1>

                <div className="login__content">
                    <div className="login__box">
                        <i className="ri-user-3-line login__icon"></i>

                        <div className="login__box-input">
                            <input type="email" required className="login__input" id="login-email" placeholder=" "/>
                            <label for="login-email" className="login__label">Email</label>
                        </div>
                    </div>

                    <div className="login__box">
                        <i className="ri-lock-2-line login__icon"></i>

                        <div className="login__box-input">
                            <input type="password" required className="login__input" id="login-pass" placeholder=" "/>
                            <label for="login-pass" className="login__label">Password</label>
                            <i className="ri-eye-off-line login__eye" id="login-eye"></i>
                        </div>
                    </div>
                </div>

                <div className="login__check">
                    <div className="login__check-group">
                        <input type="checkbox" className="login__check-input" id="login-check"/>
                        <label for="login-check" className="login__check-label">Remember me</label>
                    </div>

                    <a href="#" className="login__forgot">Forgot Password?</a>
                </div>

                <button type="submit" className="login__button">Login</button>

                <p className="login__register">
                    Don't have an account? <Link to="/signup">Register</Link>
                </p>
            </form>
        </div>
    );
}

export default Login;