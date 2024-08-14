import { useRef, useState } from "react";
import { WebSocketApi } from "../../api/websocket";
import { useAxios } from "../../hook/useAxios";
import "./thread.css";

function Thread({text, spaceId, channelId, channelName, closeThread}) {

    const [messages, setMessages] = useState([]);
    const token = sessionStorage.getItem("accessToken");
    const websocketRef = useRef(null);
    const { authenticationConnect } = useAxios();
    
    const handleThread = (textId) => async(e) => {
        // 1. 스레드 시작을 위해서 스레드를 생성한다.
        try {
            const response = await authenticationConnect('post', `/spaces/${spaceId}/channels/${channelId}/texts/${textId}/threads`);
            console.log(response);
            // 2. 만약 스레드가 이미 있다면 해당 스레드에 대한 웹소켓 세션을 시작한다.
            
            // 없다면 생성 후 웹소켓 세션을 시작한다.
            
            // 그렇다면 먼저 스레드가 있는지 없는지부터 확인해야하는거 아닌가?

            // 애초에 text채널에서 데이터 내려줄 때 스레드 확인을 하긴 해야될지도?

            // 아닐지도...?
        } catch (e) {
            // 해당하는 채팅 메시지에 이미 스레드가 존재할 때
            if (e.response.data.code === 8001) {
                // 스레드가 이미 존재하므로, 웹소켓 세션을 시작한다.
            }
        }
    }

    const startThreadSession = () => {
        // 웹소켓 세션을 시작하는데...... 흠... 뭘하지?
        // 일단 url 만들고./.

        const host = process.env.REACT_APP_SERVER;
        const url = `ws://${host}/thread?spaceId=${spaceId}&channel=${channelId}&token=${token}`;
        const socket = new WebSocketApi(url, {
            threadSocketOpen,
            threadSocketOnMessage,
            threadSocketOnClose,
            threadSocketOnError
        });

        // 각 스레드에 대한 세션? 이라고 할 수 있겠지?

        websocketRef.current = socket.socket;
    }

    const threadSocketOpen = event => {
        console.log("스레드 연결완료");
    }

    const threadSocketOnMessage = event => {
        const data = JSON.parse(event.data);
        console.log(data);
    }

    const threadSocketOnClose = () => {
        console.log("스레드 소켓 연결 끊김");
    }

    const threadSocketOnError = (error) => {
        console.log("스레드 소켓 에러로 인해 연결 끊김", error);
    }

    return (
        <>
        <div className="thread-top">
        {/* 상단에 X 버튼이 있어야 함 */}
        <p># {channelName} > {text}</p>
        <div>X</div>
        </div>
        <hr className="thread-line"></hr>
        <div className="chat-box cell">
        <div id="messages-list">
                {messages.slice().reverse().map((msg) => (
                    <div key={msg.id} className={`message ${msg.type === 'TEXT' ? 'text-message' : 'file-message'}`}>
                        <div className='message-info'>
                        <p>
                            {msg.username}&nbsp;&nbsp;<span className="timestamp">({msg.timestamp})</span>
                        </p>
                        </div>
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
            <div className="send-chat">
                <input type="text"
                    className="chat-text"
                    placeholder={`${text} 에 메시지 보내기`}
                    // value={inputValue}
                    // onChange={handleInputChange}
                    // onKeyDown={handleKeyPress}
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