import {
  useMeetingManager
} from 'amazon-chime-sdk-component-library-react';
import { useRef, useEffect, useState } from 'react';
import { Controlls } from './controlls';
import MeetingView from "./meeting.js";
import setupMeeting from '../utils/setupMeeting';
import { ToastContainer, toast } from 'react-toastify'
import Participants from './roster';

// import WhiteBoard from './components/whiteBoard';

function CreateMeeting() {
  const meetingManager = useMeetingManager();
  const audioEle = useRef(null);
  const videoEle = useRef(null);
  const nameRef = useRef(null);
  const meetingRef = useRef(null);
  const [audioDev, setAudioDev] = useState("");
  const [videoDev, setVideoDev] = useState("");
  const [showWhiteBoard, setShowWhiteBoard] = useState(false);
  const [invitationLink, setInvitationLink] = useState('')

  useEffect(() => {
    setAudioDev(_ => audioEle.current)
    setVideoDev(_ => videoEle.current)
  }, [audioEle, meetingManager])
  const joinMeeting = async () => {

    const createUrl = `https://iaz55f28ph.execute-api.us-east-1.amazonaws.com/dev/meetings?name=${nameRef.current.value}&meeting=${meetingRef.current.value}`

    const response = await fetch(createUrl, { method: 'POST' });

    const data = await response.json();
    console.log(data);
    setInvitationLink(_ => data.Meeting.MeetingId)
    setupMeeting({
      meeting: data.Meeting,
      attendee: data.Attendee,
      meetingManager,
      audioDev,
      setShowWhiteBoard
    })
  }

  return (
    <>
      <div>Create a New Meeting</div>
      <label htmlFor="name">Your Name</label>
      <input id="name" type="text" ref={nameRef}></input>
      <label htmlFor="meeting">Meeting Name</label>
      <input id="meeting" type="text" ref={meetingRef}></input>
      <button onClick={joinMeeting}>Create</button>
      <audio style={{ display: "none" }} ref={audioEle}></audio>
      {/* <a href={`http://localhost:3000/${invitationLink}`}>Invitation Link</a> */}
      {invitationLink !== "" && <button onClick={() => {
        navigator.clipboard.writeText(`http://localhost:3000/${invitationLink}`);
      }}>Copy Invitation Link</button>}


      <MeetingView meetingManager={meetingManager} showWhiteBoard={showWhiteBoard} setShowWhiteBoard={setShowWhiteBoard}>
        <Controlls meetingManager={meetingManager} showWhiteBoard={showWhiteBoard} setShowWhiteBoard={setShowWhiteBoard} />
      </MeetingView>
      {/* <Participants /> */}
      <ToastContainer />
    </>
  );
}

export default CreateMeeting;
