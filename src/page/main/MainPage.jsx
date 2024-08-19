import React, { useEffect, useState } from 'react';
import SpaceManager from '../../component/space/SpaceManager';
import ChannelManager from '../../component/channel/ChannalManager';
import TextChat from '../../component/textchat/TextChat';
import './mainPage.css';
import VideoCall from "../../component/videocall/VideoCall";
import { useAxios } from '../../hook/useAxios';
import { EventSourceApi } from '../../api/sse';
import Thread from '../../component/thread/Thread';
import Popup from "../../component/modal/Popup";

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
    const [textChatVisible, setTextChatVisible] = useState(false); // 텍스트 채팅 가시성 상태
    const [textChatChannelId, setTextChatChannelId] = useState(null); // 텍스트 채팅 채널 ID
    const [messages, setMessages] = useState([]);
    const [threadVisible, setThreadVisible] = useState(false); // 스레드 가시성 상태
    const [threadTextInfo, setThreadTextInfo] = useState(null); // 스레드에 보낼 텍스트 정보
    const [textChatDmId, setTextChatDmId] = useState(null); // DM ID 상태 추가
    const [dmVisible, setDmVisible] = useState(false);
    const [emailPopupVisible, setReceiverEmailPopupVisible] = useState(false);
    const [email, setReceiverEmail] = useState('');
    const [user, setUser] = useState({});
    const [dmList, setDmList] = useState([]); // DM 목록 상태 추가
    const [userList, setUserList] = useState([]); // 유저 목록 상태 추가
    const [showUserList, setShowUserList] = useState(false); // 유저 리스트 표시 상태 추가
    const [lastReadMessageId, setLastReadMessageId] = useState(null);
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

        console.log("mainPage 랜더링 완료");
    }, [])

    useEffect(() => {
        if (spaceId) {
            fetchUserList();
        }
    }, [spaceId]);

    const handleOnMessage = data => {
        const message = data;
        console.log(message);
    }

    const fetchUserList = async () => {
        try {
            const response = await authenticationConnect('get', `/spaces/${spaceId}/members`); // 유저 목록 조회 API 호출
            setUserList(response.data); // 유저 목록 상태 업데이트
        } catch (error) {
            console.error('Error fetching user list:', error);
        }
    };

    const handleAddClick = (id) => {
        setSpaceId(id); // 스페이스 ID 설정
        setDmVisible(false);
        setShowAddButton(true); // 버튼을 보이게 설정
        setShowChannelManager(true); // 채널 매니저 보이기 설정
        setShowUserList(true); // 유저 리스트 보이기 설정
    };

    const handleDmClick = async () => {
        setDmVisible(true);
        setShowUserList(false);
        setThreadVisible(false);
        setShowChannelManager(false);
        setTextChatVisible(false);
        setVideoCallVisible(false);
        setChannelName(false);
        await fetchDmList(); // DM 목록 가져오기
    };

    const fetchDmList = async () => {
        try {
            const response = await authenticationConnect('get', '/dm'); // DM 목록 조회 API 호출
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
        setUserList([]); // 유저 목록 초기화
        setShowUserList(false); // 유저 리스트 숨기기
    };

    const handleChannelClick = (channel) => {
        setChannelName(channel.channelName);
        // console.log(channel.channelType)
        
        // 채널 변경 시 스레드 닫아줌
        setThreadVisible(false);

        if (channel.channelType === 'V') {
            setVideoCallChannelId(channel.id);
            setTextChatVisible(false);
            setVideoCallVisible(false);
            setVideoCallVisible(true);
        } else if (channel.channelType === 'T') {
            setTextChatChannelId(channel.id);
            setVideoCallVisible(false);
            setTextChatVisible(true);
            setShowUserList(true);
        }
    };

    const handleThread = (textId, text, type) => e => {
        // console.log(textId);
        // console.log(text);
        setThreadVisible(false);
        setThreadVisible(true);
        setThreadTextInfo({
            text,
            textId,
            type
        });
    }

    const closeThread = (e) => {
        setThreadVisible(false);
    }

    const handleDmItemClick = (dmId, nickname) => {
        setTextChatDmId(dmId); // DM ID 설정
        setChannelName(nickname);
        setTextChatChannelId(''); // 채널 ID 초기화
        setVideoCallVisible(false);
        setShowUserList(false);
        setTextChatVisible(true);
    };

    const handleEmailSubmit = async (event) => {
        event.preventDefault();

        if (!email.trim()) {
            setError('email is required.');
            return;
        }

        try {
            // DM 생성 API 호출
            await authenticationConnect('post', '/dm/create', {
                recipientEmail: email,  // DM을 받을 사용자 이메일
            });

            setReceiverEmailPopupVisible(false);
            setDmVisible(true);  // DM 목록을 다시 불러오거나 UI 갱신
        } catch (error) {
            console.error('Error creating DM:', error);
            setError('Failed to create DM channel');
        }
    };

    const handleError = (errorMessage) => {
        alert(errorMessage);
        setTextChatVisible(false);
        setVideoCallVisible(false);
        setChannelName(false);
    };

    const handleRefresh = () => {
        setTextChatVisible(false);
        setVideoCallVisible(false);
    };
    
    const setMainPageLastReadMessage = (lastReadMessageId) => {
        console.log("마지막에 읽은 messsageId: ", lastReadMessageId);
        setLastReadMessageId(lastReadMessageId);
    }

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
                            <div className="dm-container">
                                <h3 className="dm-text">DM</h3>
                                <button className="email-button" onClick={() => setReceiverEmailPopupVisible(true)}>+</button>
                            </div>
                        )}

                        {dmVisible && (
                            <div className="dm-list">
                                {dmList.length > 0 ? (
                                    <ul>
                                        {dmList.map(dm => {
                                            const nickname = user.id === dm.senderId ? dm.receiver : dm.sender;
                                            return (
                                                <li className="dm-list-user" key={dm.id} onClick={() => handleDmItemClick(dm.id, nickname)}>
                                                    {nickname}
                                                </li>
                                            )
                                        })}
                                    </ul>
                                ) : (
                                    <p></p>
                                )}
                            </div>
                        )}

                        {emailPopupVisible && (
                            <Popup closePopup={() => setReceiverEmailPopupVisible(false)}>
                                <h2>Enter Receiver Email</h2>
                                <form onSubmit={handleEmailSubmit}>
                                    <div className="form-group">
                                        <label htmlFor="email">email:</label>
                                        <input
                                            type="text"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setReceiverEmail(e.target.value)}
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
                                setMainPageLastReadMessage={setMainPageLastReadMessage}
                                setMessages={setMessages}
                                setTextChatVisible={setTextChatVisible}
                                setTopChannelName={setChannelName}
                            />
                        )}

                        <div className="icon-box">
                            <div className="profile cell"><img src="images/echo.png" alt="" className="view"/></div>
                            <div className="userNickname">{user.nickname}</div>
                        </div>
                    </div>

                    <div className="chat cell">
                        <div className="top-box cell">
                            <div className="chat-names cell">
                                <span className="chat-name"># {channelName}</span>
                            </div>
                        </div>
                        <hr className="line" />

                        <div className="chat-box cell">
                            {videoCallVisible && videoCallChannelId && (
                                <VideoCall channelId={videoCallChannelId} user={user} onError={handleError} onRefresh={handleRefresh} />
                            )}
                            {textChatVisible && <TextChat 
                                user={user}
                                channelId={textChatChannelId} 
                                channelName={channelName} 
                                spaceId={spaceId} 
                                handleThread={handleThread}
                                dmId={textChatDmId}
                                lastReadMessageId={lastReadMessageId}
                                setLastReadMessageId={setLastReadMessageId}
                                onError={handleError}
                                messages={messages}
                                setMessages={setMessages}
                            />}
                        </div>
                        {showUserList && (
                            <div className="user-list cell">
                                <h3>스페이스에<br/>입장한<br/>유저 목록</h3>
                                {userList.length > 0 ? (
                                    <ul>
                                        {userList.map(user => (
                                            <li className='space-user-name' key={user.id}>{user.nickname}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>사용자가 없습니다</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 스레드 시작 */}
                    {threadVisible && 
                    <div className='thread'>
                        <Thread 
                            spaceId={spaceId}
                            channelId={textChatChannelId}
                            closeThread={closeThread}
                            channelName={channelName}
                            threadTextInfo = {threadTextInfo}
                        ></Thread>
                    </div>}
                </div>
            </div>
        </div>
    );
}

export default MainPage;
