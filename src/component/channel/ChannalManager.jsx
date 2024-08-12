import React, { useState, useEffect, useRef } from 'react';
import { EventSourceApi } from '../../api/sse';
import { useAxios } from '../../hook/useAxios';
import Popup from '../modal/Popup';
import './channelManager.css'; // CSS 파일 임포트

const ChannelManager = ({ spaceId, onClose, onClickChannel }) => {
    const [channels, setChannels] = useState([]);  // 채널 목록 상태
    const [loading, setLoading] = useState(true);  // 로딩 상태
    const [error, setError] = useState('');  // 오류 상태
    const [popupVisible, setPopupVisible] = useState(false);  // 팝업 가시성 상태
    const [channelName, setChannelName] = useState('');  // 채널 이름 상태
    const [channelType, setChannelType] = useState('text');  // 채널 타입 상태

    const eventSourceRef = useRef();
    const { authenticationConnect } = useAxios();


    useEffect(() => {
        // eventSoure 초기화
        eventSourceRef.current = EventSourceApi.getInstance();
        eventSourceRef.current.setOnMessage(handleOnMesaage);
    }, []);

    const handleOnMesaage = (event) => {

        if (event.eventType === "CREATED") {
            // 이전 데이터 
            setChannels(prevChannels => [...prevChannels, event.data]);
        } else if (event.eventType === "UPDATED") {
            setChannels(prevChannels => prevChannels.map(channel => channel.id === event.data.id? event.data : channel));
        } else if (event.eventType === "DELETED") {
            setChannels(prevChannels => prevChannels.filter(channel => channel.id !== event.data.id));
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

        try {
            const payload = {
                channelName,
                channelType: channelType
            };

            await authenticationConnect('post', `/spaces/${spaceId}/channels`, payload);
            fetchChannels();
            setPopupVisible(false);
            setChannelName('');
            setChannelType('text');
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

        // 해당 채널 정보를 전달.
        onClickChannel(channel);
    };

    const handleChannelText = (e) => {
        e.preventDefault();
        console.log("channel text");
        setChannelType('T');
    }

    const handleChannelVoice = (e) => {
        e.preventDefault();
        setChannelType('V');    
    }

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
            <div className="channel-list">
                {channels.map(channel => (
                    <div key={channel.id} className="channel-item">
                        <button
                            className="channel-button"
                            onClick={() => handleChannelClick(channel)}
                        >
                            {channel.channelName} ({channel.channelType === 'T' ? 'Text' : 'Video'})
                        </button>
                        <button
                            className="channel-delete-button"
                            onClick={() => handleDeleteChannel(channel.id)}
                        >
                            X
                        </button>
                    </div>
                ))}
            </div>

            {/* 팝업창 */}
            {popupVisible && (
                <Popup closePopup={() => setPopupVisible(false)}>
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
                                className= {channelType === 'T'? "channel-popup-add-button choice" : "channel-popup-add-button"}
                                onClick={handleChannelText}>Text</button>
                            </div>
                            <div>
                                <button 
                                className= {channelType === 'V'? "channel-popup-add-button choice" : "channel-popup-add-button"}
                                onClick={handleChannelVoice}>Video</button>
                            </div>
                        </div>
                        <button type="submit">Create Channel</button>
                        {error && <p className="error">{error}</p>}
                    </form>
                </Popup>
            )}
        </div>
    );
};

export default ChannelManager;
