import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Intro from './page/intro/Intro';
import Login from './page/login/Login';
import MainPage from './page/main/MainPage';
import Signup from "./page/signup/Signup";

function App() {
  return (
    <BrowserRouter>
    {/* <Header /> */}
    <Routes>
      <Route path="/" element={<Intro />}></Route>
      <Route path="/login" element={<Login />}></Route>
      <Route path="/signup" element={<Signup />}></Route>
      <Route path="/main" element={<MainPage />}></Route>


    </Routes>
  </BrowserRouter>
  );
}

export default App;
