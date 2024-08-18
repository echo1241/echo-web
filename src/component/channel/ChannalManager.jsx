import React, { useState, useEffect, useRef } from 'react';
import { EventSourceApi } from '../../api/sse';
import { useAxios } from '../../hook/useAxios';
import Popup from '../modal/Popup';
import './channelManager.css'; // CSS 파일 임포트

const ChannelManager = ({ spaceId, onClose, onClickChannel, setMainPageLastReadMessage, setMessages, setTextChatVisible, setTopChannelName }) => {
    const [channels, setChannels] = useState([]);  // 채널 목록 상태
    const [loading, setLoading] = useState(true);  // 로딩 상태
    const [error, setError] = useState('');  // 오류 상태
    const [popupVisible, setPopupVisible] = useState(false);  // 팝업 가시성 상태
    const [channelName, setChannelName] = useState('');  // 채널 이름 상태
    const [channelType, setChannelType] = useState('text');  // 채널 타입 상태
    const [maxCapacity, setMaxCapacity] = useState(0);  // 채널 최대 인원수 상태
    const [formError, setFormError] = useState(''); // 입력 필드에 대한 오류 상태

    const selectedChannelRef = useRef(null);

    const eventSourceRef = useRef();
    const { authenticationConnect } = useAxios();


    useEffect(() => {
        // eventSoure 초기화
        eventSourceRef.current = EventSourceApi.getInstance();
        eventSourceRef.current.setOnMessage(handleOnMesaage);
        selectedChannelRef.current = null;
    }, []);

    const handleOnMesaage = (event) => {
        if (event.notificationType === "CHANNEL") {
            if (event.eventType === "CREATED") {
                // 이전 데이터 
                setChannels(prevChannels => [...prevChannels, event.data]);
            } else if (event.eventType === "UPDATED") {
                setChannels(prevChannels => prevChannels.map(channel => channel.id === event.data.id ? event.data : channel));
            } else if (event.eventType === "DELETED") {
                setChannels(prevChannels => prevChannels.filter(channel => channel.id !== event.data.id));
                setTextChatVisible(false);
                setTopChannelName('');
                setMessages([]);
            }
        } else if (event.notificationType === "TEXT") {
            if (event.eventType === "CREATED") {
                // 메시지 전송이 일어남
                console.log(selectedChannelRef.current);
                if (selectedChannelRef.current !== event.data.channelId) {
                    setChannels(prevChannels => prevChannels.map(channel => {
                        if (channel.id === event.data.channelId) {
                            return {
                                ...channel,
                                push: true,
                            }
                        }
                        return channel;
                    }))
                }
            }
        }
    }

    useEffect(() => {
        if (spaceId) {
            fetchChannels();
        }
    }, [spaceId]);

    const fetchChannels = async () => {
        try {
            const response = await authenticationConnect(
                'get', `/spaces/${spaceId}/channels`);
            console.log(response.data);
            setChannels(response.data);
        } catch (error) {
            console.error('Error fetching channels:', error);
            setError('Failed to load channels');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateChannel = async (event) => {
        event.preventDefault();
        setFormError('');

        if (maxCapacity <= 0) {
            setFormError('최대 인원수는 1 이상이어야 합니다.');
            return;
        }

        try {
            const payload = {
                channelName,
                channelType,
                maxCapacity
            };

            await authenticationConnect('post', `/spaces/${spaceId}/channels`, payload);
            fetchChannels();
            setPopupVisible(false);
            setChannelName('');
            setChannelType('text');
            setMaxCapacity(0);
        } catch (error) {
            console.error('Error creating channel:', error);
            setError('Failed to create channel');
        }
    };

    const handleDeleteChannel = async (channelId) => {
        try {
            await authenticationConnect('delete', `/spaces/${spaceId}/channels/${channelId}`);
            fetchChannels();
        } catch (error) {
            console.error('Error deleting channel:', error);
            setError('Failed to delete channel');
        }
    };

    const handleChannelClick = (channel) => {
        console.log('Channel ID:', channel.id); // 채널 ID를 콘솔에 출력
        console.log('Channel Name:', channel.channelName); // 채널 ID를 콘솔에 출력

        selectedChannelRef.current = channel.id;
        // 채널 클릭 시, push 삭제
        setChannels(prevChannels => prevChannels.map(prevChannel => {
            if (prevChannel.id === channel.id) {
                return {
                    ...prevChannel,
                    push: false
                }
            }
            return prevChannel;
        }));

        // 해당 채널에서 마지막으로 읽은 메시지 아이디를 세팅해준다.
        // const lastReadMessageId = channels.filter(curChannel => channel.id === curChannel.id)[0].lastReadMessageId;
        // console.log(lastReadMessageId)
        // setMainPageLastReadMessage(lastReadMessageId);

        // 해당 채널 정보를 전달.
        onClickChannel(channel);

        // 채널 클릭했을 때 해당 채널에서 마지막으로 읽은 정보를 가져와야 한다.
        getChannelLastMessageInfo(channel.id);
    };

    const getChannelLastMessageInfo = async (channelId) => {
        // 채널 아이디 및 space 정보
        // /api/spaces/1/channels/1
        const response = await authenticationConnect('get', `/spaces/${spaceId}/channels/${channelId}`);
        if (response?.data?.push) {
            // 여기에서 
            console.log(response?.data?.lastReadMessageId)
            // 근데 이거 늦게 set되는데..... 나중에 null나올거 같은데?;;
            // ㅎㅎ;;;;  ;;;;;;
            setMainPageLastReadMessage(response?.data?.lastReadMessageId);
        }
    }

    const handleChannelText = (e) => {
        e.preventDefault();
        console.log("channel text");
        setChannelType('T');
    }

    const handleChannelVoice = (e) => {
        e.preventDefault();
        setChannelType('V');
    }

    const textChannels = channels.filter(channel => channel.channelType === 'T');
    const videoChannels = channels.filter(channel => channel.channelType === 'V');

    return (
        <div className="channel-manager">
            <div className="channel__plus-container">
                <h2 className="channel__plus-text">Channels</h2>
                <button className="channel__plus-button"
                    onClick={() => setPopupVisible(true)}>+</button>
            </div>

            {/* 채널 목록 */}
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}

            {/* Text 채널 섹션 */}
            <div className="channel-section">
                <h3 className="channel-section-title">Text</h3>
                <div className="channel-list">
                    {textChannels.map(channel => (
                        <div key={channel.id} className="channel-item">
                            <button
                                className={channel?.push ? "channel-button push" : "channel-button"}
                                onClick={() => handleChannelClick(channel)}
                            >
                                {channel.channelName}
                            </button>
                            <span className="channel-capacity">
                                [{channel.currentMemberCount}/{channel.maxCapacity}]
                            </span>
                            <button
                                className="channel-delete-button"
                                onClick={() => handleDeleteChannel(channel.id)}
                            >
                                X
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Video 채널 섹션 */}
            <div className="channel-section">
                <h3 className="channel-section-title">Video</h3>
                <div className="channel-list">
                    {videoChannels.map(channel => (
                        <div key={channel.id} className="channel-item">
                            <button
                                className={channel?.push ? "channel-button push" : "channel-button"}
                                onClick={() => handleChannelClick(channel)}
                            >
                                {channel.channelName}
                            </button>
                            <span className="channel-capacity">
                                [{channel.currentMemberCount}/{channel.maxCapacity}]
                            </span>
                            <button
                                className="channel-delete-button"
                                onClick={() => handleDeleteChannel(channel.id)}
                            >
                                X
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* 팝업창 */}
            {popupVisible && (
                <Popup closePopup={() => {
                    setPopupVisible(false);
                    setFormError('');
                }}>
                    <h2>Add Channel</h2>
                    <form onSubmit={handleCreateChannel}>
                        <div className="form-group">
                            <label htmlFor="channelName">Channel Name:</label>
                            <input
                                type="text"
                                id="channelName"
                                value={channelName}
                                onChange={(e) => setChannelName(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Channel Type:</label>
                            <div>
                                <button
                                    className={channelType === 'T' ? "channel-popup-add-button choice" : "channel-popup-add-button"}
                                    onClick={handleChannelText}>Text</button>
                            </div>
                            <div>
                                <button
                                    className={channelType === 'V' ? "channel-popup-add-button choice" : "channel-popup-add-button"}
                                    onClick={handleChannelVoice}>Video</button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="maxCapacity">Channel Capacity:</label>
                            <input
                                type="number"
                                id="maxCapacity"
                                value={maxCapacity}
                                onChange={(e) => setMaxCapacity(e.target.value)}
                            />
                        </div>
                        {formError && <p className="error">{formError}</p>}
                        <button type="submit">Create Channel</button>
                        {error && <p className="error">{error}</p>}
                    </form>
                </Popup>
            )}
        </div>
    );
};

export default ChannelManager;
