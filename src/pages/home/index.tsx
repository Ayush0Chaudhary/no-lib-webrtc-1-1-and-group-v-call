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
const socket = io('ws://localhost:3000');

const RoomCallPage = () => {
  const videoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [socketIOID, setsocketIOID] = useState('');
  const [sioID, setsioID] = useState('');
  // finding the ICE-Candidates
  let stream;

  useEffect(() => {
    const getCameraStream = async () => {
      try {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    };
    // getCameraStream();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track: { stop: () => void }) => {
          track.stop();
        });
      }
    };
  }, []);

  const handleCall = async () => {
    console.log('Call initiated');
    // Creating emty media stream
    const remoteStream = new MediaStream();
    // Adding the remote stream to the peer connection
    const myStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (videoRef.current) {
      videoRef.current.srcObject = myStream;
    }
    // Adding All incoming tracks to the peer connection
    myStream.getTracks().forEach((track) => peerConnection.addTrack(track, myStream));

    const offer = await peerConnection.createOffer();

    peerConnection.setLocalDescription(offer);

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        count = count + 1;
        const ice = {
          to: socketIOID,
          icec: event.candidate,
        };
        socket.emit('ice-candidate', JSON.stringify(ice));
        console.log('New ICE candidate:', count);
      } else {
        console.log('All ICE candidates have been sent');
      }
    };

    // Adding the remote stream to the remote video element
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
    console.log(peerConnection);

    const data = {
      to: socketIOID,
      offer: offer,
    };
    socket.emit('offer', JSON.stringify(data));

    socket.on('answer', (data) => {
      console.log(data);
      const parsedJson = JSON.parse(data);
      console.log(parsedJson);
      peerConnection.setRemoteDescription(parsedJson.answer);
    });
    socket.on('ice-candidate', (data) => {
      // console.log(data);
      const { from, icec } = JSON.parse(data);
      console.log(from, icec);

      peerConnection.addIceCandidate(icec).catch((error) => {
        console.log(error, 'chujbhu');
      });
    });

    peerConnection.ontrack = (event) => {
      remoteStream.addTrack(event.track);
    };
  };

  const openToCall = async () => {
    console.log('Open to calls');
    // socket.io emits out the RTCSessionDescription to the new client
    const remoteStream = new MediaStream();
    const myStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (videoRef.current) {
      videoRef.current.srcObject = myStream;
    }
    // Adding All incoming tracks to the peer connection
    myStream.getTracks().forEach((track) => peerConnection.addTrack(track, myStream));

    socket.on('offer', async (data) => {
      console.log(data, 'sdsds');
      // setRemoteSDP(data);
      const parsedJson = JSON.parse(data);
      peerConnection.setRemoteDescription(parsedJson.offer);
      const answer = await peerConnection.createAnswer(peerConfiguration);
      console.log(answer);
      peerConnection.setLocalDescription(answer as RTCLocalSessionDescriptionInit);
      const datas = {
        to: socketIOID,
        answer: answer,
      };
      console.log(peerConnection);
      socket.emit('answer', JSON.stringify(datas));
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        count = count + 1;
        const ice = {
          to: socketIOID,
          icec: event.candidate,
        };
        socket.emit('ice-candidate', JSON.stringify(ice));
        console.log('New ICE candidate:', count);
      } else {
        console.log('All ICE candidates have been sent');
      }
    };
    if (remoteVideoRef.current) {
      (remoteVideoRef.current as HTMLVideoElement).srcObject = remoteStream;
    }

    socket.on('ice-candidate', (data) => {
      // console.log(data);
      const { from, icec } = JSON.parse(data);
      // console.log(from, icec);
      console.log(from);
      peerConnection.addIceCandidate(icec).catch((error) => {
        console.log(error, 'chujbhu');
      });
    });

    peerConnection.ontrack = (event) => {
      remoteStream.addTrack(event.track);
    };
  };

  const handleHangup = () => {
    setsioID(socket.id || '');
    console.log(socket);

    // Add logic for hanging up the call
    console.log('Call ended');
  };

  const testSocket1 = () => {
    socket.on('offer', (data) => {
      console.log(data);
    });
  };
  const testSocket2 = () => {
    socket.emit(
      'offer',
      JSON.stringify({
        to: socketIOID,
        test: 'sadsadasd',
      })
    );
  };

  return (
    <>
      <Navbar />
      <Separator />
      <div className='bg-black text-white min-h-screen flex justify-center items-center'>
        <div className='max-w-lg'>
          <h1 className='text-3xl mb-6 text-center'>Your Feed || Remote Feed</h1>
          <div className='relative w-full h-96 flex'>
            {/* Video element */}
            <div className='flex w-full'>
              {/* Local Video */}
              <video ref={videoRef} className='w-full h-full object-cover flex-1' autoPlay></video>
              {/* Remote Video */}
              <video
                ref={remoteVideoRef}
                className='w-full h-full object-cover flex-1'
                autoPlay
              ></video>
            </div>
            {/* Overlay */}
            <div className='absolute inset-0 bg-black opacity-50'></div>
          </div>
          {/* Call buttons */}
          <div className='flex justify-center mt-4'>
            <button onClick={handleCall} className='bg-blue-800 text-white px-4 py-2 mr-2 rounded'>
              Call
            </button>
            <button onClick={handleHangup} className='bg-red-600 text-white px-4 py-2 ml-2 rounded'>
              Hangup
            </button>
          </div>
          <div className='flex justify-center mt-4'>
            <button onClick={openToCall} className='bg-green-600 text-white px-4 py-2 mr-2 rounded'>
              Accept Calls
            </button>
            <button onClick={handleHangup} className='bg-white text-black px-4 py-2 ml-2 rounded'>
              Generate my Random ID
            </button>
          </div>
          {/* <div className="flex justify-center mt-4">
        <button onClick={testSocket2} className='bg-red-600 text-white px-4 py-2 rounded'>
          Test Socket 2 Emit
        </button>
      </div> */}
          {/* Meeting link text field */}
          <div className='mt-4'>
            <label htmlFor='meetingLink' className='block text-sm font-medium'>
              Enter Other Person's Socket.io ID and your ID is : {sioID}
            </label>
            <input
              id='meetingLink'
              name='meetingLink'
              type='text'
              value={socketIOID}
              onChange={(e) => setsocketIOID(e.target.value)}
              className='mt-1 p-2 w-full rounded border border-gray-600 bg-gray-800 text-white'
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default RoomCallPage;
