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

    const basicThreadUrl = `/spaces/${spaceId}/channels/${channelId}/texts/${threadTextInfo.textId}/threads`;

    useEffect(() => {
        // 스레드가 변경될 때마다 소켓을 끊어준다.
        if (websocketRef.current !== null) {
            websocketRef.current.close();
        }
        websocketRef.current = null;
        const getThreads = async () => {
            const response = await authenticationConnect('get', basicThreadUrl);
            if (response.data === "") {
                setTextInputMessage('메시지를 입력하면 대화가 시작돼요!');
                return;
            }
    
            threadIdRef.current = response.data.id;
            const thread = await authenticationConnect('get', basicThreadUrl + `/${threadIdRef.current}`);
            setMessages(thread.data);
            setTextInputMessage(`${threadTextInfo.text}에 메시지 보내기`);
            startThreadSession();
        }
        setMessages([]);
        setTextInputMessage('메시지를 입력하면 대화가 시작돼요!');
        getThreads();

        return () => {
            if (websocketRef.current !== null) {
                websocketRef.current.close();
            }
        }
    },[threadTextInfo]);
    
    const startThread = async () =>  {
        // 스레드 시작을 위해서 스레드를 생성한다.
        console.log("스레드 시작");
        try {
            const response = await authenticationConnect('post', basicThreadUrl);
            threadIdRef.current = response.data.id;
        } catch (e) {
            console.error(e);
        }
    }

    const startThreadSession = () => {
        // 웹소켓 세션을 시작하는데...... 흠... 뭘하지?
        // 일단 url 만들고./.
        const threadId = threadIdRef.current;

        const host = process.env.REACT_APP_SERVER;
        const url = `ws://${host}/threads?spaceId=${spaceId}&channelId=${channelId}&threadId=${threadId}&token=${token}`;
        const socket = new WebSocketApi(url, {
            handleSocketOpen: threadSocketOpen,
            handleSocketMessage: threadSocketOnMessage,
            handleSocketClose: threadSocketOnClose,
            handleSocketError: threadSocketOnError
        });

        // 각 스레드에 대한 세션? 이라고 할 수 있겠지?

        websocketRef.current = socket.socket;
    }

    const threadSocketOpen = event => {
        console.log("스레드 소켓 연결완료");
    }

    const threadSocketOnMessage = event => {
        const data = JSON.parse(event.data);
        console.log(data);
        setMessages(prevMessages => [...prevMessages, data]);
    }

    const threadSocketOnClose = () => {
        console.log("스레드 소켓 연결 끊김");
        websocketRef.current = null;
    }

    const threadSocketOnError = (error) => {
        console.log("스레드 소켓 에러로 인해 연결 끊김", error);
        websocketRef.current = null;
    }

    const handleKeyPress = event => {
        if (event.key === 'Enter') {
            // 스레드 생성
            const content = textInputRef.current.value;
            textInputRef.current.value = '';
            if (websocketRef.current == null) {
                console.log('스레드 세션을 시작합니다.');
                startThread();
                startThreadSession();
                return;
            }

            // 스레드 메시지 전송
            const message = {
                content: content
            }

            websocketRef.current.send(JSON.stringify(message));
        }
    }

    return (
        <>
        <div className="thread-top">
        {/* 상단에 X 버튼이 있어야 함 */}
        <p># {channelName} > {threadTextInfo.text}</p>
        <div>
            <p className="thread-top-close" onClick={closeThread}>X</p>
        </div>
        </div>
        <hr className="thread-line"></hr>
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
                <input type="text"
                    ref={textInputRef}
                    className="chat-text"
                    placeholder={textInputMessage}
                    // value={inputValue}
                    // onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    // disabled={isChatTextDisabled}
                />
                <button className="send icon cell"></button>
            </div>
            </div>
        </div>
        </>
    );

}

export default Thread;