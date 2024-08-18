import React, { useState, useEffect, useRef } from 'react';
import { WebSocketApi } from '../../api/websocket';
import { useAxios } from '../../hook/useAxios';
import './textChat.css';  // CSS 파일 임포트

export const TextChat = ({ spaceId, user, channelId, channelName, dmId, handleThread, lastReadMessageId, setLastReadMessageId, onError, messages, setMessages }) => {
    const token = sessionStorage.getItem("accessToken");
    const [editMessage, setEditMessage] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [modifyValue, setModifyValue] = useState('');
    const [postImg, setPostImg] = useState([]);
    const [previewImgUrl, setPreviewImgUrl] = useState(null);
    const [error, setError] = useState('');
    const [isChatTextDisabled, setIsChatTextDisabled] = useState(false);
    const [typingUsers, setTypingUsers] = useState(new Set()); // 여러 사용자의 타이핑 상태를 관리
    const [chatTextPlaceHolder, setChatTextPlaceHolder] = useState(null);
    const fileRef = useRef(null);
    const ws = useRef(null);

    const { authenticationConnect } = useAxios();

    useEffect(() => {
        if (lastReadMessageId) {
            console.log(lastReadMessageId);
            const element = document.getElementById(lastReadMessageId);
            if (element) {
                console.log("스크롤 이동?");
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
        // 새로운 메시지 정보는 2초 후에 삭제하도록 함
        setTimeout(() => {
            setLastReadMessageId(null);
        }, 3000);
    }, [lastReadMessageId]);

    useEffect(() => {
        if (channelId || dmId) {
            setMessages([]);
            setTypingUsers(new Set());
            setInputValue('');
            connectWebSocket(channelId, dmId);
            setChatTextPlaceHolder(`${channelName}에 메시지 보내기`);
        }

        return () => {
            authenticationConnect('delete', `/notice/${channelId}`);

            if (ws) {
                ws.current.close();
            }
        };
    }, [user, channelId, channelName, dmId]);

    const connectWebSocket = (channelId, dmId) => {
        if (token) {
            const host = process.env.REACT_APP_SERVER;
            let url;

            if (channelId) {
                // 채널용 WebSocket URL
                url = `ws://${host}/text?channel=${channelId}&token=${token}`;
            } else if (dmId) {
                // DM용 WebSocket URL
                url = `ws://${host}/text?dmId=${dmId}&token=${token}`;
                console.log("connection url : " + url);
            }

            const socket = new WebSocketApi(url, {
                handleSocketOpen,
                handleSocketMessage,
                handleSocketClose,
                handleSocketError
            });
            console.log("socket : " + socket);
            ws.current = socket.socket;
        } else {
            // console.error('Token is missing');
        }
    }

    const handleSocketOpen = () => {
        console.log('WebSocket is connected');
    };

    const handleSocketMessage = (event) => {

        const data = JSON.parse(event.data);
        console.log(data)

        if (data.handleType === "CREATED" || data.handleType === null) {
            if (data.typing && data.username !== user.nickname) {
                setTypingUsers(prev => {
                    const updated = new Set(prev);
                    updated.add(data.username)  // 타이핑 중인 사용자 추가
                    return updated;
                });
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
                    createdAt: formatDate(data.createdAt),
                    modifiedAt: formatDate(data.modifiedAt),
                    modifiedStatus: data.createdAt === data.modifiedAt,
                    type: data.textType
                }]);
            }
        } else if (data.handleType === "UPDATED") {
            setMessages(prevMessages => prevMessages.map(message => message.id === data.id
                ? { ...message, contents: data.contents, modifiedStatus: data.createdAt === data.modifiedAt, modifiedAt: formatDate(data.modifiedAt) }
                : message));
            console.log(messages);
        } else if (data.handleType === "DELETED") {
            setMessages(prevMessages => prevMessages.filter(message => message.id !== data.id));
        } else if (data.msg) {
            setError(data.msg);
            ws.current.close();
            onError(data.msg); // 부모 컴포넌트에 에러를 전달
        }
    };

    const handleSocketClose = () => {
        // console.log('WebSocket is disconnected');
    };

    const handleSocketError = (error) => {
        // console.log('WebSocket error : ', error);
        alert(error); // 에러 메시지를 알림으로 표시
        setError(''); // 에러 메시지 초기화
    };

    const handleInputChange = (event) => {
        setInputValue(event.target.value);

        if (event.target.value.trim() === '') {
            sendTypingStatus(false); // 입력이 비어있다면 타이핑 중지 메시지 전송
        } else if (!typingUsers.has(token)) {
            sendTypingStatus(true); // 입력이 시작되면 타이핑 중 메시지 전송
        }
    };

    const handleModifyChange = (event) => {
        setModifyValue(event.target.value);
    };

    const sendTypingStatus = (isTyping) => {
        if (ws.current) {
            const data = {
                typing: isTyping,
            };
            ws.current.send(JSON.stringify(data));
        }
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
            setPostImg(null);
            setPreviewImgUrl(null);
            setIsChatTextDisabled(false);
            setChatTextPlaceHolder(`${channelName}에 메시지 보내기`);
        }
    }

    const handleModifyMessage = async (event) => {

        if (modifyValue.trim()) {
            const data = {
                contents: modifyValue
            }
            await authenticationConnect('put', `/text/${editMessage}`, modifyValue);
            setEditMessage(null)
        }
    }


    const handleSendKeyPress = (event) => {
        if (event.isComposing || event.keyCode === 229) {
            return;
        }

        if (event.key === 'Enter') {
            handleSendMessage(event);
            sendTypingStatus(false);
        }
    }

    const handleModifyKeyPress = (event) => {
        if (event.isComposing || event.keyCode === 229) {
            return;
        }

        if (event.key === 'Enter') {
            handleModifyMessage(event);
        } else if (event.key === 'Escape') {
            setEditMessage(null);
        }
    }

    function formatDate(date) {
        const dbDate = new Date(date);
        const localTime = new Date(dbDate.getTime() - dbDate.getTimezoneOffset() * 60000);

        const year = localTime.getFullYear();
        const month = String(localTime.getMonth() + 1).padStart(2, '0');
        const day = String(localTime.getDate()).padStart(2, '0');
        const hours = localTime.getHours();
        const minutes = String(localTime.getMinutes()).padStart(2, '0');
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
            setChatTextPlaceHolder('이미지 전송 후 메시지 전송이 가능합니다');
        }
    }

    const handleImgDeleteClick = () => {
        setPreviewImgUrl(null);
        setIsChatTextDisabled(false);
        setChatTextPlaceHolder(`${channelName}에 메시지 보내기`);
    }

    const handleToggleEdit = (msgId, currentContents) => {
        if (editMessage === msgId) {
            setEditMessage(null);
        } else {
            setEditMessage(msgId);
            setModifyValue(currentContents);
            console.log(msgId);
        }
    };

    const handleDeleteText = async (msgId) => {
        const confirmDeleteText = window.confirm("정말 이 메시지를 삭제할까요?");
        if (confirmDeleteText) {
            await authenticationConnect('delete', `/text/${channelId}/${msgId}`);
        }
    }

    return (
        <>
            <div id="messages-list">
                {messages.slice().reverse().map((msg) => (
                    <div key={msg.id} id={msg.id} className={`message-channel ${msg.type === 'TEXT' ? 'text-message' : 'file-message'}`}>
                        {
                            lastReadMessageId && lastReadMessageId === msg.id ?
                                <hr className="message-line-push" /> : <></>
                        }
                        <div className='message-info'>
                            <p>
                                {msg.username}&nbsp;&nbsp;<span className="createdAt">({msg.createdAt})</span>
                            </p>
                            <div className='message-option'>
                                <div className='right' onClick={handleThread(msg.id, msg.contents)}>스레드</div>
                                {msg.type === 'TEXT' && (
                                    <div className='right' onClick={() => handleToggleEdit(msg.id, msg.contents)}>수정</div>
                                )}
                                <div className='right' onClick={() => handleDeleteText(msg.id)}>삭제</div>
                            </div>
                        </div>
                        {msg.type === 'TEXT' ? (
                            editMessage === msg.id ? (
                                <div>
                                    <input
                                        type="text"
                                        className="modify-text"
                                        value={modifyValue}
                                        onChange={handleModifyChange}
                                        onKeyDown={handleModifyKeyPress}
                                        autoFocus
                                    />
                                </div>
                            ) : (
                                msg.modifiedStatus ? (
                                    <p>{msg.contents}</p>
                                ) : (
                                    <p>
                                        {msg.contents}
                                        <span className="edited">수정됨
                                            <span className="modifiedAt">{msg.modifiedAt}</span>
                                        </span>

                                    </p>
                                )
                            )
                        ) : (
                            <a href={msg.contents} target="_blank" rel="noopener noreferrer">
                                <img src={msg.contents} alt="chatImage"></img>
                            </a>
                        )}
                        {/* <hr className="message-line"/> */}
                    </div>
                ))}
            </div>

            <div className="msg-wrap">
                <div className="send-chat">
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
                    <div className="send-chat-bar">
                        <div className="plus icon cell" onClick={handleUploadButton}>
                            <input className='image-upload' type="file" accept="image/*" onChange={handleFileChange} ref={fileRef} />
                        </div>
                        <input type="text"
                            className="chat-text"
                            placeholder={chatTextPlaceHolder}
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyDown={handleSendKeyPress}
                            disabled={isChatTextDisabled}
                        />
                        <button className="send icon cell" onClick={handleSendMessage}></button>
                    </div>
                </div>
            </div>
            <div className="typing-container">
                {typingUsers.size > 0 && (
                    <p className="typing-indicator">
                        {typingUsers.size <= 3
                            ? `${[...typingUsers].join(', ')}님이 입력 중입니다...`
                            : "여러 명이 입력 중입니다..."}
                    </p>
                )}
            </div>
        </>
    )
};

export default TextChat;