import React, { useState, useRef, useEffect } from "react";
import SimplePeer from "simple-peer";
import io from "socket.io-client";
import { useAuth } from "../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMic, FiMicOff, FiVideo, FiVideoOff, FiRepeat, FiMaximize, FiExternalLink,
  FiPhoneOff, FiUsers, FiCopy, FiRefreshCw, FiWifi, FiWifiOff, FiSettings, FiMessageCircle
} from "react-icons/fi";
import { LucideUser } from "lucide-react";
import styled from "styled-components";

const SOCKET_SERVER = import.meta.env.VITE_SOCKET_SERVER || "http://localhost:5000";
let socket;

// Styled Components
const VideoContainer = styled.div`
  background-color: rgba(0, 0, 0, 0.41);
  border-radius: 1rem;
  padding: 2rem;
  color: white;

  display: flex;
  flex-direction: column;
  justify-content: center; /* Vertically center */
  align-items: center;     /* Horizontally center */
  gap: 2rem;

  /* Scroll if content overflows */
  overflow-y: auto;

  /* Responsive grid for videos */
  .videos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    width: 100%;
    max-width: 1200px;
  }

  /* Buttons container */
  .controls {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
    margin-top: 1rem;
  }

  /* Participants panel */
  .participants-panel {
    background: rgba(0, 0, 0, 0.6);
    padding: 1rem;
    border-radius: 1rem;
    width: 100%;
    max-width: 400px;

    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    .participant {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0.75rem;
      border-radius: 0.75rem;
      background: rgba(255, 255, 255, 0.1);
      font-size: 0.9rem;
      transition: background 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      button {
        padding: 0.25rem 0.5rem;
        border-radius: 0.5rem;
        font-size: 0.8rem;
        cursor: pointer;
        border: none;
        transition: all 0.2s;
      }
    }
  }

  /* Alert styling */
  .alert {
    position: fixed;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.7);
    padding: 0.75rem 1.25rem;
    border-radius: 0.75rem;
    font-weight: 500;
    z-index: 999;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    padding: 1rem;

    .videos-grid {
      gap: 1rem;
    }

    .controls {
      gap: 0.75rem;
    }

    .participants-panel {
      max-width: 90%;
    }
  }
`;

const VideoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const VideoWrapper = styled(motion.div)`
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
  background: #000;
  aspect-ratio: 16/9;
`;

const VideoElement = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ControlsBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 1rem;
  backdrop-filter: blur(10px);
`;

const ControlButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  color: white;
  font-size: 1.2rem;
  transition: all 0.2s ease;
  background: ${props => props.active ? props.activeColor || '#4CAF50' : props.color || '#2c3e50'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const InfoPanel = styled(motion.div)`
  max-width: 500px;
  margin: 1.5rem auto 0;
  background: rgba(30, 41, 59, 0.8);
  border-radius: 1rem;
  padding: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
`;

const ParticipantItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  background: rgba(51, 65, 85, 0.5);
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
`;

const JoinForm = styled(motion.div)`
  max-width: 400px;
  width: 100%;
  padding: 2rem;
  background: rgba(30, 41, 59, 0.8);
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(10px);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(100, 116, 139, 0.5);
  color: white;
  margin-bottom: 1rem;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  }
  
  &::placeholder {
    color: rgba(148, 163, 184, 0.7);
  }
`;

const Button = styled(motion.button)`
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: none;
  background: ${props => props.disabled ? '#475569' : '#3b82f6'};
  color: white;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: #2563eb;
  }
`;

const Alert = styled(motion.div)`
  position: fixed;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(30, 41, 59, 0.9);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 50;
  backdrop-filter: blur(8px);
`;

const ConnectionStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${props => props.isConnected ? '#4ade80' : '#f87171'};
`;

const ReconnectButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  background: #3b82f6;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
`;

const Timer = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  color: white;
  font-variant-numeric: tabular-nums;
`;

const HeaderBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const WaitingScreen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: rgba(0, 0, 0, 0.41);
  color: white;
  padding: 1rem;
`;

// --- Participant Video Component ---
const ParticipantVideo = ({ peer, micOn, videoOn, displayName }) => {
  const ref = useRef();

  useEffect(() => {
    peer.on("stream", stream => {
      if (ref.current) ref.current.srcObject = stream;
    });
  }, [peer]);

  return (
    <VideoWrapper
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <VideoElement ref={ref} autoPlay playsInline />
      <div style={{
        position: "absolute",
        bottom: "0.5rem",
        left: "0.5rem",
        background: "rgba(0, 0, 0, 0.6)",
        color: "white",
        padding: "0.25rem 0.5rem",
        borderRadius: "0.375rem",
        fontSize: "0.875rem",
        fontWeight: "500"
      }}>
        {displayName || "Guest"}
      </div>
      <div style={{
        position: "absolute",
        top: "0.5rem",
        right: "0.5rem",
        display: "flex",
        gap: "0.25rem",
        background: "rgba(0, 0, 0, 0.5)",
        padding: "0.25rem",
        borderRadius: "0.375rem",
        color: "white"
      }}>
        {!micOn && <FiMicOff />}
        {!videoOn && <FiVideoOff />}
      </div>
    </VideoWrapper>
  );
};

// --- Main Video Room Component ---
export default function VideoRoom() {
  const { user } = useAuth();
  const [roomID, setRoomID] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [waitingForApproval, setWaitingForApproval] = useState(false);
  const [joinRequests, setJoinRequests] = useState([]);
  const [joined, setJoined] = useState(false);
  const [stream, setStream] = useState(null);
  const [peers, setPeers] = useState([]);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [currentCamera, setCurrentCamera] = useState("user");
  const [callStartTime, setCallStartTime] = useState(null);
  const [timer, setTimer] = useState("00:00");
  const [alertInfo, setAlertInfo] = useState({ open: false, message: "", severity: "info" });
  const [socketConnected, setSocketConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  const localVideoRef = useRef();
  const videoContainerRef = useRef();
  const peersRef = useRef([]);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // --- Timer ---
  useEffect(() => {
    let interval;
    if (callStartTime) {
      interval = setInterval(() => {
        const elapsed = Date.now() - callStartTime;
        const mins = String(Math.floor(elapsed / 60000)).padStart(2, "0");
        const secs = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, "0");
        setTimer(`${mins}:${secs}`);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStartTime]);

  // Initialize socket connection
  useEffect(() => {
    // Initialize socket connection
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_SERVER, {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });
      socket = socketRef.current;
    }

    // Socket connection events
    socket.on("connect", () => {
      console.log("Connected with ID:", socket.id);
      setSocketConnected(true);
      setReconnecting(false);
      clearTimeout(reconnectTimeoutRef.current);
      
      // Re-join room if we were in a call and got disconnected
      if (joined && roomID) {
        if (isHost) {
          socket.emit("create-room", { roomID, user });
        } else {
          socket.emit("request-to-join", { roomID, user });
          setWaitingForApproval(true);
        }
      }
    });
    
    socket.on("connect_error", (err) => {
      console.error("Connection error:", err);
      setAlertInfo({ open: true, message: "Connection error. Trying to reconnect...", severity: "error" });
      setSocketConnected(false);
      setReconnecting(true);
    });
    
    socket.on("disconnect", (reason) => {
      console.log("Disconnected:", reason);
      setSocketConnected(false);
      if (reason === "io server disconnect") {
        // Disconnected by server, try to reconnect manually
        setReconnecting(true);
        reconnectTimeoutRef.current = setTimeout(() => {
          socket.connect();
        }, 2000);
      }
      // else the socket will automatically try to reconnect
    });
    
    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      clearTimeout(reconnectTimeoutRef.current);
    };
  }, [roomID, user, joined, isHost]);
  
  // --- Socket.io / PeerJS ---
  useEffect(() => {
    if (!socket) return;

    socket.on("new-join-request", ({ from, user: requesterUser }) => {
      setAlertInfo({ open: true, message: `${requesterUser.displayName} wants to join!`, severity: "info" });
      setJoinRequests(prev => [...prev, { id: from, user: requesterUser }]);
    });

    socket.on("request-accepted", () => {
      setWaitingForApproval(false);
      setJoined(true);
      setCallStartTime(Date.now());
      socket.emit("join-room", { roomID, user });
    });

    socket.on("request-declined", () => {
      setWaitingForApproval(false);
      setAlertInfo({ open: true, message: "Your request to join was declined.", severity: "error" });
      stream?.getTracks().forEach(track => track.stop());
      setStream(null);
    });

    if (joined && stream) {
      socket.emit("get-users", roomID);
      
      socket.on("all-users", users => {
        const newPeers = [];
        for (const userID in users) {
          if (userID === socket.id) continue;
          const peer = createPeer(userID, socket.id, stream);
          peersRef.current.push({ peerID: userID, peer });
          newPeers.push({ peerID: userID, peer, user: users[userID], micOn: true, videoOn: true });
        }
        setPeers(newPeers);
      });

      socket.on("user-joined", ({ signal, callerID, user: joiningUser }) => {
        const peer = addPeer(signal, callerID, stream);
        peersRef.current.push({ peerID: callerID, peer });
        setPeers(prev => [...prev, { peerID: callerID, peer, user: joiningUser, micOn: true, videoOn: true }]);
        setAlertInfo({ open: true, message: `${joiningUser.displayName} has joined the call.`, severity: "info" });
      });

      socket.on("receiving-returned-signal", ({ id, signal }) => {
        const item = peersRef.current.find(p => p.peerID === id);
        if (item) item.peer.signal(signal);
      });

      socket.on("user-disconnected", id => {
        const leavingPeer = peersRef.current.find(p => p.peerID === id);
        if (leavingPeer) leavingPeer.peer.destroy();
        peersRef.current = peersRef.current.filter(p => p.peerID !== id);
        setPeers(prev => prev.filter(p => p.peerID !== id));
        setAlertInfo({ open: true, message: `${leavingPeer?.user?.displayName || "A user"} left the call.`, severity: "warning" });
      });
      
      socket.on("host-left", () => {
        setAlertInfo({ open: true, message: "Host has ended the call", severity: "error" });
        endCall();
      });

      socket.on("user-toggled-mic", ({ userID, micOn }) => setPeers(prev => prev.map(p => p.peerID === userID ? { ...p, micOn } : p)));
      socket.on("user-toggled-video", ({ userID, videoOn }) => setPeers(prev => prev.map(p => p.peerID === userID ? { ...p, videoOn } : p)));
    }

    return () => {
      socket.off("connect");
      socket.off("new-join-request");
      socket.off("request-accepted");
      socket.off("request-declined");
      socket.off("user-joined");
      socket.off("receiving-returned-signal");
      socket.off("user-disconnected");
      socket.off("user-toggled-mic");
      socket.off("user-toggled-video");
      socket.off("all-users");
      socket.off("host-left");
    };
  }, [joined, stream, roomID, user]);

  // --- Peer helpers ---
  const createPeer = (userToSignal, callerID, stream) => {
    const peer = new SimplePeer({ initiator: true, trickle: false, stream });
    peer.on("signal", signal => socket.emit("sending-signal", { userToSignal, callerID, signal }));
    return peer;
  };

  const addPeer = (incomingSignal, callerID, stream) => {
    const peer = new SimplePeer({ initiator: false, trickle: false, stream });
    peer.on("signal", signal => socket.emit("returning-signal", { signal, callerID }));
    peer.signal(incomingSignal);
    return peer;
  };

  // --- Call Controls ---
  const startCall = async () => {
    if (!roomID) return setAlertInfo({ open: true, message: "Enter a Room ID!", severity: "error" });
    if (!socketConnected) return setAlertInfo({ open: true, message: "Not connected to server. Please wait or refresh the page.", severity: "error" });
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: currentCamera }, audio: true })
        .catch(err => {
          console.error("Media access error:", err);
          if (err.name === "NotAllowedError") {
            throw new Error("Camera/microphone access denied. Please allow access in your browser settings.");
          } else if (err.name === "NotFoundError") {
            throw new Error("No camera or microphone found. Please connect a device and try again.");
          } else {
            throw err;
          }
        });
      
      setStream(mediaStream);
      if (localVideoRef.current) localVideoRef.current.srcObject = mediaStream;

      socket.emit("check-room", roomID, roomExists => {
        if (roomExists) {
          socket.emit("request-to-join", { roomID, user });
          setWaitingForApproval(true);
        } else {
          socket.emit("create-room", { roomID, user });
          setIsHost(true);
          setJoined(true);
          setCallStartTime(Date.now());
        }
      });
    } catch (err) {
      console.error(err);
      setAlertInfo({ open: true, message: err.message || "Cannot access camera/mic.", severity: "error" });
    }
  };

  const toggleMic = () => {
    const newMic = !micOn;
    stream?.getAudioTracks().forEach(track => (track.enabled = newMic));
    setMicOn(newMic);
    socket.emit("toggle-mic", { roomID, micOn: newMic });
  };

  const toggleVideo = () => {
    const newVideo = !videoOn;
    stream?.getVideoTracks().forEach(track => (track.enabled = newVideo));
    setVideoOn(newVideo);
    socket.emit("toggle-video", { roomID, videoOn: newVideo });
  };

  const switchCamera = async () => {
    if (!stream) return;
    const newFacing = currentCamera === "user" ? "environment" : "user";
    const oldStream = stream;
    oldStream.getTracks().forEach(t => t.stop());
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: newFacing }, audio: true });
      setStream(newStream);
      setCurrentCamera(newFacing);
      if (localVideoRef.current) localVideoRef.current.srcObject = newStream;

      const oldVideoTrack = oldStream.getVideoTracks()[0];
      const newVideoTrack = newStream.getVideoTracks()[0];
      peersRef.current.forEach(({ peer }) => peer.replaceTrack(oldVideoTrack, newVideoTrack, oldStream));
      setAlertInfo({ open: true, message: `Switched to ${newFacing} camera`, severity: "info" });
    } catch (err) {
      console.error(err);
      setAlertInfo({ open: true, message: "Cannot switch camera.", severity: "error" });
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) videoContainerRef.current?.requestFullscreen().catch(console.error);
    else document.exitFullscreen();
  };

  const togglePiP = async () => {
    if (localVideoRef.current && document.pictureInPictureEnabled && !localVideoRef.current.disablePictureInPicture) {
      try {
        if (document.pictureInPictureElement) await document.exitPictureInPicture();
        else await localVideoRef.current.requestPictureInPicture();
      } catch (err) { console.error(err); }
    }
  };

  const endCall = () => {
    setJoined(false);
    setIsHost(false);
    setWaitingForApproval(false);
    setCallStartTime(null);
    setTimer("00:00");
    stream?.getTracks().forEach(track => track.stop());
    peersRef.current.forEach(p => p.peer.destroy());
    peersRef.current = [];
    setPeers([]);
    socket.emit("leave-room", roomID);
    setAlertInfo({ open: true, message: "You left the call.", severity: "info" });
  };

  const handleCopyRoomID = () => {
    navigator.clipboard.writeText(roomID);
    setAlertInfo({ open: true, message: "Room ID copied!", severity: "success" });
  };

  // --- Host Actions ---
  const approveJoin = (id) => {
    socket.emit("respond-to-request", { roomID, to: id, accepted: true });
    setJoinRequests(prev => prev.filter(r => r.id !== id));
    setAlertInfo({ open: true, message: "Request approved", severity: "success" });
  };

  const declineJoin = (id) => {
    socket.emit("respond-to-request", { roomID, to: id, accepted: false });
    setJoinRequests(prev => prev.filter(r => r.id !== id));
    setAlertInfo({ open: true, message: "Request declined", severity: "error" });
  };

  const removeParticipant = (peerID) => {
    socket.emit("remove-participant", { roomID, peerID });
    const leavingPeer = peersRef.current.find(p => p.peerID === peerID);
    if (leavingPeer) leavingPeer.peer.destroy();
    peersRef.current = peersRef.current.filter(p => p.peerID !== peerID);
    setPeers(prev => prev.filter(p => p.peerID !== peerID));
    setAlertInfo({ open: true, message: "Participant removed", severity: "warning" });
  };

  // Manual reconnect function
  const handleManualReconnect = () => {
    if (socketRef.current) {
      setReconnecting(true);
      socketRef.current.connect();
      setAlertInfo({ open: true, message: "Attempting to reconnect...", severity: "info" });
    }
  };
  
  // --- Render ---
  if (!joined && !waitingForApproval) {
    return (
      <VideoContainer>
        <ConnectionStatus isConnected={socketConnected}>
          {socketConnected ? 
            <><FiWifi size={18} /> Connected</> : 
            <><FiWifiOff size={18} /> Disconnected</>
          }
          {!socketConnected && 
            <ReconnectButton 
              whileTap={{ scale: 0.95 }} 
              onClick={handleManualReconnect}>
              <FiRefreshCw className={reconnecting ? "animate-spin" : ""} />
              Reconnect
            </ReconnectButton>
          }
        </ConnectionStatus>
        
        <LucideUser size={60} style={{ color: "#4CAF50", marginBottom: "1rem" }} />
        <h1 style={{ fontSize: "2.5rem", fontWeight: "700", marginBottom: "0.5rem" }}>Cook Together</h1>
        <p style={{ color: "#94A3B8", marginBottom: "1.5rem" }}>Connecting Kitchens, One Recipe at a Time</p>

        <JoinForm
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <Input
            type="text"
            placeholder="Enter Room ID"
            value={roomID}
            onChange={e => setRoomID(e.target.value)}
          />
          <Button
            whileTap={{ scale: 0.95 }}
            onClick={startCall}
            disabled={!socketConnected}
          >
            Join Call
          </Button>
        </JoinForm>
      </VideoContainer>
    );
  }

  if (waitingForApproval) {
    return (
      <WaitingScreen>
        <ConnectionStatus isConnected={socketConnected} style={{ marginBottom: "1.5rem" }}>
          {socketConnected ? 
            <><FiWifi size={20} /> Connected</> : 
            <><FiWifiOff size={20} /> Disconnected</>
          }
        </ConnectionStatus>
        
        <div style={{
          animation: "spin 1s linear infinite",
          borderRadius: "50%",
          height: "3rem",
          width: "3rem",
          borderTop: "4px solid #4CAF50",
          borderRight: "4px solid transparent",
          borderBottom: "4px solid transparent",
          borderLeft: "4px solid transparent",
          marginBottom: "1rem"
        }}></div>
        <p style={{ fontSize: "1.125rem", marginBottom: "1.5rem" }}>Waiting for host to approve your request...</p>
        
        <Button
          whileTap={{ scale: 0.95 }}
          onClick={endCall}
          style={{ 
            maxWidth: "200px", 
            background: "#ef4444",
            marginTop: "1rem"
          }}
        >
          Cancel
        </Button>
        
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </WaitingScreen>
    );
  }

  return (
    <VideoContainer ref={videoContainerRef}>
      <HeaderBar>
        <ConnectionStatus isConnected={socketConnected}>
          {socketConnected ? 
            <><FiWifi size={16} /> Connected</> : 
            <><FiWifiOff size={16} /> Disconnected</>
          }
          {!socketConnected && 
            <ReconnectButton 
              whileTap={{ scale: 0.95 }} 
              onClick={handleManualReconnect}
            >
              <FiRefreshCw className={reconnecting ? "animate-spin" : ""} size={12} />
              Reconnect
            </ReconnectButton>
          }
        </ConnectionStatus>
        <Timer>Group Call • {timer}</Timer>
        <div style={{ width: "6rem" }}></div> {/* Empty div for flex spacing */}
      </HeaderBar>
      
      <VideoGrid>
        <VideoWrapper>
          <VideoElement ref={localVideoRef} muted autoPlay playsInline />
          <div style={{
            position: "absolute",
            bottom: "0.5rem",
            left: "0.5rem",
            background: "rgba(0, 0, 0, 0.6)",
            color: "white",
            padding: "0.25rem 0.5rem",
            borderRadius: "0.375rem",
            fontSize: "0.875rem",
            fontWeight: "500"
          }}>
            {user?.displayName || "You"}
          </div>
          <div style={{
            position: "absolute",
            top: "0.5rem",
            right: "0.5rem",
            display: "flex",
            gap: "0.25rem",
            background: "rgba(0, 0, 0, 0.5)",
            padding: "0.25rem",
            borderRadius: "0.375rem",
            color: "white"
          }}>
            {!micOn && <FiMicOff />}
            {!videoOn && <FiVideoOff />}
          </div>
        </VideoWrapper>

        <AnimatePresence>
          {peers.map(p => (
            <ParticipantVideo key={p.peerID} peer={p.peer} micOn={p.micOn} videoOn={p.videoOn} displayName={p.user?.displayName} />
          ))}
        </AnimatePresence>
      </VideoGrid>

      <ControlsBar>
        <ControlButton 
          onClick={toggleMic} 
          whileTap={{ scale: 0.9 }} 
          active={micOn}
          activeColor="#4CAF50"
          color={micOn ? undefined : "#ef4444"}
        >
          {micOn ? <FiMic /> : <FiMicOff />}
        </ControlButton>
        <ControlButton 
          onClick={toggleVideo} 
          whileTap={{ scale: 0.9 }} 
          active={videoOn}
          activeColor="#4CAF50"
          color={videoOn ? undefined : "#ef4444"}
        >
          {videoOn ? <FiVideo /> : <FiVideoOff />}
        </ControlButton>
        <ControlButton 
          onClick={switchCamera} 
          whileTap={{ scale: 0.9 }} 
          color="#3b82f6"
        >
          <FiRepeat />
        </ControlButton>
        <ControlButton 
          onClick={toggleFullscreen} 
          whileTap={{ scale: 0.9 }} 
          color="#eab308"
        >
          <FiMaximize />
        </ControlButton>
        <ControlButton 
          onClick={togglePiP} 
          whileTap={{ scale: 0.9 }} 
          color="#8b5cf6"
        >
          <FiExternalLink />
        </ControlButton>
        <ControlButton 
          onClick={endCall} 
          whileTap={{ scale: 0.9 }} 
          color="#ef4444"
        >
          <FiPhoneOff />
        </ControlButton>
      </ControlsBar>

      {/* Participants & Join Requests */}
      <motion.div layout className="mt-6 max-w-md mx-auto bg-gray-800 rounded-2xl p-4 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2"><FiUsers /> <span>Participants ({peers.length + 1})</span></div>
        </div>

        {/* Participants */}
        <div className="flex flex-col gap-1 max-h-40 overflow-auto mb-2">
          <div className="flex items-center justify-between px-2 py-1 bg-gray-700 rounded">{user?.displayName || 'You'} (You) {isHost && "(Host)"}</div>
          {peers.map(p => (
            <div key={p.peerID} className="flex items-center justify-between px-2 py-1 bg-gray-700 rounded">
              <span>{p.user?.displayName || `User (${p.peerID.substring(0,6)}...)`}</span>
              {isHost && <motion.button whileTap={{ scale: 0.9 }} onClick={() => removeParticipant(p.peerID)} className="text-red-500 font-bold">Remove</motion.button>}
            </div>
          ))}
        </div>

        {/* Join requests */}
        {isHost && joinRequests.length > 0 && (
          <div className="flex flex-col gap-1 max-h-40 overflow-auto mb-2">
            <div className="font-semibold text-yellow-400 mb-1">Pending Join Requests</div>
            {joinRequests.map(req => (
              <div key={req.id} className="flex items-center justify-between px-2 py-1 bg-gray-700 rounded">
                <span>{req.user?.displayName || `Guest (${req.id.substring(0,6)}...)`}</span>
                <div className="flex gap-1">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => approveJoin(req.id)} className="px-2 py-0.5 rounded bg-green-500 text-white text-sm">Approve</motion.button>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => declineJoin(req.id)} className="px-2 py-0.5 rounded bg-red-500 text-white text-sm">Decline</motion.button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Room ID */}
        <div className="flex mt-2 gap-2">
          <input type="text" value={roomID} readOnly className="flex-grow px-2 py-1 rounded bg-gray-900 text-white" />
          <motion.button onClick={handleCopyRoomID} whileTap={{ scale: 0.95 }} className="px-3 py-1 rounded bg-green-500 text-white flex items-center gap-1"><FiCopy /> Copy</motion.button>
        </div>
      </motion.div>

      {/* Alerts */}
      <AnimatePresence>
        {alertInfo.open && (
          <Alert
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {alertInfo.message}
          </Alert>
        )}
      </AnimatePresence>
    </VideoContainer>
  );
}
