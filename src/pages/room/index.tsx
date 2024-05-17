// implement Signalling state checks
import { useRef, useState, useEffect } from 'react';
import io from 'socket.io-client';
import TaskList from '@/components/TaskList';
import "./index.scss";

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

  const [frontendEnabled, setFrontedEnabled] = useState(true);
  const [src1, setsrc1] = useState('');
  const [src2, setsrc2] = useState('');
  const [src3, setsrc3] = useState('');
  const users: string[] = [];
  const pcMap = new Map<string, RTCPeerConnection>();
  // const [myStream, setMyStream] = useState<MediaStream>();

  // useEffect(() => {
  //   console.log(users);
  //   if (videoRef.current) {
  //     console.log('idhar useffect mei control pahuch gya hai');
  //     videoRef.current.className = `w-full h-full object-cover flex-1 ${users.length > 1 ? 'half-width' : ''}`;
  //   }
  // }, [videoRef]);

  const joinCall = async () => {
    const myStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (videoRef.current) {
      videoRef.current.srcObject = myStream;
    }
    setFrontedEnabled(false);
    // setMyStream(myStream);

    socket.emit('join-room', meetingLink);
    socket.on('room-participants', async (participants) => {
      const parsedJson = JSON.parse(participants);
      // console.log(participants);
      //remove my id from parsedJson.userIds
      parsedJson.userIds = parsedJson.userIds.filter((id: string) => id !== socket.id);
      for (let i = 0; i < parsedJson.userIds.length; i++) {
        if (!users.includes(parsedJson.userIds[i]) && parsedJson.userIds[i] !== socket.id) {
          console.log(parsedJson.userIds[i], '##################');
          const pc = new RTCPeerConnection(peerConfiguration);
          users.push(parsedJson.userIds[i]);
          pc.ontrack = (event) => {
            console.log(event);
            
            console.log((i+1),'ontrackkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk');
            console.log(pc, 'here', Date.now());
            console.log(users);
            const remoteStream = new MediaStream();
            remoteStream.addTrack(event.track);
            if ((i+1) === 1) {
              
              console.log('DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDdd');
              
              remoteVideoRefs1.current.srcObject = remoteStream;
              // console.log('hello');
              videoRef.current.className = `w-6 h object-cover flex-1 vids`;
              remoteVideoRefs1.current.className = `w-1/2 h object-cover flex-1 vids`; 

            } else if ((i+1) === 2) {
              remoteVideoRefs2.current.srcObject = remoteStream;
              videoRef.current.className = `w-6 h-1/2 object-cover flex-1 vids`;
              remoteVideoRefs1.current.className = `w-1/2 h-1/2 object-cover flex-1 vids`;
              remoteVideoRefs2.current.className = `w-6 h-1/2 object-cover flex-1 vids`; 
              remoteVideoRefs3.current.className = `w-6 h-1/2 object-cover flex-1 vids`; 
                
            } else if ((i+1) === 3) {
              remoteVideoRefs3.current.srcObject = remoteStream;
            } else if ((i+1) === 4) {
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
                console.log('********Remote ICE CANDIDATE********', Date.now());
              });
            });
          });
          console.log(pc.connectionState, '%%%%%%%%%%%%%%%');

          // if (pc.connectionState === 'new') {
          //   users.push(parsedJson.userIds[i]);
          // }
        }
      }
    });

    socket.on('offer', async (data) => {
      const parsedJSON = JSON.parse(data);
      console.log(parsedJSON, 'parsedJson Offer');
      users.push(parsedJSON.from);

      const pc = new RTCPeerConnection(peerConfiguration);
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit(
            'ice-candidate',
            JSON.stringify({ candidate: event.candidate, to: parsedJSON.from })
          );
        }
      };
      pc.ontrack = (event) => {
        console.log('ontrack', new Date().getTime(), event,event.track);
        console.log(users);

        const remoteStream = new MediaStream();
        remoteStream.addTrack(event.track);
        console.log(users.length);
        
        if (users.length === 1) {
          console.log('DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDdd');
          setsrc1(users[1]);
          remoteVideoRefs1.current.srcObject = remoteStream;
          // console.log('hello');
          videoRef.current.className = `w-6 h object-cover flex-1 vids`;
          remoteVideoRefs1.current.className = `w-1/2 h object-cover flex-1 vids`; 
        } else if (users.length === 2) {
          setsrc2(users[2]);

          remoteVideoRefs2.current.srcObject = remoteStream;
          videoRef.current.className = `w-6 h-1/2 object-cover flex-1 vids`;
          remoteVideoRefs1.current.className = `w-1/2 h-1/2 object-cover flex-1 vids`;
          remoteVideoRefs2.current.className = `w-6 h-1/2 object-cover flex-1 vids`; 
          remoteVideoRefs3.current.className = `w-6 h-1/2 object-cover flex-1 vids`; 
          
        } else if (users.length === 3) {
          setsrc3(users[3]);

          remoteVideoRefs3.current.srcObject = remoteStream;
        } else if (users.length === 4) {
          setsrc4(users[4]);
          
          remoteVideoRefs4.current.srcObject = remoteStream;
        }
        
      };
      // pc.onicecandidate = handleICECandidateEvent;
      // pc.ontrack = handleTrackEvent
      // pc.onnegotiationneeded = handleNegotiationNeededEvent;
      // // pc.onremovetrack = handleRemoveTrackEvent;
      // pc.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
      // pc.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
      // pc.onsignalingstatechange = handleSignalingStateChangeEvent;

      myStream.getTracks().forEach((track) => pc.addTrack(track, myStream));

      await pc.setRemoteDescription(parsedJSON.offer).then(() => {
        console.log(Date.now(), '*********Remote Description Set*********', pc);
        pcMap.set(parsedJSON.from, pc);
      });
      const answer = await pc.createAnswer();
      pc.setLocalDescription(answer);
      socket.emit('answer', JSON.stringify({ answer: answer, to: parsedJSON.from }));
    });


    socket.on('ice-candidate', async (data) => {
      const parsedJSON = JSON.parse(data);
      const pc = pcMap.get(parsedJSON.from);
      console.log('***********ICE CANDIDATE***********', parsedJSON.candidate, Date.now());
      if (pc?.iceConnectionState) {
        await pc.addIceCandidate(parsedJSON.candidate);

        // pc.onsignalingstatechange = (event) => {
        //   console.log('Signaling State:', pc.signalingState);
        // }
        // if (pc.signalingState === 'stable') {

        // }
      } else {
        console.log('Just recieved unknow icec');
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
      users.push(parsedJSON.from);

      const pc = new RTCPeerConnection(peerConfiguration);
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit(
            'ice-candidate',
            JSON.stringify({ candidate: event.candidate, to: parsedJSON.from })
          );
        }
      };
      pc.ontrack = (event) => {
        console.log('ontrack', new Date().getTime(), event,event.track);
        console.log(users);

        const remoteStream = new MediaStream();
        remoteStream.addTrack(event.track);
        console.log(users.length);
        setUsersInMeet(users);
        console.log(users, "dddddddddddddddddddddddddd");
        
        
        if (users.length === 1) {
          console.log('DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDdd');
          
          remoteVideoRefs1.current.srcObject = remoteStream;
          // console.log('hello');
          videoRef.current.className = `w-6 h object-cover flex-1 vids`;
          remoteVideoRefs1.current.className = `w-1/2 h object-cover flex-1 vids`; 
        } else if (users.length === 2) {
          remoteVideoRefs2.current.srcObject = remoteStream;
          videoRef.current.className = `w-6 h-1/2 object-cover flex-1 vids`;
          remoteVideoRefs1.current.className = `w-1/2 h-1/2 object-cover flex-1 vids`;
          remoteVideoRefs2.current.className = `w-6 h-1/2 object-cover flex-1 vids`; 
          remoteVideoRefs3.current.className = `w-6 h-1/2 object-cover flex-1 vids`; 
          
        } else if (users.length === 3) {
          remoteVideoRefs3.current.srcObject = remoteStream;
        } else if (users.length === 4) {
          remoteVideoRefs4.current.srcObject = remoteStream;
        }
      };
      // pc.onicecandidate = handleICECandidateEvent;
      // pc.ontrack = handleTrackEvent
      // pc.onnegotiationneeded = handleNegotiationNeededEvent;
      // // pc.onremovetrack = handleRemoveTrackEvent;
      // pc.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
      // pc.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
      // pc.onsignalingstatechange = handleSignalingStateChangeEvent;

      myStream.getTracks().forEach((track) => pc.addTrack(track, myStream));

      await pc.setRemoteDescription(parsedJSON.offer).then(() => {
        console.log(Date.now(), '*********Remote Description Set*********', pc);
        pcMap.set(parsedJSON.from, pc);
      });
      const answer = await pc.createAnswer();
      pc.setLocalDescription(answer);
      socket.emit('answer', JSON.stringify({ answer: answer, to: parsedJSON.from }));
    });

    socket.on('ice-candidate', async (data) => {
      const parsedJSON = JSON.parse(data);
      const pc = pcMap.get(parsedJSON.from);
      console.log('***********ICE CANDIDATE***********', parsedJSON.candidate, Date.now());
      if (pc?.iceConnectionState) {
        await pc.addIceCandidate(parsedJSON.candidate);

        // pc.onsignalingstatechange = (event) => {
        //   console.log('Signaling State:', pc.signalingState);
        // }
        // if (pc.signalingState === 'stable') {

        // }
      } else {
        console.log('Just recieved unknow icec');
      }
    });
  };

  return frontendEnabled  ? (
    <>
    <h1
    className='font-bold text-3xl ml-20'>Google Maps Preview (Moderated)</h1>
      <div className='totalflyawaycont'>
        <div className='bg-white text-black min-h-screen flex justify-start items-center mainflyawaycont ml-20'>
        {/* <Navbar /> */}
        <div className='flex flex-col items-center'>
          {/* <Separator /> */}
          <div className='all-vid '>
            <div className='vid-1-2'>
          <video  
            ref={videoRef} 
            className={`w-full h-full object-cover flex-1 vids`} 
            autoPlay
            muted
          ></video>
          <video
            ref={remoteVideoRefs1}
            className='w-0 h-0 object-cover flex-1 vids'
            autoPlay
            // muted
          ></video>
          </div>
          <div className="vid-3-4">
          <video
            ref={remoteVideoRefs2}
            className='w-0 h-0 object-cover flex-1 vids'
            autoPlay
            // muted
          ></video>
          <video
            ref={remoteVideoRefs3}
            className='w-0 h-0 object-cover flex-1 vids'
            autoPlay
            // muted
          ></video>
          </div>
          <video
            ref={remoteVideoRefs4}
            className='w-0 h-0 object-cover flex-1 vids'
            autoPlay
            // muted
          ></video>
          </div>
          {/* <div className='mt-4'>
            {usersInMeet.map((user, index) => (
              <div key={index} className='font-bold text-xl mb-2'>
                {user}
              </div>
            ))}
          </div> */}

      
          <div className="task-panel-heading mt-10">
            <p onClick={() => console.log(usersInMeet)}>Tasks Panel</p>
          <div className='Tasks-Panel'>
          <div className='m-2'>
            <label htmlFor='meetingLink' className='block text-sm font-medium'>
              Enter Meeting Link:
            </label>
            <input
              id='meetingLink'
              name='meetingLink'
              type='text'
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              className='mt-1 p-2 w-full rounded border border-gray-600 text-black meet_link'
            />
          </div>
          <button onClick={joinCall} className='bg-blue-800 m-2 text-white px-4 mr-2 rounded'>
            Join Call
          </button>
          <button onClick={startCall} className='bg-black text-white px-4 py-2 mr-2 m-2 rounded'>
            Start Call 
          </button>
          </div>
          </div>
        </div>
        </div>
        <div className="task-list">
        <TaskList/>
        </div>
      </div>
    </>
  ): <p>Your are sharing your screen</p>;
}; 

export default RoomCallPage;
