import { useEffect, useRef, useState } from "react";
import { WebSocketApi } from "../../api/websocket";
import { useAxios } from "../../hook/useAxios";
import "./thread.css";

function Thread({threadTextInfo, spaceId, channelId, channelName, closeThread}) {

    const [messages, setMessages] = useState([]);
    const [textInputMessage, setTextInputMessage] = useState('');
    const token = sessionStorage.getItem("accessToken");
    const websocketRef = useRef(null);
    const threadIdRef = useRef(null);
    const textInputRef = useRef(null);
    const { authenticationConnect } = useAxios();

    const firstTextRef = useRef(null);

    const defaultPlaceHoderText = "메시지를 입력하면 대화가 시작돼요!";

    const basicThreadUrl = `/spaces/${spaceId}/channels/${channelId}/texts/${threadTextInfo.textId}/threads`;

    useEffect(() => {
        threadTextInfo.text = threadTextInfo.type == 'TEXT'? threadTextInfo.text : '사진';
        // 스레드가 변경될 때마다 소켓을 끊어준다.
        if (websocketRef.current !== null) {
            websocketRef.current.close();
        }
        websocketRef.current = null;
        threadIdRef.current = null;
        firstTextRef.current = null;
        const getThreads = async () => {
            const response = await authenticationConnect('get', basicThreadUrl);
            if (response.data === "") {
                setTextInputMessage(defaultPlaceHoderText);
                return;
            }
    
            threadIdRef.current = response.data.id;
            const thread = await authenticationConnect('get', basicThreadUrl + `/${threadIdRef.current}`);
            setMessages(thread.data);
            setTextInputMessage(`${threadTextInfo.text}에 메시지 보내기`);
            startThreadSession();
        }
        setMessages([]);
        setTextInputMessage(defaultPlaceHoderText);
        getThreads();

        return () => {
            if (websocketRef.current !== null) {
                websocketRef.current.close();
            }
        }
    },[threadTextInfo]);
    
    const startThread = async () =>  {
        // 스레드 시작을 위해서 스레드를 생성한다.

        const content = textInputRef.current.value;
        try {
            const response = await authenticationConnect('post', basicThreadUrl);
            threadIdRef.current = response.data.id;
            
            console.log(threadIdRef.current);
            startThreadSession();

            // 스레드 메시지 전송
            const message = {
                content: content
            }

            firstTextRef.current = message;
        } catch (e) {
            console.error(e);
        }
    }

    const startThreadSession = () => {
        const threadId = threadIdRef.current;

        const host = process.env.REACT_APP_SERVER;
        const url = `ws://${host}/threads?spaceId=${spaceId}&channelId=${channelId}&threadId=${threadId}&token=${token}`;
        const socket = new WebSocketApi(url, {
            handleSocketOpen: threadSocketOpen,
            handleSocketMessage: threadSocketOnMessage,
            handleSocketClose: threadSocketOnClose,
            handleSocketError: threadSocketOnError
        });

        websocketRef.current = socket.socket;
    }

    const threadSocketOpen = event => {
        if (firstTextRef.current){
            websocketRef.current.send(JSON.stringify(firstTextRef.current));
            firstTextRef.current = null;
        }
    }

    const threadSocketOnMessage = event => {
        const data = JSON.parse(event.data);
        setMessages(prevMessages => [...prevMessages, data]);
    }

    const threadSocketOnClose = () => {
        websocketRef.current = null;
    }

    const threadSocketOnError = (error) => {
        websocketRef.current = null;
    }

    const handleKeyPress = event => {
        if (event.isComposing || event.keyCode === 229) {
            return;
        }

        if (event.key === 'Enter') {
            // 스레드 생성
            const content = textInputRef.current.value;
            if (threadIdRef.current == null) {
                startThread();
                textInputRef.current.value = '';
                setTextInputMessage(`${threadTextInfo.text}에 메시지 보내기`);
                return;
            }
            textInputRef.current.value = '';

            // 스레드 메시지 전송
            const message = {
                content: content
            }

            websocketRef.current.send(JSON.stringify(message));
        }
    }

    return (
        <>
        {/* top */}
        <div className="thread-top">
            <p># {channelName} > {threadTextInfo.text}</p>
            <div>
                <p className="thread-top-close" onClick={closeThread}>X</p>
            </div>
        </div>
        <hr className="thread-line"></hr>
        {/* 채팅 내용 */}
        <div className="chat-box cell thread-cell">
            <div id="messages-list">
                    {messages.slice().reverse().map((msg) => (
                        <div key={msg.id} className='message text-message'>
                            <div className='message-info'>
                            <p>
                                {msg.nickname}&nbsp;&nbsp;<span className="timestamp">({msg.createdAt})</span>
                            </p>
                            </div>
                            <p>{msg.content}</p>
                            <hr className="message-line" />
                        </div>
                    ))}
            </div>
            
            <div className="msg-wrap">
                <div className="send-chat">
                    <div className="send-chat-bar">
                        <input type="text"
                            ref={textInputRef}
                            className="chat-text"
                            placeholder={textInputMessage}
                            onKeyDown={handleKeyPress}
                        />
                        <button className="send icon cell"></button>
                    </div>
                </div>
            </div>
        </div>
        </>
    );

}

export default Thread;