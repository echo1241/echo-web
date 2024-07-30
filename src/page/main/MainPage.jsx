import "./mainPage.css";

// <수정사항>
// 채팅 div에서 오른쪽 사이드바 나오게
//  할려면 위 아이콘 박스와 밑 채팅 박스를 나누어서
//  사이드바 나오면 밑 채팅 넓이가 동적으로 동작하게?

// <추가>
// 검색바 처음에 돋보기 모양이였다가 텍스트 입력되면
// 돋보기 모양이x로 바뀌게
// 검색바 클릭시 길이 늘어나는거 할건가?

function MainPage() {
    return (
        <>
            <div className="social cell">
                <div className="add"></div>
                <div className="sound-img"></div>
            </div>
            <div className="main cell">
                <div className="sub">
                    <div className="voice cell">
                        <hr className="line" />
                        <div className="icon-box">
                            <div className="profile cell">
                            </div>
                            <div className="mic cell"></div>
                            <div className="sound cell"></div>
                            <div className="setting cell"></div>
                        </div>
                    </div>

                    <div className="chat cell">
                        <div className="top-box cell">
                            <div className="chat-names cell">
                                <a className="chat-name">#</a>
                            </div>
                            <div className="thread top-icon cell"></div>
                            <div className="thread top-icon cell"></div>
                            {/* 검색 */}
                            <input type="search" className="top-icon"/>
                            <div className="thread top-icon cell"></div>
                            <div className="thread top-icon cell"></div>
                            <div className="thread top-icon cell"></div>
                            <div className="thread top-icon cell"></div>
                        </div>
                        <hr className="line" />
                        <div className="send-chat">
                            <div className="plus icon cell"></div>
                            <div className="img icon cell"></div>
                            <div className="send icon cell"></div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default MainPage;