import React, { useState, useEffect } from 'react';
import { authenticationInstance } from './axios';  // axios 인스턴스 임포트
import Popup from '../component/modal/Popup';  // Popup 컴포넌트 임포트
import './channelManager.css'; // CSS 파일 임포트

const ChannelManager = ({ spaceId, onClose }) => {
    const [channels, setChannels] = useState([]);  // 채널 목록 상태
    const [loading, setLoading] = useState(true);  // 로딩 상태
    const [error, setError] = useState('');  // 오류 상태
    const [popupVisible, setPopupVisible] = useState(false);  // 팝업 가시성 상태
    const [channelName, setChannelName] = useState('');  // 채널 이름 상태
    const [channelType, setChannelType] = useState('text');  // 채널 타입 상태

    useEffect(() => {
        if (spaceId) {
            fetchChannels();
        }
    }, [spaceId]);

    const fetchChannels = async () => {
        try {
            const response = await authenticationInstance().get(`/spaces/${spaceId}/channels`);
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

            await authenticationInstance().post(`/spaces/${spaceId}/channels`, payload);
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
            await authenticationInstance().delete(`/spaces/${spaceId}/channels/${channelId}`);
            fetchChannels();
        } catch (error) {
            console.error('Error deleting channel:', error);
            setError('Failed to delete channel');
        }
    };

    const handleChannelClick = (channel) => {
        console.log('Channel ID:', channel.id); // 채널 ID를 콘솔에 출력
        console.log('Channel Name:', channel.channelName); // 채널 ID를 콘솔에 출력

        // 해당 채널명을 부모창에 출력한다.

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
                            {channel.channelName} ({channel.channelType === 'T' ? 'Text' : 'Voice'})
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
                                onClick={handleChannelVoice}>voice</button>
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
