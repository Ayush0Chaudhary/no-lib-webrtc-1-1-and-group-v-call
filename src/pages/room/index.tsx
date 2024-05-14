import Navbar from '@/components/nav';
import { Separator } from '@/components/ui/separator';
import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const peerConfiguration = {
  iceServers: [
    {
      urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'],
    },
  ],
};
const peerConnection = new RTCPeerConnection(peerConfiguration);
let count = 0;
const socket = io('ws://localhost:3000/room');

const RoomCallPage = () => {
  const videoRef = useRef(null);
  // create list of remoteVideoRef for group video call
  let remoteVideoRef = useRef([]);
  // const remoteVideoRef = useRef(null);

  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track: { stop: () => void }) => {
          track.stop();
        });
      }
    };
  }, []);

  const joinCall = () => {
    console.log('Joining call');
    socket.emit('join-room', 'room');
  }

  return (
    <>
      <div className='bg-black text-white min-h-screen flex justify-center items-center'>
        <Navbar />
        <div className='flex flex-col items-center'>
          <Separator />
          <video
            ref={videoRef}
            className='w-96 h-96 bg-gray-800 rounded-lg shadow-lg'
            autoPlay
            playsInline
            muted
          ></video>
          <button onClick={joinCall} className='bg-blue-800 text-white px-4 py-2 mr-2 rounded'>
           Join Call
          </button>
          <button onClick={joinCall} className='bg-white text-black px-4 py-2 mr-2 rounded'>
           Start Call
          </button>
        </div>
      </div>
    </>
  );
};

export default RoomCallPage;
