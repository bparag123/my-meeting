import {
  useMeetingManager
} from 'amazon-chime-sdk-component-library-react';
import { useRef, useEffect, useState } from 'react';
import { MeetingSessionConfiguration, Transcript, TranscriptEvent } from 'amazon-chime-sdk-js';
import { Controlls } from './components/controlls';
import MeetingView from "./components/meeting.js";

// import WhiteBoard from './components/whiteBoard';

function App() {
  const meetingManager = useMeetingManager();
  const audioEle = useRef(null);
  const videoEle = useRef(null);
  const nameRef = useRef(null);
  const meetingRef = useRef(null);
  const [audioDev, setAudioDev] = useState("");
  const [videoDev, setVideoDev] = useState("");
  const [showWhiteBoard, setShowWhiteBoard] = useState(false);

  useEffect(() => {
    setAudioDev(_ => audioEle.current)
    setVideoDev(_ => videoEle.current)
  }, [audioEle, meetingManager])
  const joinMeeting = async () => {
    // Fetch the meeting and attendee data from your server application
    const response = await fetch(`http://localhost:3000/meetings?name=${nameRef.current.value}&meeting=${meetingRef.current.value}`, {
      method: 'POST'
    });
    const data = await response.json();
    console.log(data);
    // Initalize the `MeetingSessionConfiguration`
    const meetingSessionConfiguration = new MeetingSessionConfiguration(data.Meeting, data.Attendee);
    // Use the join API to create a meeting session using the MeetingSessionConfiguration

    await meetingManager.join(
      meetingSessionConfiguration
    );
    //Configuration of device for attending Meeting
    meetingManager.audioVideo.setDeviceLabelTrigger(async () =>
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
    );
    const audioInputDevices = await meetingManager.audioVideo.listAudioInputDevices();
    const audioOutputDevices = await meetingManager.audioVideo.listAudioOutputDevices();
    const videoInputDevices = await meetingManager.audioVideo.listVideoInputDevices();

    await meetingManager.audioVideo.startAudioInput(audioInputDevices[2]);
    await meetingManager.audioVideo.chooseAudioOutput(audioOutputDevices[2]);
    await meetingManager.audioVideo.startVideoInput(videoInputDevices[0]);
    await meetingManager.audioVideo.bindAudioElement(audioDev)

    const observer = {
      audioVideoDidStart: () => {
        console.log("didStart")
        //Start our local user video
        meetingManager.audioVideo.startLocalVideoTile();
        // meetingManager.audioVideo.bindVideoElement(localTileId, videoDev);
      },

      videoTileDidUpdate: tile => {
        //Here i need to update the video element 
        console.log(tile)
        // meetingManager.audioVideo.bindVideoElement(tile.tileId, tile.boundVideoElement)
      }
    }

    meetingManager.audioVideo.realtimeSubscribeToReceiveDataMessage("showWhiteboard", (data) => {
      setShowWhiteBoard(_ => data.json())
    })
    //Binding the Observer
    meetingManager.audioVideo.addObserver(observer)

    //starting transcription
    const transcriptEventHandler = (transcriptEvent) => {
      console.log(transcriptEvent)
    }
    meetingManager.audioVideo.transcriptionController.subscribeToTranscriptEvent(transcriptEventHandler)

    // Start the session to join the meeting

    await meetingManager.start();
  }

  return (
    <>
      <label htmlFor="name">Your Name</label>
      <input id="name" type="text" ref={nameRef}></input>
      <label htmlFor="meeting">Meeting Id</label>
      <input id="meeting" type="text" ref={meetingRef}></input>
      <button onClick={joinMeeting}>Join</button>
      <audio style={{ display: "none" }} ref={audioEle}></audio>

      <MeetingView meetingManager={meetingManager} showWhiteBoard={showWhiteBoard} setShowWhiteBoard={setShowWhiteBoard}>
        <Controlls meetingManager={meetingManager} showWhiteBoard={showWhiteBoard} setShowWhiteBoard={setShowWhiteBoard} />
      </MeetingView>
    </>
  );
}

export default App;
