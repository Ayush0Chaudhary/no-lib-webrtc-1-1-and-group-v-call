import { log } from 'console';
import { useRef, useState } from 'react';
import io from 'socket.io-client';

const peerConfiguration = {
  iceServers: [
    {
      urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'],
    },
  ],
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
};
let count = 0;
const socket = io('ws://localhost:3000/room');

const RoomCallPage = () => {
  const [meetingLink, setMeetingLink] = useState<string>('');
  const videoRef = useRef(null);
  const [usersInMeet, setUsersInMeet] = useState<string[]>([]);
  const remoteVideoRefs1 = useRef(null);
  const remoteVideoRefs2 = useRef(null);
  const remoteVideoRefs3 = useRef(null);
  const remoteVideoRefs4 = useRef(null);

  const users: string[] = [];
  const pcMap = new Map<string, RTCPeerConnection>();
  // const [myStream, setMyStream] = useState<MediaStream>();

  const joinCall = async () => {
    const myStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (videoRef.current) {
      videoRef.current.srcObject = myStream;
    }
    // setMyStream(myStream);

    socket.emit('join-room', meetingLink);
    socket.on('room-participants', async (participants) => {
      const parsedJson = JSON.parse(participants);
      for (let i = 0; i < parsedJson.userIds.length; i++) {
        if (!users.includes(parsedJson.userIds[i]) && parsedJson.userIds[i] !== socket.id) {
          console.log(parsedJson.userIds[i], '##################');
          setUsersInMeet([...usersInMeet, parsedJson.userIds[i]]);
          const pc = new RTCPeerConnection(peerConfiguration);

          pc.ontrack = (event) => {
            console.log('ontrackkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk');
            console.log(pc, 'here', Date.now());
            console.log(users);
            const remoteStream = new MediaStream();
            remoteStream.addTrack(event.track);
            if (users.length === 1) {
              remoteVideoRefs1.current.srcObject = remoteStream;
            } else if (users.length === 2) {
              remoteVideoRefs2.current.srcObject = remoteStream;
            } else if (users.length === 3) {
              remoteVideoRefs3.current.srcObject = remoteStream;
            } else if (users.length === 4) {
              remoteVideoRefs4.current.srcObject = remoteStream;
            }
          };
          pc.onicecandidate = (event) => {
            if (event.candidate) {
              socket.emit(
                'ice-candidate',
                JSON.stringify({
                  candidate: event.candidate,
                  to: parsedJson.userIds[i],
                })
              );
            }
          };
          myStream.getTracks().forEach((track) => pc.addTrack(track, myStream));
          const offer = await pc.createOffer();
          pc.setLocalDescription(offer);
          socket.emit(
            'offer',
            JSON.stringify({
              offer,
              to: parsedJson.userIds[i],
            })
          );

          socket.on('answer', async (answer) => {
            console.log('********Answer*********');

            const parsedAnswer = JSON.parse(answer);
            await pc.setRemoteDescription(parsedAnswer.answer).then(() => {
              socket.on('ice-candidate', async (candidate) => {
                const parsedCandidate = JSON.parse(candidate);
                await pc.addIceCandidate(parsedCandidate.candidate);
              });
            });
          });
          socket.on('ice-candidate', async (candidate) => {
            const parsedCandidate = JSON.parse(candidate);

            console.log('********Remote ICE CANDIDATE********', Date.now());
            await pc.addIceCandidate(parsedCandidate.candidate);
          });
          console.log(pc.connectionState, '%%%%%%%%%%%%%%%');

          if (pc.connectionState === 'new') {
            users.push(parsedJson.userIds[i]);
          }
        }
      }
    });
    // makePCWithNewUser();
  };

  const startCall = async () => {
    const myStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (videoRef.current) {
      videoRef.current.srcObject = myStream;
    }
    socket.emit('start-call', meetingLink);

    socket.on('offer', async (data) => {
      const parsedJSON = JSON.parse(data);
      console.log(parsedJSON, 'parsedJson Offer');

      const pc = new RTCPeerConnection(peerConfiguration);
      
      myStream.getTracks().forEach((track) => pc.addTrack(track, myStream));

      await pc.setRemoteDescription(parsedJSON.offer).then(() => {
        console.log(Date.now(), '*********Remote Description Set*********', pc);
        pcMap.set(parsedJSON.from, pc);
      });
    });

    socket.on('ice-candidate', async (data) => {
      const parsedJSON = JSON.parse(data);
      const pc = pcMap.get(parsedJSON.from);
      console.log('***********ICE CANDIDATE***********', parsedJSON.candidate, Date.now());
      if (pc?.iceConnectionState) {
        await pc.addIceCandidate(parsedJSON.candidate);
        console.log(pc, "^^");

        // pc.onsignalingstatechange = (event) => {
        //   console.log('Signaling State:', pc.signalingState);
        // }
        const answer = await pc.createAnswer();
        pc.setLocalDescription(answer);
        socket.emit('answer', JSON.stringify({ answer: answer, to: parsedJSON.from }));
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit(
              'ice-candidate',
              JSON.stringify({ candidate: event.candidate, to: parsedJSON.from })
            );
          }
        };

      if(pc.connectionState === 'new') {
        users.push(parsedJSON.from);
      }

      pc.ontrack = (event) => {
        console.log('ontrack');
        console.log(users);

        const remoteStream = new MediaStream();
        remoteStream.addTrack(event.track);
        if(users.length === 1) {
          remoteVideoRefs1.current.srcObject = remoteStream;
        }else if(users.length === 2) {
          remoteVideoRefs2.current.srcObject = remoteStream;
        }else if(users.length === 3) {
          remoteVideoRefs3.current.srcObject = remoteStream;
        }else if(users.length === 4) {
          remoteVideoRefs4.current.srcObject = remoteStream;
        }
      };


      } else {
        console.log('Just recieved unknow icec');
      }

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
            className='w-full h-full object-cover flex-1'
            autoPlay
            // playsInline
            muted
          ></video>
          <video
            ref={remoteVideoRefs1}
            className='w-full h-full object-cover flex-1'
            autoPlay
            // muted
          ></video>
          <video
            ref={remoteVideoRefs2}
            className='w-full h-full object-cover flex-1'
            autoPlay
            // muted
          ></video>
          <video
            ref={remoteVideoRefs3}
            className='w-full h-full object-cover flex-1'
            autoPlay
            // muted
          ></video>
          <video
            ref={remoteVideoRefs4}
            className='w-full h-full object-cover flex-1'
            autoPlay
            // muted
          ></video>

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
              value={meetingLink}
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
