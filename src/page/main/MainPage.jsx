import React from 'react';
import './mainPage.css';
import SpaceManager from '../../api/SpaceManager';
import Text from '../../component/TextChat';

function MainPage() {
    const handleAddClick = () => {
        // SpaceManager에서 처리하도록 팝업 열기 로직을 여기에 추가할 수 있습니다.
    };

    return (
        <>
            <div className="social cell">
                <SpaceManager
                    onAddClick={handleAddClick}
                />
            </div>

            <div className="main cell">
                <div className="sub">
                    <div className="voice cell">
                        <hr className="line" />
                        <div className="icon-box">
                            <div className="profile cell"></div>
                            <div className="mic cell"></div>
                            <div className="sound cell"></div>
                            <div className="setting cell"></div>
                        </div>
                    </div>

                    <div className="chat cell">
                        <Text/>

                        {/* <div className="top-box cell">
                            <div className="chat-names cell">
                                <a className="chat-name">#</a>
                            </div>
                            <div className="thread top-icon cell"></div>
                            <div className="thread top-icon cell"></div>
                            <input type="search" className="top-icon" />
                            <div className="thread top-icon cell"></div>
                            <div className="thread top-icon cell"></div>
                            <div className="thread top-icon cell"></div>
                            <div className="thread top-icon cell"></div>
                        </div>
                        <hr className="line" />

                        <div className="chat-box cell">
                            <div id="messages-list">
                                {/* 메시지 목록이 여기에 들어갑니다 }
                            </div>
                        </div>
                        <div className="msg-wrap">
                            <div className="send-chat">
                                <div className="plus icon cell"></div>
                                <div className="img icon cell"></div>
                                <input type="text" className="chat-text" placeholder="메시지를 입력하세요..." />
                                <button className="send icon cell"></button>
                            </div>
                        </div> */}

                    </div>
                </div>
            </div>
        </>
    );
}

export default MainPage;
