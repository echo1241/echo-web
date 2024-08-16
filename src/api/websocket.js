export class WebSocketApi {
    socket;
    KEEP_ALIVE_TIME = 40000;
    ping;

    constructor(url, { handleSocketOpen, handleSocketMessage, handleSocketClose, handleSocketError }) {
        this.websocketStart({
            url,
            handleSocketOpen,
            handleSocketMessage,
            handleSocketClose,
            handleSocketError
        });
    }

    socketOpen = (handleSocketOpen) => () => {
        console.log('Websocket API: WebSocket is connected');
        if (handleSocketOpen) {
            handleSocketOpen();
        }
        this.startPing();
    }

    socketOnMessage = (handleSocketMessage) => (event) => {
        if (handleSocketMessage) {
            handleSocketMessage(event);
        }
    }

    socketOnClose = (handleSocketClose) => () => {
        console.log('Websocket API: WebSocket is disconnected');
        if (handleSocketClose) {
            handleSocketClose();
        }
        this.stopPing();
    }

    socketOnError = (handleSocketError) => (error) => {
        console.log('Websocket API: WebSocket error:', error);
        if (handleSocketError) {
            handleSocketError(error);
        }
        this.stopPing();
    }

    websocketStart = ({ url, handleSocketOpen, handleSocketMessage, handleSocketClose, handleSocketError }) => {
        console.log('websocket API: url: ', url);
        const newSocket = new WebSocket(url);
        newSocket.onopen = this.socketOpen(handleSocketOpen);
        newSocket.onmessage = this.socketOnMessage(handleSocketMessage);
        newSocket.onclose = this.socketOnClose(handleSocketClose);
        newSocket.onerror = this.socketOnError(handleSocketError);
        this.socket = newSocket;
    }

    startPing = () => {
        this.ping = setInterval(() => {
            console.log("Websocket API: start ping....");
            this.socket.send("$p&ing");
        }, this.KEEP_ALIVE_TIME);
    }

    stopPing = () => {
        clearInterval(this.ping);
    }
}
