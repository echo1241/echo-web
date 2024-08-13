import React, { useState, useEffect, useRef } from 'react';
import { useAxios } from '../../hook/useAxios';
import './textChat.css';  // CSS 파일 임포트

export const EnterTextChannel = ({ channelId, channelName }) => {
    const token = sessionStorage.getItem("accessToken");
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [webSocket, setWebSocket] = useState(null);
    const [postImg, setPostImg] = useState([]);
    const [previewImgUrl, setPreviewImgUrl] = useState(null);
    const [error, setError] = useState('');
    const [isChatTextDisabled, setIsChatTextDisabled] = useState(false);
    const messagesEndRef = useRef(null);
    const fileRef = useRef(null);
    const ws = useRef(null);

    const { authenticationConnect } = useAxios();

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
    }, [channelId, channelName]);

    const connectWebSocket = (channelId) => {
        if (webSocket !== null) {
            return;
        }

        if (token) {
            const host = process.env.REACT_APP_SERVER;
            const socket = new WebSocket(`ws://${host}/text?channel=${channelId}&token=${token}`);

            socket.onopen = () => {
                // console.log('WebSocket is connected');
            };

            socket.onmessage = (event) => {

                const data = JSON.parse(event.data);

                setMessages(prevMessages => [...prevMessages, {
                    id: data.id,
                    username: data.username,
                    contents: data.contents,
                    timestamp: formatDate(new Date(data.createdAt)),
                    type: data.type
                }]);
            };

            socket.onclose = () => {
                // console.log('WebSocket is disconnected');
            };

            socket.onerror = (error) => {
                // console.log('WebSocket error : ', error);
            };

            // setWebSocket(socket);
            ws.current = socket;
        } else {
            // console.error('Token is missing');
        }
    }

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    const handleSendMessage = async (event) => {
        if (ws.current && inputValue.trim()) {
            const data = {
                contents: inputValue
            }
            ws.current.send(JSON.stringify(data));
            setInputValue('');
        } else if (postImg && inputValue === '') {
            event.preventDefault();

            const formData = new FormData();
            formData.append('file-data', postImg);

            await authenticationConnect('post', `/text/${channelId}/file`, formData);
            setPreviewImgUrl(null);
            setIsChatTextDisabled(false);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            console.log('엔터 눌림')
            handleSendMessage(event);
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

    const handleUploadButton = () => {
        if (!fileRef.current) return;
        fileRef.current.click();
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0];

        if (file) {
            // 확장자 검사
            if (!file.type.startsWith('image/')) {
                setError('사진만 업로드 할 수 있습니다.');
                setPostImg(null);
                setPreviewImgUrl(null);
                return;
            }

            // 파일 크기 검사(20MB)
            if (file.size > 20 * 1024 * 1024) {
                setError("사진 크기는 20MB 이내이어야 합니다.")
                setPostImg(null);
                setPreviewImgUrl(null);
                return;
            }

            // 미리보기 URL 생성
            const fileUrl = URL.createObjectURL(file);
            setPostImg(file);
            setPreviewImgUrl(fileUrl);
            setError('');
            setIsChatTextDisabled(true);
        }
    }

    const handleImgDeleteClick = () => {
        setPreviewImgUrl(null);
        setIsChatTextDisabled(false);
    }

    return (
        <>
            <div id="messages-list">
                {messages.slice().reverse().map((msg) => (
                    <div key={msg.id} className={`message ${msg.type === 'TEXT' ? 'text-message' : 'file-message'}`}>
                        <p>
                            {msg.username}&nbsp;&nbsp;<span className="timestamp">({msg.timestamp})</span>
                        </p>
                        {msg.type === 'TEXT' ? (
                            <p>{msg.contents}</p>
                        ) : (
                            <p>
                                <img src={msg.contents}></img>
                            </p>
                        )}
                        <hr className="message-line" />
                    </div>
                ))}
            </div>

            <div className="msg-wrap">
                {error && (
                    <div className="upload-error">
                        <p style={{ color: 'red' }}>{error}</p>
                    </div>
                )}
                {previewImgUrl && (
                    <div className="preview-img">
                        <img src={previewImgUrl} alt="Priview" />
                        <button className="img-delete-button" onClick={handleImgDeleteClick} />
                        <hr className="msg-wrap-line" />
                    </div>
                )}
                <div className="send-chat">
                    <div className="plus icon cell" onClick={handleUploadButton}>
                        <input className='image-upload' type="file" accept="image/*" onChange={handleFileChange} ref={fileRef} />
                    </div>
                    <input type="text"
                        className="chat-text"
                        placeholder={`${channelName} 에 메시지 보내기`}
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyPress}
                        disabled={isChatTextDisabled}
                    />
                    <button className="send icon cell" onClick={handleSendMessage}></button>
                </div>
            </div>
        </>
    )
};

export default EnterTextChannel;

