import React, { useState, useRef } from 'react';
import SimplePeer from 'simple-peer';
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff } from 'react-icons/fi';

export default function VideoCallMock() {
  const [stream, setStream] = useState(null);
  const [peer, setPeer] = useState(null);
  const [mySignal, setMySignal] = useState('');
  const [otherSignal, setOtherSignal] = useState('');
  const [connected, setConnected] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  const requestPermissions = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      localVideoRef.current.srcObject = mediaStream;
      setPermissionsGranted(true);
    } catch (err) {
      console.error('Media error', err);
      alert('Camera/Mic permission is required to proceed.');
    }
  };

  const createOffer = () => {
    if (!stream) return alert('Camera/mic not ready yet');

    const p = new SimplePeer({ initiator: true, trickle: false, stream });
    setPeer(p);

    p.on('signal', data => setMySignal(JSON.stringify(data)));
    p.on('stream', remoteStream => {
      remoteVideoRef.current.srcObject = remoteStream;
      setConnected(true);
    });
  };

  const acceptOffer = () => {
    if (!stream) return alert('Camera/mic not ready yet');

    const p = new SimplePeer({ initiator: false, trickle: false, stream });
    setPeer(p);

    p.on('signal', data => setMySignal(JSON.stringify(data)));
    p.on('stream', remoteStream => {
      remoteVideoRef.current.srcObject = remoteStream;
      setConnected(true);
    });

    try {
      p.signal(JSON.parse(otherSignal));
    } catch (e) {
      alert('Invalid offer signal');
    }
  };

  const finalizeConnection = () => {
    try {
      peer.signal(JSON.parse(otherSignal));
    } catch (e) {
      alert('Invalid signal');
    }
  };

  const toggleAudio = () => {
    stream?.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
  };

  const toggleVideo = () => {
    stream?.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
  };

  const endCall = () => {
    if (peer) peer.destroy();
    if (stream) stream.getTracks().forEach(track => track.stop());

    setPeer(null);
    setStream(null);
    setConnected(false);
    setMySignal('');
    setOtherSignal('');
    localVideoRef.current.srcObject = null;
    remoteVideoRef.current.srcObject = null;
    setPermissionsGranted(false);
  };

  return (
    <div className="p-4 w-full mx-auto bg-gradient-to-br from-[#161825] via-[#1d1f31] to-[#161825] border border-gray-700 text-white rounded space-y-4">
      <h2 className="text-xl font-semibold">🎥 Secure Video Call</h2>

      <div className="grid grid-cols-2 gap-4">
        <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-48 bg-black rounded" />
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-48 bg-black rounded" />
      </div>

      {!permissionsGranted ? (
        <button onClick={requestPermissions} className="bg-blue-600 px-4 py-2 rounded">Allow Camera & Mic</button>
      ) : (
        <>
          <div className="flex gap-4 mt-4">
            <button onClick={createOffer} className="bg-blue-600 px-4 py-2 rounded">📤 Create Offer</button>
            <button onClick={acceptOffer} className="bg-green-600 px-4 py-2 rounded">📥 Accept Offer</button>
          </div>

          <textarea
            value={mySignal}
            readOnly
            placeholder="Your signal (send this)"
            className="w-full bg-gray-800 p-2 rounded h-24 mt-2"
          />
          <textarea
            value={otherSignal}
            onChange={e => setOtherSignal(e.target.value)}
            placeholder="Paste their signal"
            className="w-full bg-gray-800 p-2 rounded h-24"
          />
          <button onClick={finalizeConnection} className="bg-yellow-600 px-4 py-2 rounded">🔁 Finalize Connection</button>

          {connected && (
            <div className="flex gap-4 justify-center mt-4">
              <button onClick={toggleAudio} className="bg-gray-700 p-3 rounded-full"><FiMic size={20} /></button>
              <button onClick={toggleVideo} className="bg-gray-700 p-3 rounded-full"><FiVideo size={20} /></button>
              <button onClick={endCall} className="bg-red-600 p-3 rounded-full"><FiPhoneOff size={20} /></button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
