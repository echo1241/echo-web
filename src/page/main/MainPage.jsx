import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SpaceManager from '../../component/space/SpaceManager';
import ChannelManager from '../../component/channel/ChannalManager';
import './mainPage.css';
import VideoCall from "../../component/videocall/VideoCall";
import { useAxios } from '../../hook/useAxios';

function MainPage() {
    const [showAddButton, setShowAddButton] = useState(false); // 버튼의 가시성 상태
    const [popupVisible, setPopupVisible] = useState(false);  // 팝업의 가시성 상태
    const [channelName, setChannelName] = useState(''); // 채널 이름 상태
    const [channelType, setChannelType] = useState('text'); // 채널 타입 상태
    const [spaceId, setSpaceId] = useState(null); // 선택된 스페이스 ID 상태
    const [error, setError] = useState(''); // 오류 상태
    const [showChannelManager, setShowChannelManager] = useState(false); // 채널 매니저 가시성 상태
    const [videoCallVisible, setVideoCallVisible] = useState(false); // 화상 통화 가시성 상태
    const [videoCallChannelId, setVideoCallChannelId] = useState(null); // 화상 통화 채널 ID

    const navigate = useNavigate();

    const { authenticationConnect } = useAxios();

    const handleAddClick = (id) => {
        setSpaceId(id); // 스페이스 ID 설정
        setShowAddButton(true); // 버튼을 보이게 설정
        setShowChannelManager(true); // 채널 매니저 보이기 설정
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
                channelType: channelType
            };

            // 백엔드 API 호출
            await authenticationConnect('post', `/spaces/${spaceId}/channels`, payload);

            // 성공 시 처리
            handlePopupClose(); // 팝업 닫기
            setShowAddButton(false); // + 버튼 숨기기

        } catch (error) {
            console.error('Error submitting channel:', error);
            setError('Failed to submit channel'); // 오류 메시지 설정
        }
    };

    const handleCloseChannelManager = () => {
        setShowChannelManager(false); // 채널 매니저 숨기기 설정
        setSpaceId(null); // 스페이스 ID 초기화
    };

    const handleChannelClick = (channel) => {
        setChannelName(channel.channelName);
        console.log(channel.channelType)

        if (channel.channelType === 'V') {
            // 화상 통화 채널 ID 설정 및 화상 통화 컴포넌트 표시
            setVideoCallChannelId(channel.id);
            setVideoCallVisible(true);
        }
    };

    return (
        <div className="main__wrap">
            <div className="social cell">
                <SpaceManager onAddClick={handleAddClick} />
            </div>

            <div className="main cell">
                <div className="sub">
                    <div className="voice cell">
                        <hr className="line"></hr>

                        {/* 채널 매니저 컴포넌트 */}
                        {showChannelManager && (
                            <ChannelManager
                                spaceId={spaceId}
                                onClose={handleCloseChannelManager}
                                onClickChannel={handleChannelClick}
                            />
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
                                <span className="chat-name">#</span>
                            </div>
                        </div>
                        <hr className="line" />

                        <div className="chat-box cell">
                            {videoCallVisible && videoCallChannelId && (
                                <VideoCall channelId={videoCallChannelId} />
                            )}
                            <div id="messages-list">
                                {/* 메시지 목록이 여기에 들어갑니다 */}
                            </div>
                        </div>
                        <div className="msg-wrap">
                            <div className="send-chat">
                                <div className="plus icon cell"></div>
                                <div className="img icon cell"></div>
                                <input type="text" className="chat-text" placeholder="메시지를 입력하세요..." />
                                <button className="send icon cell"></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MainPage;
