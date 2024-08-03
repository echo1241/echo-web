import React, { useState, useRef, useEffect } from 'react';
import './VideoCall.css';

export const VideoCall = ({ channelId, user }) => {
  let socket;
  let sessionId;
  let localStream;
  let peerConnections = {};
  let processedStreams = new Set();
  let muted = false;
  let cameraOff = false;
  const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
  const localVideoRef = useRef();
  const videoContainerRef = useRef();

  let remoteNickname;

  useEffect(() => {
    if (channelId) {
      startCall(); // 채널 ID가 있을 경우 화상 통화를 시작합니다.
    }
    
    return () => {
      if (socket) {
        socket.send(JSON.stringify({ leave: sessionId }));
        socket.close();
      }
    };
  }, [channelId]);

  const startCall = () => {
    if (!channelId) return;

    const newSocket = new WebSocket(`ws://localhost:8080/api/video/${channelId}`);
    newSocket.onopen = handleSocketOpen;
    newSocket.onmessage = handleSocketMessage;
    newSocket.onclose = handleSocketClose;
    newSocket.onerror = handleSocketError;

    socket = newSocket;
  };

  const handleSocketOpen = () => {
    console.log("WebSocket 연결");
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        console.log("LocalStream 설정");
        localStream = stream;
        localVideoRef.current.srcObject = stream;
        socket.send(JSON.stringify({ join: sessionId, remoteNickname: user.nickname }));
      })
      .catch(error => console.error("Media Device 연결 오류: ", error));
  };

  const handleSocketMessage = (event) => {
    const message = JSON.parse(event.data);
    console.log(message)
    if (message.sessionId) {
      sessionId = message.sessionId;
      // document.getElementById('localLabel').innerText = `Local: ${message.sessionId}`;
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
    }
  };

  const handleSocketClose = () => {
    console.log("WebSocket 연결 끊김");
  };

  const handleSocketError = (error) => {
    console.error("WebSocket 오류: ", error);
  };

  const handleMuteClick = () => {
    localStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
    if (!muted) {
      document.getElementById("muteBtn").innerText = "Unmute";
      muted = true;
    } else {
      document.getElementById("muteBtn").innerText = "Mute";
      muted = false;
    }
  };

  const handleCameraClick = () => {
    localStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
    if (cameraOff) {
      document.getElementById("cameraBtn").innerText = "Turn Camera Off";
      cameraOff = false;
    } else {
      document.getElementById("cameraBtn").innerText = "Turn Camera On";
      cameraOff = true;
    }
  };

  const makePeerConnection = (id) => {
    console.log("PeerConnection 생성. from:", id);
    const peerConnection = new RTCPeerConnection(configuration);

    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        console.log("ICE 후보 정보 전송");
        socket.send(JSON.stringify({ iceCandidate: event.candidate, from: sessionId, to: id }));
      }
    };

    peerConnection.ontrack = event => {
      console.log("ontrack 발생");
      console.log(remoteNickname);

      if (processedStreams.has(event.streams[0].id)) return;
      processedStreams.add(event.streams[0].id);

      const remoteVideoWrapper = document.createElement('div');
      remoteVideoWrapper.className = 'video-wrapper';
      const remoteVideo = document.createElement('video');
      remoteVideo.id = `remoteVideo_${id}`;
      remoteVideo.autoplay = true;
      remoteVideoWrapper.append(remoteVideo);
      const label = document.createElement('label');
      label.innerText = `${remoteNickname}`;
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

    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    peerConnections[id] = peerConnection;
    return peerConnection;
  };

  const handleJoin = (id, nickname) => {
    console.log("Offer 생성 및 LocalDescription 설정:", id);
    remoteNickname = nickname;
    const peerConnection = makePeerConnection(id);
    peerConnection.createOffer()
      .then(offer => peerConnection.setLocalDescription(offer))
      .then(() => socket.send(JSON.stringify({ offer: peerConnection.localDescription, from: sessionId, to: id, fromNickname: user.nickname })))
      .catch(error => console.error("Offer 생성 오류: ", error));
  };

  const handleOffer = (offer, from, to, fromNickname) => {
    if (to !== sessionId) return;
    console.log("Offer 수신. from :", from, " to:", to);
    remoteNickname = fromNickname;
    const peerConnection = makePeerConnection(from);
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
      .then(() => peerConnection.createAnswer())
      .then(answer => peerConnection.setLocalDescription(answer))
      .then(() => socket.send(JSON.stringify({ answer: peerConnection.localDescription, from: sessionId, to: from })))
      .catch(error => console.error("Offer 핸들링 오류: ", error));
  };

  const handleAnswer = (answer, from, to) => {
    if (to !== sessionId) return;
    console.log("Answer 수신. from :", from, " to:", to);
    const peerConnection = peerConnections[from];
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
      .catch(error => console.error("RemoteDescription 오류: ", error));
  };

  const handleNewICECandidate = (candidate, from, to) => {
    if (to !== sessionId) return;
    console.log("IceCandidate 수신. from :", from, " to:", to);
    const peerConnection = peerConnections[from];
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
      .catch(error => console.error("ICE 후보 추가 오류: ", error));
  };

  const handleLeave = (id) => {
    const peerConnection = peerConnections[id];
    if (peerConnection) {
      console.log("RemoteVideo 종료: ", id);
      peerConnection.close();
      delete peerConnections[id];

      const remoteVideoWrapper = document.querySelector(`.video-wrapper #remoteVideo_${id}`).parentNode;
      if (remoteVideoWrapper) {
        remoteVideoWrapper.remove();
      }

      processedStreams.delete(id);
    }
  };

  const setVolume = (control, videoId) => {
    const video = document.getElementById(videoId);
    video.volume = control.value;
  };

  return (
    <div className="video-call-container">
      {localStream}
      <h1 className="mb-4">Echo Video Call</h1>
      <div className="button-container mb-4">
      </div>
      <div id="localContainer" className="video-wrapper">
        <video ref={localVideoRef} id="localVideo" autoPlay muted></video>
        <label id="localLabel">Local</label>
        <div className="control-buttons">
          <button id="muteBtn" className="btn btn-secondary" onClick={handleMuteClick}>Mute</button>
          <button id="cameraBtn" className="btn btn-secondary" onClick={handleCameraClick}>Turn Camera Off</button>
        </div>
      </div>
      <div id="videoContainer" className="video-container" ref={videoContainerRef}></div>
    </div>
  );
};

export default VideoCall;
