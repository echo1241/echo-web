import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SpaceManager from '../../component/space/SpaceManager';
import ChannelManager from '../../component/channel/ChannalManager';
import TextChat from '../../component/TextChat';
import './mainPage.css';
import VideoCall from "../../component/videocall/VideoCall";
import { useAxios } from '../../hook/useAxios';
import { EventSourceApi } from '../../api/sse';
import Popup from "../../component/modal/Popup";

function MainPage() {
    const [showAddButton, setShowAddButton] = useState(false);
    const [popupVisible, setPopupVisible] = useState(false);
    const [channelName, setChannelName] = useState('');
    const [channelType, setChannelType] = useState('text');
    const [spaceId, setSpaceId] = useState(null);
    const [error, setError] = useState('');
    const [showChannelManager, setShowChannelManager] = useState(false);
    const [videoCallVisible, setVideoCallVisible] = useState(false);
    const [videoCallChannelId, setVideoCallChannelId] = useState(null);
    const [textChatVisible, setTextChatVisible] = useState(false);
    const [textChatChannelId, setTextChatChannelId] = useState(null);
    const [dmVisible, setDmVisible] = useState(false);
    const [nicknamePopupVisible, setNicknamePopupVisible] = useState(false);
    const [nickname, setNickname] = useState('');
    const [user, setUser] = useState({});
    const [dmList, setDmList] = useState([]); // DM 목록 상태 추가
    const { authenticationConnect } = useAxios();

    useEffect(() => {
        const getUser = async () => {
            const res = await authenticationConnect('get', '/users/profile');
            console.log(res.data);
            setUser(res.data);
        }
        getUser();

        // sse 연결
        const host = process.env.REACT_APP_SERVER;
        const url = `http://${host}/notice/sse/connect`;

        const options = {
            headers: {
                "Authorization": `Bearer ${sessionStorage.getItem('accessToken')}`
            }
        }

        new EventSourceApi(url, options, handleOnMessage);
    }, [])

    const handleOnMessage = data => {
        const message = data;
        console.log(message);
    }

    const handleAddClick = (id) => {
        setSpaceId(id); // 스페이스 ID 설정
        setShowAddButton(true); // 버튼을 보이게 설정
        setShowChannelManager(true); // 채널 매니저 보이기 설정
    };

    const handleDmClick = async () => {
        setDmVisible(!dmVisible);
            await fetchDmList(); // DM 목록 가져오기
    };

    const fetchDmList = async () => {
        try {
            const response = await authenticationConnect('get', '/dm/all'); // DM 목록 조회 API 호출
            setDmList(response.data); // DM 목록 상태 업데이트
        } catch (error) {
            console.error('Error fetching DM list:', error);
        }
    };

    const handlePopupClose = () => {
        setPopupVisible(false);
        setChannelName('');
        setChannelType('text');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!spaceId) {
            setError('Space ID is required.');
            return;
        }

        try {
            const payload = {
                channelName,
                channelType: channelType
            };

            await authenticationConnect('post', `/spaces/${spaceId}/channels`, payload);

            handlePopupClose();
            setShowAddButton(false);
        } catch (error) {
            console.error('Error submitting channel:', error);
            setError('Failed to submit channel');
        }
    };

    const handleCloseChannelManager = () => {
        setShowChannelManager(false);
        setSpaceId(null);
    };

    const handleChannelClick = (channel) => {
        setChannelName(channel.channelName);
        console.log(channel.channelType)

        if (channel.channelType === 'V') {
            setVideoCallChannelId(channel.id);
            setTextChatVisible(false);
            setVideoCallVisible(false);
            setVideoCallVisible(true);
        } else if (channel.channelType === 'T') {
            setTextChatChannelId(channel.id);
            setVideoCallVisible(false);
            setTextChatVisible(true);
        }
    };

    const handleNicknameSubmit = async (event) => {
        event.preventDefault();

        if (!nickname.trim()) {
            setError('Nickname is required.');
            return;
        }

        try {
            // DM 생성 API 호출
            await authenticationConnect('post', '/dm/create', {
                recipientEmail: nickname,  // DM을 받을 사용자 이메일
            });

            setNicknamePopupVisible(false);
            setDmVisible(true);  // DM 목록을 다시 불러오거나 UI 갱신
        } catch (error) {
            console.error('Error creating DM:', error);
            setError('Failed to create DM channel');
        }
    };

    return (
        <div className="main__wrap">
            <div className="social cell">
                <SpaceManager onAddClick={handleAddClick} onDmClick={handleDmClick} />
            </div>

            <div className="main cell">
                <div className="sub">
                    <div className="voice cell">
                        <hr className="line"></hr>

                        {dmVisible && (
                            <div className="dm-text">
                                DM
                                <button className="nickname-button" onClick={() => setNicknamePopupVisible(true)}>+</button>
                            </div>
                        )}

                        {dmVisible && (
                            <div className="dm-list">
                                {dmList.length > 0 ? (
                                    <ul>
                                        {dmList.map(dm => (
                                            <li key={dm.id}>{dm.nickname}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No DMs available</p>
                                )}
                            </div>
                        )}

                        {nicknamePopupVisible && (
                            <Popup closePopup={() => setNicknamePopupVisible(false)}>
                                <h2>Enter Nickname</h2>
                                <form onSubmit={handleNicknameSubmit}>
                                    <div className="form-group">
                                        <label htmlFor="nickname">Nickname:</label>
                                        <input
                                            type="text"
                                            id="nickname"
                                            value={nickname}
                                            onChange={(e) => setNickname(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button type="submit">Submit</button>
                                </form>
                            </Popup>
                        )}

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
                                <span className="chat-name"># {channelName}</span>
                            </div>
                        </div>
                        <hr className="line"/>

                        <div className="chat-box cell">
                            {videoCallVisible && videoCallChannelId && (
                                <VideoCall channelId={videoCallChannelId} user={user}/>
                            )}

                            {textChatVisible && <TextChat channelId={textChatChannelId}/>}
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
        </div>
    );
}

export default MainPage;
