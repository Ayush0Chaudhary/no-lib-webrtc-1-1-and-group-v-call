// implement Signalling state checks
import { useRef, useState, useEffect } from 'react';
import io from 'socket.io-client';
import TaskList from '@/components/TaskList';
import "./index.scss";
import {fabric} from 'fabric';

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
  const canvasRef = useRef(null);
  const data:Blob[] = [];
  let recordee: MediaRecorder;

  const [frontendEnabled, setFrontedEnabled] = useState(true);
  const [src1, setsrc1] = useState('');
  const [src2, setsrc2] = useState('');
  const [src3, setsrc3] = useState('');
  const users: string[] = [];
  const pcMap = new Map<string, RTCPeerConnection>();
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [downloadLink, setDownloadLink] = useState('');
  // const [myStream, setMyStream] = useState<MediaStream>();

  // useEffect(() => {
  //   console.log(users);
  //   if (videoRef.current) {
  //     console.log('idhar useffect mei control pahuch gya hai');
  //     videoRef.current.className = `w-full h-full object-cover flex-1 ${users.length > 1 ? 'half-width' : ''}`;
  //   }
  // }, [videoRef]);

  

  // const canvas = new fabric.Canvas(canvasRef.current);

  const [shouldDraw,setShouldDraw] = useState(true);
  
  const drawToCanvas = (videoIds) => {
    // console.log(remoteVideoRefs1.srcPbject==null);
    if (!shouldDraw) return;
    const canvas = document.getElementById('canvas');
    if (!canvas) return;
  
    const context = canvas.getContext('2d');
    if (!context) return;
  
    // Calculate the number of rows and columns for the grid
    let numRows = 1;
    let numCols = 1;
    if(remoteVideoRefs3.current.srcObject != null) {
      videoIds=['video1','video2','video3','video4'];
      numRows=2;
      numCols=2;
  }
    else if(remoteVideoRefs2.current.srcObject != null) {
        videoIds=['video1','video2','video3'];
        numRows=2;
        numCols=2;
    }
    else if(remoteVideoRefs1.current.srcObject != null) {
        videoIds=['video1','video2'];
        numRows=1;
        numCols=2;
    }
    // Get the video elements
    const videos = videoIds.map(id => document.getElementById(id)).filter(video => video);
  // console.log(videoIds);
    // If no valid video elements are found, return
    if (videos.length === 0) return;
  
    // Calculate the width and height for each grid cell
    let cellWidth = videos[0].videoWidth/Math.max(numCols,numRows);
    let cellHeight = videos[0].videoHeight/Math.max(numCols,numRows);
  
    // Set the canvas size to accommodate the grid
    canvas.width = cellWidth * numCols;
    canvas.height = cellHeight * numRows;
  
    // Draw each video in its respective grid cell
    videos.forEach((video, index) => {
      // console.log(video);
      const row = Math.floor(index / numCols);
      const col = index % numCols; 
      const x = col * cellWidth;
      const y = row * cellHeight;
  
      context.drawImage(video, x, y, cellWidth, cellHeight);
    });
  
    // Request the next animation frame
    requestAnimationFrame(() => drawToCanvas(videoIds));
  };
  
  
  const startCall = async () => {
    const myStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (videoRef.current) {
      videoRef.current.srcObject = myStream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
        requestAnimationFrame(() => drawToCanvas(['video1'])); // Start drawing video to canvas here
      };
    }
    socket.emit('start-call', meetingLink);
  
    socket.on('offer', async (data) => {
      const parsedJSON = JSON.parse(data);
      // console.log(parsedJSON, 'parsedJson Offer');
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
        // console.log('ontrack', new Date().getTime(), event, event.track);
        // console.log(users);
  
        const remoteStream = new MediaStream();
        remoteStream.addTrack(event.track);
        // console.log(users.length);
        setUsersInMeet(users);
        // console.log(users, "dddddddddddddddddddddddddd");
  
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
      } else {
        console.log('Just received unknown icec');
      }
    });
  };
  

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
            // console.log(event);
            // console.log((i+1),'ontrackkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk');
            // console.log(pc, 'here', Date.now());
            // console.log(users);
            const remoteStream = new MediaStream();
            remoteStream.addTrack(event.track);
            if ((i+1) === 1) {
              remoteVideoRefs1.current.srcObject = remoteStream;
              remoteVideoRefs1.current.play();

            } else if ((i+1) === 2) {
              remoteVideoRefs2.current.srcObject = remoteStream;
              remoteVideoRefs2.current.play();
                
            } else if ((i+1) === 3) {
              remoteVideoRefs3.current.srcObject = remoteStream;
              remoteVideoRefs3.current.play();
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
            
            remoteVideoRefs1.current.play();
            // setShouldDraw(false); // Stop the current drawing loop
            // setTimeout(() => {
            //   console.log('stop here2');
            //   setShouldDraw(true); 
            //   requestAnimationFrame(() => drawToCanvas(['video1','video2'])); // Start a new drawing loop with new video sources
            // }, 100);  // Start drawing video to canvas here
          
          // console.log('hello');
          videoRef.current.className = `w-1/2 h object-cover flex-1 vids`;
          remoteVideoRefs1.current.className = `w-1/2 h object-cover flex-1 vids`; 
        } else if (users.length === 2) {
          setsrc2(users[2]);

          remoteVideoRefs2.current.srcObject = remoteStream;
          remoteVideoRefs2.current.play();
          videoRef.current.className = `w-1/2 h-1/2 object-cover flex-1 vids`;
          remoteVideoRefs1.current.className = `w-1/2 h-1/2 object-cover flex-1 vids`;
          remoteVideoRefs2.current.className = `w-1/2 h-1/2 object-cover flex-1 vids`; 
          remoteVideoRefs3.current.className = `w-1/2 h-1/2 object-cover flex-1 vids`; 
          
        } else if (users.length === 3) {
          setsrc3(users[3]);

          remoteVideoRefs3.current.srcObject = remoteStream;
          remoteVideoRefs3.current.play();
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


  const startRecording = () => {
    const canvas = canvasRef.current;
    const stream = canvas.captureStream(30); // 30 fps
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    recordee = recorder;
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks((prev) => [...prev, event.data]); 
        data.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(data, { type: 'video/webm' });
      data.length = 0;
      const url = URL.createObjectURL(blob);
      setDownloadLink(url);
    };

    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
  };

  const stopRecording = () => {
    const canvas = canvasRef.current;
    const stream = canvas.captureStream(30);
    stream.getTracks().forEach((track) => track.stop());
    mediaRecorder.stop();
    setIsRecording(false);
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
            <canvas id="canvas" ref={canvasRef}>
            <video  
            id="video1"
            ref={videoRef} 
            className={`w-full h-full object-cover flex-1 vids`} 
            autoPlay
            muted
          ></video>
          <video
            id="video2"
            ref={remoteVideoRefs1}
            className='w-0 h-0 object-cover flex-1 vids'
            autoPlay
            // muted
          ></video>
          <video
            id="video3"
            ref={remoteVideoRefs2}
            className='w-full h-0 object-cover flex-1 vids'
            autoPlay
            // muted
          ></video>
          <video
            id="video4"
            ref={remoteVideoRefs3}
            className='w-0 h-0 object-cover flex-1 vids'
            autoPlay
            // muted
          ></video>
          <video
            id="video5"
            ref={remoteVideoRefs4}
            className='w-0 h-0 object-cover flex-1 vids'
            autoPlay
            // muted
          ></video>
</canvas> 
          
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
          <div>
        <button onClick={startRecording} disabled={isRecording}>Start Recording</button>
        <button onClick={stopRecording} disabled={!isRecording}>Stop Recording</button>
        {downloadLink && <a href={downloadLink} download="canvasRecording.webm">Download</a>}
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
