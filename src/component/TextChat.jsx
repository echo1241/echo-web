import React, { useState, useEffect, useRef } from 'react';

export const EnterTextChannel = ({ channelId, dmId }) => {
    const token = sessionStorage.getItem("accessToken");
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const ws = useRef(null);

    useEffect(() => {
        if (channelId || dmId) {
            // 메시지 리스트 초기화
            setMessages([]);


            // WebSocket 연결 설정
            connectWebSocket(channelId, dmId);
        }

        // 컴포넌트 언마운트 시 WebSocket 연결 종료
        return () => {
            if (ws) {
                ws.current.close();
            }
        };
    }, [channelId, dmId]);

    const connectWebSocket = (channelId, dmId) => {
        if (ws.current) {
            // 이전 WebSocket 연결이 있을 경우 종료
            ws.current.close();
        }

        if (token) {
            const host = process.env.REACT_APP_SERVER;
            let url;

            if (channelId) {
                // 채널용 WebSocket URL
                url = `ws://${host}/text?channel=${channelId}&token=${token}`;
            } else if (dmId) {
                // DM용 WebSocket URL
                url = `ws://${host}/text?dmId=${dmId}&token=${token}`;
            }

            const socket = new WebSocket(url);

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
