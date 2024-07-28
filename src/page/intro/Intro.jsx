import "./intro.css";

function Intro() {
    return (
        <div className="card">
            <div className="circle">
                <img src="images/echo.png" alt="" className="logo"/>
            </div>
            <div className="content">
                <h2>Echo</h2>
                <p>모든 소리를 하나로 담아내어 소통의 순간을 하나로 이어주는 텍스트부터 화상까지 완벽한 통합 커뮤니케이션 플랫폼</p>
                <a href="../LoginPage/Login.html">Let's go</a>
            </div>
            <img src="images/mic-bg.png" alt="" className="product_img"></img>
        </div>
    );
}

export default Intro;