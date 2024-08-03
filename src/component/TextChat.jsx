import React, { useState, useEffect, useRef } from 'react';

export const EnterTextChannel = ({channelId}) => {
    const token = sessionStorage.getItem("accessToken");
    const [InputChannelId, setInputChannelId] = useState('');
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [webSocket, setWebSocket] = useState(null);
    const ws = useRef(null);

    useEffect(() => {
        if (channelId) {
            // 메시지 리스트 초기화
            if (messages) {
                setMessages([]);
            }
            
            connectWebSocket(channelId);
        }

        return () => {
            if (ws) {
                ws.current.close();
            }
        };
    }, [channelId]);

    const connectWebSocket = (channelId) => {
        if (webSocket !== null) {
            return;
        }

        if (token) {

            const socket = new WebSocket(`ws://localhost:8080/api/text?channel=${channelId}&token=${token}`);

            socket.onopen = () => {
                console.log('WebSocket is connected');

            };

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    setMessages(prevMessages => [...prevMessages, {
                        id: data.id,
                        username: data.username,
                        contents: data.contents,
                        timestamp: formatDate(new Date(data.createdAt)),
                        type: 'json'
                    }]);
                } catch (e) {
                    console.log(new Date());
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

            // setWebSocket(socket);
            ws.current = socket;
        } else {
            console.error('Token is missing');
        }
    }

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    const handleSendMessage = () => {
        if (ws.current && inputValue.trim()) {
            const data = {
                contents: inputValue
            }
            ws.current.send(JSON.stringify(data));
            setInputValue('');
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
        const adjustedHours = hours % 12 || 12; // 0시를 12시로 변환

        return `${year}.${month}.${day}. ${ampm} ${adjustedHours}:${minutes}`;
    }

    return (
        <>
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
                </div>
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
    )
};

export default EnterTextChannel;

