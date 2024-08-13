import React, { useState, useEffect, useRef } from 'react';

export const EnterTextChannel = ({ channelId }) => {
    const token = sessionStorage.getItem("accessToken");
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [typingUsers, setTypingUsers] = useState(new Set()); // 여러 사용자의 타이핑 상태를 관리
    const ws = useRef(null);

    useEffect(() => {
        if (channelId) {
            setMessages([]);
            connectWebSocket(channelId);
        }

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [channelId]);

    const connectWebSocket = (channelId) => {
        if (ws.current) {
            return;
        }

        if (token) {
            const host = process.env.REACT_APP_SERVER;
            const socket = new WebSocket(`ws://${host}/text?channel=${channelId}&token=${token}`);

            socket.onopen = () => {
                console.log('WebSocket is connected');
            };

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.typing) {
                        setTypingUsers(prev => new Set(prev).add(data.username)); // 타이핑 중인 사용자 추가
                    } else if (data.typing === false) {
                        setTypingUsers(prev => {
                            const updated = new Set(prev);
                            updated.delete(data.username); // 타이핑 중지된 사용자 제거
                            return updated;
                        });
                    }
                    if (data.contents) {
                        setMessages(prevMessages => [...prevMessages, {
                            id: data.id,
                            username: data.username,
                            contents: data.contents,
                            timestamp: formatDate(new Date(data.createdAt)),
                            type: 'json'
                        }]);
                    }
                } catch (e) {
                    setMessages(prevMessages => [...prevMessages, {
                        timestamp: formatDate(new Date()),
                        contents: event.data,
                        type: 'text'
                    }]);
                }
            };

            socket.onclose = () => {
                console.log('WebSocket is disconnected');
            };

            socket.onerror = (error) => {
                console.log('WebSocket error : ', error);
            };

            ws.current = socket;
        } else {
            console.error('Token is missing');
        }
    };

    const handleInputChange = (event) => {
        setInputValue(event.target.value);

        if (event.target.value.trim() === '') {
            sendTypingStatus(false); // 입력이 비어있다면 타이핑 중지 메시지 전송
        } else if (!typingUsers.has(token)) {
            sendTypingStatus(true); // 입력이 시작되면 타이핑 중 메시지 전송
        }
    };

    const sendTypingStatus = (isTyping) => {
        if (ws.current) {
            const data = {
                typing: isTyping,
            };
            ws.current.send(JSON.stringify(data));
        }
    };

    const handleSendMessage = () => {
        if (ws.current && inputValue.trim()) {
            const data = {
                contents: inputValue
            }
            ws.current.send(JSON.stringify(data));
            setInputValue('');
            sendTypingStatus(false);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    };

    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? '오후' : '오전';
        const adjustedHours = hours % 12 || 12;

        return `${year}.${month}.${day}. ${ampm} ${adjustedHours}:${minutes}`;
    }

    return (
        <>
            <div id="messages-list">
                {messages.map((msg) => (
                    <div key={msg.id} className={`message ${msg.type === 'json' ? 'json-message' : 'text-message'}`}>
                        {msg.type === 'json' ? (
                            <>
                                <p>
                                    {msg.username}&nbsp;&nbsp;<span className="timestamp">({msg.timestamp})</span>
                                </p>
                                <p>{msg.contents}</p>
                            </>
                        ) : (
                            <p>{msg.contents}&nbsp;&nbsp;<span className="timestamp">({msg.timestamp})</span>
                            </p>
                        )}
                        <hr className="message-line" />
                    </div>
                ))}
                {typingUsers.size > 0 && (
                    <div className="typing-indicator">
                        <p>{[...typingUsers].join(', ')}님이 입력 중입니다...</p>
                    </div>
                )}
            </div>
            <div className="msg-wrap">
                <div className="send-chat">
                    <div className="plus icon cell"></div>
                    <div className="img icon cell"></div>
                    <input type="text"
                        className="chat-text"
                        placeholder="메시지를 입력하세요..."
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyPress}
                    />
                    <button className="send icon cell" onClick={handleSendMessage}></button>
                </div>
            </div>
        </>
    );
};

export default EnterTextChannel;
