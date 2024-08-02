export const websocketStart = ({channelId, handleSocketOpen, handleSocketMessage, handleSocketClose, handleSocketError}) => {
    const newSocket = new WebSocket(`ws://localhost:8080/api/video/${channelId}`);
    newSocket.onopen = handleSocketOpen;
    newSocket.onmessage = handleSocketMessage;
    newSocket.onclose = handleSocketClose;
    newSocket.onerror = handleSocketError;
    return newSocket;
}