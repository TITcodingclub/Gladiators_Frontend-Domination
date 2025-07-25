import React, { useState, useRef } from 'react';
import SimplePeer from 'simple-peer/simplepeer.min.js';
import { FiMic, FiMicOff, FiVideo, FiPhoneOff } from 'react-icons/fi';

export default function VideoCallMock() {
  const [stream, setStream] = useState(null);
  const [peer, setPeer] = useState(null);
  const [mySignal, setMySignal] = useState('');
  const [otherSignal, setOtherSignal] = useState('');
  const [connected, setConnected] = useState(false);
  const [initiator, setInitiator] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [remoteVideoOn, setRemoteVideoOn] = useState(true);

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  const base64Encode = obj => btoa(JSON.stringify(obj));
  const base64Decode = str => JSON.parse(atob(str));

  const requestPermissions = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(mediaStream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Media error:', err);
      alert('Camera and microphone access are required.');
    }
  };

  const createPeer = (isInitiator, remoteSignal = null) => {
    const p = new SimplePeer({
      initiator: isInitiator,
      trickle: false,
      stream,
    });

    p.on('signal', data => {
      setMySignal(base64Encode(data));
    });

    p.on('stream', remoteStream => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;

        const videoTrack = remoteStream.getVideoTracks()[0];
        if (videoTrack) {
          setRemoteVideoOn(videoTrack.enabled);

          videoTrack.onmute = () => setRemoteVideoOn(false);
          videoTrack.onunmute = () => setRemoteVideoOn(true);
        }
      }
      setConnected(true);
    });

    p.on('close', endCall);
    p.on('error', err => console.error('Peer error:', err));

    if (remoteSignal) {
      try {
        p.signal(base64Decode(remoteSignal));
      } catch (err) {
        alert('Invalid signal');
        console.error(err);
      }
    }

    setPeer(p);
  };

  const createOffer = () => {
    if (!stream) return alert('Please allow camera/mic first');
    createPeer(true);
    setInitiator(true);
  };

  const acceptOffer = () => {
    if (!stream) return alert('Please allow camera/mic first');
    if (!otherSignal.trim()) return alert('Paste offer signal first');
    createPeer(false, otherSignal);
    setInitiator(false);
  };

  const finalizeConnection = () => {
    if (!peer) return alert('No peer connection to finalize.');
    if (!otherSignal.trim()) return alert('Paste answer signal first.');
    try {
      peer.signal(base64Decode(otherSignal));
    } catch (err) {
      alert('Invalid signal');
      console.error(err);
    }
  };

  const endCall = () => {
    peer?.destroy();
    stream?.getTracks().forEach(track => track.stop());
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    setStream(null);
    setPeer(null);
    setConnected(false);
    setMySignal('');
    setOtherSignal('');
    setInitiator(false);
    setMicOn(true);
    setVideoOn(true);
    setRemoteVideoOn(true);
  };

  const toggleAudio = () => {
    const audioTracks = stream?.getAudioTracks();
    if (audioTracks?.length > 0) {
      const enabled = !audioTracks[0].enabled;
      audioTracks.forEach(track => (track.enabled = enabled));
      setMicOn(enabled);
    }
  };

  const toggleVideo = () => {
    const videoTracks = stream?.getVideoTracks();
    if (videoTracks?.length > 0) {
      const enabled = !videoTracks[0].enabled;
      videoTracks.forEach(track => (track.enabled = enabled));
      setVideoOn(enabled);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-center text-white p-5">
        🍳 Two Kitchens, One Recipe — Let’s Cook!
      </h1>
      <div className="p-6 max-w-4xl mx-auto bg-gradient-to-br from-[#161825] via-[#1d1f31] to-[#161825] text-white rounded-lg shadow-2xl space-y-4">
        <h2 className="text-xl font-bold text-center">🎥 Live Kitchen Video Call</h2>

        <div className="grid grid-cols-2 gap-4 relative">
          {/* Local Video */}
          <div className="relative">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full bg-black rounded m-2"
            />
            {!videoOn && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                <span className="text-white font-semibold">📷 Turn On Camera</span>
              </div>
            )}
          </div>

          {/* Remote Video */}
          <div className="relative">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full bg-black rounded m-2"
            />
            {!remoteVideoOn && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                <span className="text-white font-semibold">🎞 Video Paused</span>
              </div>
            )}
          </div>
        </div>

        {!stream && (
          <button onClick={requestPermissions} className="bg-blue-600 px-4 py-2 rounded w-full">
            🎤 Allow Camera & Mic
          </button>
        )}

        {stream && !peer && (
          <div className="flex gap-4 justify-center">
            <button onClick={createOffer} className="bg-blue-600 px-4 py-2 rounded">
              📤 Create Offer
            </button>
            <button onClick={acceptOffer} className="bg-green-600 px-4 py-2 rounded">
              📥 Accept Offer
            </button>
          </div>
        )}

        {/* Connection Signal Strings — Always Visible */}
        <div className="space-y-2">
          <textarea
            value={mySignal}
            readOnly
            placeholder="Your signal (copy & share)"
            className="w-full bg-gray-800 p-2 rounded h-24 text-xs"
          />
          <textarea
            value={otherSignal}
            onChange={e => setOtherSignal(e.target.value)}
            placeholder="Paste their signal"
            className="w-full bg-gray-800 p-2 rounded h-24 text-xs"
          />
        </div>

        {peer && initiator && !connected && (
          <button onClick={finalizeConnection} className="bg-yellow-600 px-4 py-2 rounded w-full">
            🔁 Finalize Connection
          </button>
        )}

        {connected && (
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={toggleAudio}
              className={`p-3 rounded-full transition-all duration-300 ${
                micOn ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }`}
              title={micOn ? 'Mute Mic' : 'Unmute Mic'}
            >
              {micOn ? <FiMic size={20} /> : <FiMicOff size={20} />}
            </button>

            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full transition-all duration-300 ${
                videoOn ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }`}
              title={videoOn ? 'Turn Off Video' : 'Turn On Video'}
            >
              <FiVideo size={20} />
            </button>

            <button
              onClick={endCall}
              className="bg-red-700 hover:bg-red-800 p-3 rounded-full"
              title="End Call"
            >
              <FiPhoneOff size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
