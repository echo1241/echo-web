import { EventSourcePolyfill } from "event-source-polyfill";

/**
 * 사용법
 * // eventSoure 초기화
 * useEffect(() => {
        eventSourceRef.current = EventSourceApi.getInstance();
        eventSourceRef.current.setOnMessage(handleOnMesaage);
    }, []);

    // 콜백함수 지정
    const handleOnMesaage = (data) => {
        console.log(data);
    }
    
    setOnMessage로 sse 데이터를 받을 때의 콜백함수 지정 가능
 */
export class EventSourceApi {
    static instance = null;

    static getInstance() {
        if (!EventSourceApi.instance) {
            console.error("event source before init..");
        }
        return EventSourceApi.instance;
    }

    constructor(url, options) {
        if (EventSourceApi.instance) {
            return EventSourceApi.instance;
        }
        this.source = new EventSourcePolyfill(url, options);
        this.source.onmessage = this.onmessage;

        EventSourceApi.instance = this;
    }

    setOnMessage = handleOnMessage => {
        this.handleOnMessage = handleOnMessage;
    }

    onmessage = (event) => {
        const data = JSON.parse(event.data);
        // ping 메시지 처리
        if (data.eventType === "ping") {
            return;
        }
        console.log(data);
        if (this.handleOnMessage) {
            this.handleOnMessage(data);
        }
    }
} 