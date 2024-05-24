// implement Signalling state checks
import { useRef, useState, useEffect } from 'react';
import io from 'socket.io-client';
import TaskList from '@/components/TaskList';
import './index.scss';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { resolve } from 'path';

const peerConfiguration = {
  iceServers: [
    {
      urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'],
    },
  ],
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
};

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
  const data: Blob[] = [];
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
  const revolveRef = useRef(0);
  const [sources,setSources] = useState(0);
  const [timer, setTimer] = useState(0);

  const [activeSources, setActiveSources] = useState([]);

  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive]);

  const formatTime = (time) => {
    const minutes = String(Math.floor(time / 60)).padStart(2, '0');
    const seconds = String(time % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleStart = () => {
    setIsActive(true);
  };

  const handleStopAndReset = () => {
    setIsActive(false);
    setTime(0);
  };

  const drawToCanvas = (videoIds) => {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Calculate the number of rows and columns for the grid
    let numRows = 1;
    let numCols = 1;
    if (remoteVideoRefs3.current?.srcObject != null) {
      if(sources !== 4){setSources(4);}
      videoIds = ['video1', 'video2', 'video3', 'video4'];
      numRows = 2;
      numCols = 2;
    } else if (remoteVideoRefs2.current.srcObject != null) {
      if(sources !== 3){setSources(3);}
      switch (revolveRef.current % 3) {
        case 0:
          videoIds = ['video1', 'video2', 'video3'];
          break;
        case 1:
          videoIds = ['video3', 'video1', 'video2'];
          break;
        case 2:
          videoIds = ['video2', 'video3', 'video1'];
          break;
      }

      numRows = 2;
      numCols = 2;
    } else if (remoteVideoRefs1.current.srcObject != null) {
      if(sources !== 2){setSources(2);}
      videoIds = ['video1', 'video2'];
      numRows = 1;
      numCols = 2;
    }
    // Get the video elements
    const videos = videoIds.map((id) => document.getElementById(id)).filter((video) => video);
    // If no valid video elements are found, return
    if (videos.length === 0) return;

    // Calculate the width and height for each grid cell
    let cellWidth =  (0.55 * (window.screen.width)) / Math.max(numCols, numRows);
    let cellHeight = (0.39 * (window.screen.width)) / Math.max(numCols, numRows); 
    console.log(videos[0].videoHeight);
    // Set the canvas size to accommodate the grid
    canvas.width = cellWidth * numCols;
    canvas.height = cellHeight * numRows;

    // Draw each video in its respective grid cell
    videos.forEach((video, index) => {
      const row = Math.floor(index / numCols);
      const col = index % numCols;
      const x = col * cellWidth;
      const y = row * cellHeight;

      context.drawImage(video, x, y, cellWidth, cellHeight);
    });

    requestAnimationFrame(() => drawToCanvas(videoIds));
  };

  const startCall = async () => {
    const myStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (videoRef.current) {
      videoRef.current.srcObject = myStream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
        handleSources(1);
        requestAnimationFrame(() => drawToCanvas(['video1'])); // Start drawing video to canvas here
      };
    }
    socket.emit('start-call', meetingLink);

    socket.on('offer', async (data) => {
      const parsedJSON = JSON.parse(data);
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
        const remoteStream = new MediaStream();
        remoteStream.addTrack(event.track);
        setUsersInMeet(users);
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

    socket.emit('join-room', meetingLink);
    socket.on('room-participants', async (participants) => {
      const parsedJson = JSON.parse(participants);
      parsedJson.userIds = parsedJson.userIds.filter((id: string) => id !== socket.id);
      for (let i = 0; i < parsedJson.userIds.length; i++) {
        if (!users.includes(parsedJson.userIds[i]) && parsedJson.userIds[i] !== socket.id) {
          const pc = new RTCPeerConnection(peerConfiguration);
          users.push(parsedJson.userIds[i]);
          pc.ontrack = (event) => {
            const remoteStream = new MediaStream();
            remoteStream.addTrack(event.track);
            handleSources(-1);
            if (i + 1 === 1) {
              remoteVideoRefs1.current.srcObject = remoteStream;
              remoteVideoRefs1.current.play();
            } else if (i + 1 === 2) {
              remoteVideoRefs2.current.srcObject = remoteStream;
              remoteVideoRefs2.current.play();
            } else if (i + 1 === 3) {
              remoteVideoRefs3.current.srcObject = remoteStream;
              remoteVideoRefs3.current.play();
            } else if (i + 1 === 4) {
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
            const parsedAnswer = JSON.parse(answer);
            await pc.setRemoteDescription(parsedAnswer.answer).then(() => {
              socket.on('ice-candidate', async (candidate) => {
                const parsedCandidate = JSON.parse(candidate);
                await pc.addIceCandidate(parsedCandidate.candidate);
              });
            });
          });
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
        console.log('ontrack', new Date().getTime(), event, event.track);
        console.log(users);

        const remoteStream = new MediaStream();
        remoteStream.addTrack(event.track);
        console.log(users.length);

        if (users.length === 1) {
          setsrc1(users[1]);
          remoteVideoRefs1.current.srcObject = remoteStream;
          remoteVideoRefs1.current.play();
        } else if (users.length === 2) {
          setsrc2(users[2]);

          remoteVideoRefs2.current.srcObject = remoteStream;
          remoteVideoRefs2.current.play();
        } else if (users.length === 3) {
          setsrc3(users[3]);
          remoteVideoRefs3.current.srcObject = remoteStream;
          remoteVideoRefs3.current.play();
        } else if (users.length === 4) {
          setsrc4(users[4]);

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
        console.log('Just recieved unknow icec');
      }
    });
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

  const handleSources = (count) => {
    if(count==-1){
      setSources(sources+1);
    }
    else{
      setSources(count);
    }
  };

  const handleRevolve = () => {
    revolveRef.current += 1;
  };

  return frontendEnabled ? (
    <>
      <h1 className='font-bold text-3xl ml-20 pt-2 pb-2'>Google Maps Preview (Moderated)</h1>
      <div className='totalflyawaycont'>
        <div className='bg-white text-black min-h-screen flex justify-start items-center mainflyawaycont ml-20'>
          {/* <Navbar /> */}
          <div className={`flex flex-col items-center video-total ${sources===0 ? 'video-total-no-source': 'video-total-with-source'}`}>
            {/* <Separator /> */}
            <div className='video-container'>
              <div className='recording-panel'>
                <div className='recording-content'>
                  <div className='recording-content-1'>
                    {isRecording ? <p>Recording...</p> : <p>Not Recording...</p>}
                  </div>
                  <div className='recording-content-2'>
                    <p>
                    {
                      sources
                    }  
                    &nbsp;Sources</p>
                  </div>
                </div>
                <div className={`rec-timer ${!isRecording && 'rec-timer-disabled'}`}>
                  <h1>{formatTime(time)}</h1>
                </div>
              </div>
              <div className='all-vid '>
                <canvas id='canvas' ref={canvasRef}>
                  <video
                    id='video1'
                    ref={videoRef}
                    className={`w-full h-full object-cover flex-1 vids`}
                    autoPlay
                    muted
                  ></video>
                  <video
                    id='video2'
                    ref={remoteVideoRefs1}
                    className='w-0 h-0 object-cover flex-1 vids'
                    autoPlay
                    // muted
                  ></video>
                  <video
                    id='video3'
                    ref={remoteVideoRefs2}
                    className='w-full h-0 object-cover flex-1 vids'
                    autoPlay
                    // muted
                  ></video>
                  <video
                    id='video4'
                    ref={remoteVideoRefs3}
                    className='w-0 h-0 object-cover flex-1 vids'
                    autoPlay
                    // muted
                  ></video>
                  <video
                    id='video5'
                    ref={remoteVideoRefs4}
                    className='w-0 h-0 object-cover flex-1 vids'
                    autoPlay
                    // muted
                  ></video>
                </canvas>
              </div>
            </div>
            <div className='task-panel-heading mt-10'>
              <p>Tasks Panel</p>
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
                <button
                  onClick={startCall}
                  className='bg-black text-white px-4 py-2 mr-2 m-2 rounded'
                >
                  Start Call
                </button>
              </div>
              <div className="more-controls">
            <DropdownMenu>
              <div
                className='bg-blue-400 m-3 p-2 rounded-sm'
                onClick={() => console.log('ggggggggggggggggggggg')}
              >
                <DropdownMenuTrigger>Add Sources</DropdownMenuTrigger>
              </div>
              <DropdownMenuContent>
                <DropdownMenuLabel>Available Sources</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {usersInMeet.map((user, index) => (
                  <DropdownMenuItem
                    onClick={() => setActiveSources([...activeSources, user.substring(0, 5)])}
                    key={index}
                  >
                    {user}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {activeSources.map((item, index) => (
                <div key={index} className='text-black p-4 rounded shadow'>
                  {item}
                </div>
              ))}
            </div>
            {/* <Label htmlFor='email'>Your email address</Label> */}

            <button
              onClick={()=>{startRecording(); handleStart();}}
              disabled={isRecording}
              className='bg-blue-500 p-2 rounded-md mr-2'
            >
              Start Recording
            </button>
            <button
              onClick={()=>{stopRecording(); handleStopAndReset();}}
              disabled={!isRecording}
              className='bg-blue-500 p-2 rounded-md mr-2'
            >
              Stop Recording
            </button>
            <button disabled={downloadLink!=undefined} className='bg-blue-500 p-2 rounded-md mr-2'>
               {downloadLink ? <a href="" download='canvasRecording.webm'>Download</a> : <div>Download</div>}
            </button>
            <button onClick={handleRevolve} className='bg-blue-500 p-2 rounded-md'>
              Revolve
            </button>
            </div>
            </div>

          </div>
          <div></div>
        </div>
        <div className='vertical-line'></div>
        <div className='task-list'>
          <TaskList />
        </div>
      </div>
    </>
  ) : (
    <p>Your are sharing your screen</p>
  );
};

export default RoomCallPage;
