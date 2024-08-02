import React, { useState, useRef, useEffect } from 'react';
import './VideoCall.css';

export const VideoCall = () => {
  let socket;
  let sessionId;
  let localStream;
  let muted = false;
  let cameraOff = false;
  const peerConnections = {};
  const processedStreams = new Set();
  const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
  const localVideoRef = useRef();
  const videoContainerRef = useRef();
  const startCallBtnRef = useRef();
  const endCallBtnRef = useRef();
  const muteBtnRef = useRef();
  const cameraBtnRef = useRef();

  const startCall = () => {
    const channelId = prompt("채널 ID를 입력하세요:", "1");

    if (!channelId) {
      alert("화상 통화를 시작하려면 채널 ID를 입력하세요.");
      return;
    }

    startCallBtnRef.current.disabled = true;
    endCallBtnRef.current.disabled = false;

    const newSocket = new WebSocket(`ws://localhost:8080/api/video/${channelId}`);
    console.log("socket1: ", socket);
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
        muteBtnRef.current.disabled = false;
        cameraBtnRef.current.disabled = false;
        socket.send(JSON.stringify({ join: sessionId }));
      })
      .catch(error => console.error("Media Device 연결 오류: ", error));
  };

  const handleSocketMessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.sessionId) {
      sessionId = message.sessionId;
      document.getElementById('localLabel').innerText = `Local: ${message.sessionId}`;
    } else if (message.join) {
      handleJoin(message.join);
    } else if (message.offer) {
      handleOffer(message.offer, message.from, message.to);
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

  const endCall = () => {
    startCallBtnRef.current.disabled = false;
    endCallBtnRef.current.disabled = true;
    muteBtnRef.current.disabled = true;
    cameraBtnRef.current.disabled = true;

    Object.values(peerConnections).forEach(pc => pc.close());
    peerConnections = {};

    const remoteVideos = videoContainerRef.current.querySelectorAll('.video-wrapper');
    remoteVideos.forEach(videoWrapper => videoWrapper.remove());

    if (socket) {
      socket.send(JSON.stringify({ leave: sessionId }));
      socket.close();
    }

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      localStream = null;
    }

    localVideoRef.current.srcObject = null;
    sessionId = null;
    processedStreams = new Set();
  };

  const handleMuteClick = () => {
    localStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
    if (!muted) {
      muteBtnRef.innerText = "Unmute";
      muted = true;
    } else {
      muteBtnRef.innerText = "Mute";
      muted = false;
    }
  };

  const handleCameraClick = () => {
    localStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
    if (cameraOff) {
      cameraBtnRef.innerText = "Turn Camera Off";
      cameraOff = false;
    } else {
      cameraBtnRef.innerText = "Turn Camera On";
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
      if (processedStreams.has(event.streams[0].id)) return;
      // setProcessedStreams(prev => new Set(prev).add(event.streams[0].id));
      processedStreams.add(event.streams[0].id);

      const remoteVideoWrapper = document.createElement('div');
      remoteVideoWrapper.className = 'video-wrapper';
      const remoteVideo = document.createElement('video');
      remoteVideo.id = `remoteVideo_${id}`;
      remoteVideo.autoplay = true;
      remoteVideoWrapper.append(remoteVideo);
      const label = document.createElement('label');
      label.innerText = `Remote: ${id}`;
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

  const handleJoin = (id) => {
    console.log("Offer 생성 및 LocalDescription 설정:", id);
    const peerConnection = makePeerConnection(id);
    peerConnection.createOffer()
      .then(offer => peerConnection.setLocalDescription(offer))
      .then(() => socket.send(JSON.stringify({ offer: peerConnection.localDescription, from: sessionId, to: id })))
      .catch(error => console.error("Offer 생성 오류: ", error));
  };

  const handleOffer = (offer, from, to) => {
    if (to !== sessionId) return;
    console.log("Offer 수신. from :", from, " to:", to);
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

  useEffect(() => {
    if (localStream) {
      muteBtnRef.current.innerText = muted ? "Unmute" : "Mute";
      cameraBtnRef.current.innerText = cameraOff ? "Turn Camera On" : "Turn Camera Off";
    }
  }, [muted, cameraOff, localStream]);

  return (
    <div className="video-call-container">
      <h1 className="mb-4">Echo Video Call</h1>
      <div className="button-container mb-4">
        <button ref={startCallBtnRef} className="btn btn-primary" onClick={startCall}>Start Call</button>
        <button ref={endCallBtnRef} className="btn btn-danger" onClick={endCall} disabled>End Call</button>
      </div>
      <div id="localContainer" className="video-wrapper">
        <video ref={localVideoRef} id="localVideo" autoPlay muted></video>
        <label id="localLabel">Local</label>
        <div className="control-buttons">
          <button ref={muteBtnRef} className="btn btn-secondary" onClick={handleMuteClick} disabled>Mute</button>
          <button ref={cameraBtnRef} className="btn btn-secondary" onClick={handleCameraClick} disabled>Turn Camera Off</button>
        </div>
      </div>
      <div id="videoContainer" className="video-container" ref={videoContainerRef}></div>
    </div>
  );
};

export default VideoCall;
