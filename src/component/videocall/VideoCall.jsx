import React, { useState, useRef, useEffect } from 'react';
import { WebSocketApi } from '../../api/websocket';
import './VideoCall.css';

export const VideoCall = ({ channelId, user, onError }) => {
  const socket = useRef(null);
  const sessionId = useRef(null);
  const localStream = useRef(null);
  const screenStream = useRef(null);
  const peerConnections = useRef({});
  const processedStreams = useRef(new Set());
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [sharingScreen, setSharingScreen] = useState(false);
  const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
  const localVideoRef = useRef();
  const videoContainerRef = useRef();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (socket.current) {
        socket.current.send(JSON.stringify({ leave: sessionId.current }));
        socket.current.close();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    if (channelId) {
      startCall();
    }

    return () => {
      if (socket.current) {
        endCall();
        socket.current.send(JSON.stringify({ leave: sessionId }));
        socket.current.close();
      }
    };
  }, [channelId]);

  const endCall = () => {
    Object.values(peerConnections.current).forEach(pc => pc.close());
    peerConnections.current = {};

    if (videoContainerRef.current) {
      const remoteVideos = videoContainerRef.current.querySelectorAll('.video-wrapper');
      remoteVideos.forEach(videoWrapper => videoWrapper.remove());

      if (localStream.current) {
        localStream.current.getTracks().forEach(track => track.stop());
      }

      localVideoRef.current.srcObject = null;

      processedStreams.current.clear();
    }
  };

  const startCall = () => {
    if (!channelId) return;

    const host = process.env.REACT_APP_SERVER;
    const url = `ws://${host}/video/${channelId}`;

    const myWebSocket = new WebSocketApi(url, {
      handleSocketOpen,
      handleSocketMessage,
      handleSocketClose,
      handleSocketError
    });

    socket.current = myWebSocket.socket;
  };

  const handleSocketOpen = () => {
    console.log("WebSocket 연결");
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        console.log("LocalStream 설정");
        localStream.current = stream;
        localVideoRef.current.srcObject = stream;
        console.log(localStream.current);
        socket.current.send(JSON.stringify({ join: sessionId.current, remoteNickname: user.nickname }));
      })
      .catch(error => console.error("Media Device 연결 오류: ", error));
  };

  const handleSocketMessage = (event) => {
    const message = JSON.parse(event.data);
    console.log(message);
    if (message.sessionId) {
      sessionId.current = message.sessionId;
      document.getElementById('localLabel').innerText = `${user.nickname}`;
    } else if (message.join) {
      handleJoin(message.join, message.remoteNickname);
    } else if (message.offer) {
      handleOffer(message.offer, message.from, message.to, message.fromNickname);
    } else if (message.answer) {
      handleAnswer(message.answer, message.from, message.to);
    } else if (message.iceCandidate) {
      handleNewICECandidate(message.iceCandidate, message.from, message.to);
    } else if (message.leave) {
      handleLeave(message.leave);
    } else if (message.msg) {
      handleMemberLimit(message.msg);
    }
  };

  const handleSocketClose = () => {
    console.log("WebSocket 연결 끊김");
  };

  const handleMemberLimit = (message) => {
    setError(message);
    endCall();
    if (socket.current) {
      socket.current.close();
    }
    onError(message); // 부모 컴포넌트에 에러를 전달
  };

  const handleSocketError = (error) => {
    console.error("WebSocket 오류: ", error);
    alert(error); // 에러 메시지를 알림으로 표시
    setError(''); // 에러 메시지 초기화
  };

  const handleMuteClick = () => {
    if (localStream.current) {
      localStream.current.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
      setMuted(prevMuted => !prevMuted);
    }
  };

  const handleCameraClick = () => {
    if (localStream.current) {
      localStream.current.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
      setCameraOff(prevCameraOff => !prevCameraOff);
    }
  };

  const handleScreenShareClick = async () => {
    if (sharingScreen) {
      // 이미 화면 공유 중이라면 공유를 중지하고 기존 비디오 트랙을 복원합니다.
      screenStream.current.getTracks().forEach(track => track.stop());

      // 원래 비디오 스트림을 가져옵니다.
      const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStream.current = userMediaStream;

      // PeerConnection에서 화면 공유 트랙을 원래의 비디오 트랙으로 대체합니다.
      const videoTrack = userMediaStream.getVideoTracks()[0];
      Object.values(peerConnections.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });

      localVideoRef.current.srcObject = userMediaStream;
      setSharingScreen(false);
    } else {
      try {
        // 화면 공유를 시작합니다.
        const displayMediaStream = await navigator.mediaDevices.getDisplayMedia({ video: { displaySurface: 'window' }, audio: true });

        // 기존 비디오 트랙을 화면 공유 트랙으로 대체합니다.
        const videoTrack = displayMediaStream.getVideoTracks()[0];
        Object.values(peerConnections.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        });

        screenStream.current = displayMediaStream;
        localVideoRef.current.srcObject = displayMediaStream;
        setSharingScreen(true);
      } catch (error) {
        console.error("화면 공유 오류: ", error);
        alert("화면 공유를 시작할 수 없습니다.");
      }
    }
  };


  const makePeerConnection = (id, nickname) => {
    console.log("PeerConnection 생성. from:", id);
    const peerConnection = new RTCPeerConnection(configuration);

    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        console.log("ICE 후보 정보 전송");
        socket.current.send(JSON.stringify({ iceCandidate: event.candidate, from: sessionId.current, to: id }));
      }
    };

    peerConnection.ontrack = event => {
      console.log("ontrack 발생");

      if (processedStreams.current.has(event.streams[0].id)) return;
      processedStreams.current.add(event.streams[0].id);

      const remoteVideoWrapper = document.createElement('div');
      remoteVideoWrapper.className = 'video-wrapper';
      const remoteVideo = document.createElement('video');
      remoteVideo.id = `remoteVideo_${id}`;
      remoteVideo.autoplay = true;
      remoteVideoWrapper.append(remoteVideo);
      const label = document.createElement('label');
      label.innerText = `${nickname}`;
      remoteVideoWrapper.append(label);
      const volumeControl = document.createElement('input');
      volumeControl.type = 'range';
      volumeControl.className = 'volume-control';
      volumeControl.min = '0';
      volumeControl.max = '1';
      volumeControl.step = '0.01';
      volumeControl.value = '1';
      volumeControl.onchange = () => setVolume(volumeControl, remoteVideo.id);
      remoteVideoWrapper.append(volumeControl);

      videoContainerRef.current.append(remoteVideoWrapper);
      remoteVideo.srcObject = event.streams[0];
    };

    peerConnection.onconnectionstatechange = () => {
      if (peerConnection.connectionState === 'connected') {
        console.log(`PeerConnection ${id} 연결`);
      }
    };

    if (localStream.current) {
      localStream.current.getTracks().forEach(track => peerConnection.addTrack(track, localStream.current));
    }

    peerConnections.current[id] = peerConnection;
    return peerConnection;
  };

  const handleJoin = (id, nickname) => {
    console.log("Offer 생성 및 LocalDescription 설정:", id);
    const peerConnection = makePeerConnection(id, nickname);
    peerConnection.createOffer()
      .then(offer => peerConnection.setLocalDescription(offer))
      .then(() => socket.current.send(JSON.stringify({ offer: peerConnection.localDescription, from: sessionId.current, to: id, fromNickname: user.nickname })))
      .catch(error => console.error("Offer 생성 오류: ", error));
  };

  const handleOffer = (offer, from, to, fromNickname) => {
    if (to !== sessionId.current) return;
    console.log("Offer 수신. from :", from, " to:", to);
    const peerConnection = makePeerConnection(from, fromNickname);
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
      .then(() => peerConnection.createAnswer())
      .then(answer => peerConnection.setLocalDescription(answer))
      .then(() => socket.current.send(JSON.stringify({ answer: peerConnection.localDescription, from: sessionId.current, to: from })))
      .catch(error => console.error("Offer 핸들링 오류: ", error));
  };

  const handleAnswer = (answer, from, to) => {
    if (to !== sessionId.current) return;
    console.log("Answer 수신. from :", from, " to:", to);
    const peerConnection = peerConnections.current[from];
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
      .catch(error => console.error("RemoteDescription 오류: ", error));
  };

  const handleNewICECandidate = (candidate, from, to) => {
    if (to !== sessionId.current) return;
    console.log("IceCandidate 수신. from :", from, " to:", to);
    const peerConnection = peerConnections.current[from];
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
      .catch(error => console.error("ICE 후보 추가 오류: ", error));
  };

  const handleLeave = (id) => {
    const peerConnection = peerConnections.current[id.current];
    if (peerConnection) {
      console.log("RemoteVideo 종료: ", id.current);
      peerConnection.close();
      delete peerConnections.current[id.current];

      const remoteVideoWrapper = document.querySelector(`.video-wrapper #remoteVideo_${id.current}`).parentNode;
      if (remoteVideoWrapper) {
        remoteVideoWrapper.remove();
      }

      processedStreams.current.delete(id.current);
    }
  };

  const setVolume = (control, videoId) => {
    const video = document.getElementById(videoId);
    video.volume = control.value;
  };

  return (
    <div className="video-call-container">
      <h1 className="mb-4">Echo Video Call</h1>
      <div className="button-container mb-4">
        <button
          className={`btn btn-secondary ${sharingScreen ? "monitorRed" : "monitorBlack"}`}
          onClick={handleScreenShareClick}>
        </button>
      </div>
      <div id="localContainer" className="video-wrapper">
        <video ref={localVideoRef} id="localVideo" autoPlay muted></video>
        <label id="localLabel">Local</label>
        <div className="control-buttons">
          <button
            className={`btn btn-secondary ${muted ? "muteBtn" : "unmuteBtn"}`}
            onClick={handleMuteClick}
          >
          </button>
          <button
            className={`btn btn-secondary ${cameraOff ? "cameraOff" : "cameraOn"}`}
            onClick={handleCameraClick}>
          </button>
        </div>
      </div>
      <div id="videoContainer" className="video-container" ref={videoContainerRef}></div>
    </div>
  );
};

export default VideoCall;
