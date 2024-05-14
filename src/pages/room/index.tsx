import { useRef, useState } from 'react';
import io from 'socket.io-client';

const peerConfiguration = {
  iceServers: [
    {
      urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'],
    },
  ],
};
const peerConnections = {};

let count = 0;
const socket = io('ws://localhost:3000/room');

const RoomCallPage = () => {
  const videoRef = useRef(null);
  const [meetinglink, setMeetingLink] = useState('');
  const [users, setUsers] = useState([]);
  const remoteVideoRef = useRef({});

  //   useEffect(() => {
  //     return () => {
  //       if (videoRef.current && videoRef.current.srcObject) {
  //         videoRef.current.srcObject.getTracks().forEach((track: { stop: () => void }) => {
  //           track.stop();
  //         });
  //       }
  //     };
  //   }, []);

  const joinCall = async () => {
    console.log('Joining call');
    socket.emit('join-room', meetinglink);
    // create offer and shit
    const myStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (videoRef.current) {
      (videoRef.current as HTMLVideoElement).srcObject = myStream;
    }
    const peerConnection = new RTCPeerConnection(peerConfiguration);
    myStream.getTracks().forEach((track) => peerConnection.addTrack(track, myStream));

    const offer = await peerConnection.createOffer();
    peerConnection.setLocalDescription(offer);
    const data = {
      type: 'offer',
      room: meetinglink,
      data: offer,
    };
    socket.emit('send-joining-data', JSON.stringify(data));
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        count = count + 1;
        const data = {
          type: 'ice',
          room: meetinglink,
          data: event.candidate,
        };
        socket.emit('send-joining-data', JSON.stringify(data));
        console.log('New ICE candidate:', count);
      } else {
        console.log('All ICE candidates have been sent');
      }
    };

    // socket.on('receive-returning-data', (data) => {
    //   const parsedJson = JSON.parse(data);
    //   if (parsedJson.type === 'answer') {
    //     peerConnection.setRemoteDescription(parsedJson.data);
    //   } else if (parsedJson.type === 'ice') {
    //     peerConnection.addIceCandidate(parsedJson.data);
    //   }
    //  })

    // socket.emit('send-joining-data', meetinglink);
  };

  const startCall = async () => {
    socket.emit('join-room', meetinglink);
    const myStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (videoRef.current) {
      (videoRef.current as HTMLVideoElement).srcObject = myStream;
    }

    // whenever a new user joins,
    // take their data,
    // and set pc,
    // create a offer and icecs,
    // and send them to new user.

    socket.on('user-joined', (data) => {
      console.log('User joined', data);
      const parsedJson = JSON.parse(data);
      const peerConnection = new RTCPeerConnection(peerConfiguration);
      myStream.getTracks().forEach((track) => peerConnection.addTrack(track, myStream));

      if (parsedJson.type === 'ice') {
        const icepeerConnection = peerConnections[parsedJson.from];
        console.log(icepeerConnection);

        icepeerConnection
          .addIceCandidate(parsedJson.data)
          .then((s) => {
            console.log('Ice candidate added');
          })
          .catch((e) => console.log(e));
      } else if (parsedJson.type === 'offer') {
        // log time
        peerConnection.setRemoteDescription(parsedJson.data);
        console.log(peerConnection);

        peerConnection.createAnswer().then((answer) => {
          // send answer and ice candidates to new user
          peerConnection.setLocalDescription(answer);
          peerConnections[parsedJson.from] = peerConnection;
          const data = {
            to: parsedJson.from,
            type: 'answer',
            room: meetinglink,
            data: answer,
          };
          socket.emit('return-data-to-new-user', JSON.stringify(data));
          peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
              const data = {
                to: parsedJson.from,
                type: 'ice',
                room: meetinglink,
                data: event.candidate,
              };
              socket.emit('return-data-to-new-user', JSON.stringify(data));
            }
          };

          peerConnection.ontrack = (event) => {
            console.log('New user track added');
            const remoteStream = new MediaStream();
            remoteStream.addTrack(event.track);
            setUsers((prev) => [...prev, parsedJson.from]);
            remoteVideoRef.current[parsedJson.from].srcObject = remoteStream;
          }
          
        });
      }
      // for (const key in peerConnections) {
      //   console.log(key, peerConnections[key]);
      //   peerConnections[key].ontrack = (event) => {
      //     console.log('New user track added');
      //     const remoteStream = new MediaStream();
      //     remoteStream.addTrack(event.track);
      //     setUsers((prev) => [...prev, parsedJson.from]);
      //     remoteVideoRef.current[parsedJson.from].srcObject = remoteStream;
      //   };
      // }
    });
  };

  return (
    <>
      <div className='bg-black text-white min-h-screen flex justify-center items-center'>
        {/* <Navbar /> */}
        <div className='flex flex-col items-center'>
          {/* <Separator /> */}
          <video
            ref={videoRef}
            className='w-96 h-96 bg-gray-800 rounded-lg shadow-lg'
            autoPlay
            playsInline
            muted
          ></video>
          {/* {Object.keys(remoteVideoRef.current).map((userId) => (
        <div key={userId} className="w-1/4">
          <video
            ref={(el) => {
              remoteVideoRef.current[userId] = el;
            }}
            autoPlay
            className="w-full h-full"
          ></video>
        </div>
      ))} */}
          {users.map((user) => (
            <div key={user} className='w-1/4'>
              <video
                ref={(el) => (videoRefs.current[user] = el)}
                autoPlay
                className='w-full h-full'
              ></video>
            </div>
          ))}
          <button onClick={joinCall} className='bg-blue-800 m-2 text-white px-4 py-2 mr-2 rounded'>
            Join Call
          </button>
          <div className='mt-4 m-2'>
            <label htmlFor='meetingLink' className='block text-sm font-medium'>
              Enter Meeting Link:
            </label>
            <input
              id='meetingLink'
              name='meetingLink'
              type='text'
              value={meetinglink}
              onChange={(e) => setMeetingLink(e.target.value)}
              className='mt-1 p-2 w-full rounded border border-gray-600 bg-gray-800 text-white'
            />
          </div>
          <button onClick={startCall} className='bg-white text-black px-4 py-2 mr-2 rounded'>
            Start Call
          </button>
        </div>
      </div>
    </>
  );
};

export default RoomCallPage;
