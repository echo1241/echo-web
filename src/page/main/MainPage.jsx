import React, { useState } from 'react';
import axios from 'axios';  // axios 임포트
import './mainPage.css';
import SpaceManager from '../../api/SpaceManager';
import Popup from '../../component/modal/Popup';  // Popup 컴포넌트 임포트

function MainPage() {
    const [showAddButton, setShowAddButton] = useState(false); // 버튼의 가시성 상태
    const [popupVisible, setPopupVisible] = useState(false);  // 팝업의 가시성 상태
    const [channelName, setChannelName] = useState(''); // 채널 이름 상태
    const [channelType, setChannelType] = useState('text'); // 채널 타입 상태
    const [spaceId, setSpaceId] = useState(null); // 선택된 스페이스 ID 상태
    const [error, setError] = useState(''); // 오류 상태

    const handleAddClick = (id) => {
        console.log('Space ID from SpaceManager:', id); // ID 콘솔 출력
        setSpaceId(id); // 스페이스 ID 설정
        setShowAddButton(true); // 버튼을 보이게 설정
    };

    const handlePlusButtonClick = () => {
        setPopupVisible(true); // 팝업을 보이게 설정
    };

    const handlePopupClose = () => {
        setPopupVisible(false); // 팝업을 숨김
        setChannelName(''); // 채널 이름 초기화
        setChannelType('text'); // 채널 타입 초기화
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!spaceId) {
            setError('Space ID is required.');
            return;
        }

        try {
            // 요청할 데이터
            const payload = {
                channelName,
                channelType: channelType === 'text' ? 'T' : 'V'
            };

            // 백엔드 API 호출
            await axios.post(`/spaces/${spaceId}/channels`, payload);

            // 성공 시 처리
            handlePopupClose(); // 팝업 닫기
            setShowAddButton(false); // + 버튼 숨기기

        } catch (error) {
            console.error('Error submitting channel:', error);
            setError('Failed to submit channel'); // 오류 메시지 설정
        }
    };

    return (
        <>
            <div className="social cell">
                <SpaceManager onAddClick={handleAddClick} />
            </div>

            <div className="main cell">
                <div className="sub">
                    <div className="voice cell">
                        <hr className="line" />
                        {/* 조건부 렌더링: showAddButton 상태에 따라 + 버튼과 텍스트 표시 */}
                        {showAddButton && (
                            <div className="plus-container" onClick={handlePlusButtonClick}>
                                <span className="plus-text">Channel</span>
                                <button className="plus-button">+</button>
                            </div>
                        )}
                        <div className="icon-box">
                            <div className="profile cell"></div>
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
                            <input type="search" className="top-icon" />
                            <div className="thread top-icon cell"></div>
                            <div className="thread top-icon cell"></div>
                            <div className="thread top-icon cell"></div>
                            <div className="thread top-icon cell"></div>
                        </div>
                        <hr className="line" />

                        <div className="chat-box cell">
                            <div id="messages-list">
                                {/* 메시지 목록이 여기에 들어갑니다 */}
                            </div>
                        </div>
                        <div className="msg-wrap">
                            <div className="send-chat">
                                <div className="plus icon cell"></div>
                                <div className="img icon cell"></div>
                                <input type="text" className="chat-text" placeholder="메시지를 입력하세요..."/>
                                <button className="send icon cell"></button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* 팝업창 */}
            {popupVisible && (
                <Popup closePopup={handlePopupClose}>
                    <h2>Add Channel</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="channelName">Channel Name:</label>
                            <input
                                type="text"
                                id="channelName"
                                value={channelName}
                                onChange={(e) => setChannelName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Channel Type:</label>
                            <div>
                                <input
                                    type="radio"
                                    id="text"
                                    name="channelType"
                                    value="text"
                                    checked={channelType === 'text'}
                                    onChange={(e) => setChannelType(e.target.value)}
                                />
                                <label htmlFor="text">Text</label>
                            </div>
                            <div>
                                <input
                                    type="radio"
                                    id="voice"
                                    name="channelType"
                                    value="voice"
                                    checked={channelType === 'voice'}
                                    onChange={(e) => setChannelType(e.target.value)}
                                />
                                <label htmlFor="voice">Voice</label>
                            </div>
                        </div>
                        <button type="submit">Create Channel</button>
                    </form>
                    {error && <p className="error">{error}</p>} {/* 오류 메시지 표시 */}
                </Popup>
            )}
        </>
    );
}

export default MainPage;
