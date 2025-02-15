import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Intro from './page/intro/Intro';
import Login from './page/login/Login';
import MainPage from './page/main/MainPage';
import Signup from "./page/signup/Signup";
import { useEffect } from 'react';
import ForgotPassword from "./page/passwordfind/ForgotPassword";
import Oauth from "./page/oauth/Oauth";
import MaintenancePage from './page/maintenance/MaintenancePage';

function App() {
  
  function TokenRedirector() {
    const navigate = useNavigate();
  
    // 인증 관련 확인 API 추가해야됨?
    useEffect(() => {
      if (sessionStorage.getItem("accessToken")) {
        navigate("/main");
      }
    }, [navigate]);
  
    return null;
  }

  return (
    <BrowserRouter>
    <TokenRedirector></TokenRedirector>
    {/* <Header /> */}
    <Routes>
      <Route path="/" element={<Intro />}></Route>
      <Route path="/login" element={<Login />}></Route>
      <Route path="/signup" element={<Signup />}></Route>
      <Route path="/main" element={<MainPage />}></Route>
      <Route path="/passwordfind" element={<ForgotPassword/>}></Route>
      <Route path="/oauth/kakao/callback" element={<Oauth/>}></Route>
      <Route path="/maintenance" element={<MaintenancePage/>}></Route>

    </Routes>
  </BrowserRouter>
  );
}

export default App;
