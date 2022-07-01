/* eslint-disable no-restricted-globals */
import {
  useMeetingManager
} from 'amazon-chime-sdk-component-library-react';
import { useRef, useEffect, useState } from 'react';
import { Controlls } from './controlls';
import MeetingView from "./meeting.js";
import setupMeeting from '../utils/setupMeeting';
import { ToastContainer } from 'react-toastify'

// import WhiteBoard from './components/whiteBoard';

function CreateMeeting() {
  const meetingManager = useMeetingManager();
  const audioEle = useRef(null);
  const nameRef = useRef(null);
  const meetingRef = useRef(null);
  const [audioDev, setAudioDev] = useState("");
  const [showWhiteBoard, setShowWhiteBoard] = useState(false);
  const [showParticipants, setParticipants] = useState(false);
  const [invitationLink, setInvitationLink] = useState('');

  meetingManager.subscribeToEventDidReceive((name, attribiutes) => {
    switch (name) {
      case "meetingStartSucceeded":
        setInvitationLink(_ => meetingManager.meetingId)
        break;
      case "meetingEnded":
        setInvitationLink(_ => '')
        break
      default:
        console.log("Default")
    }
    console.log(name, attribiutes)
  })

  useEffect(() => {
    setAudioDev(_ => audioEle.current)
  }, [audioEle, meetingManager])
  const joinMeeting = async () => {

    const createUrl = `https://iaz55f28ph.execute-api.us-east-1.amazonaws.com/dev/meetings?name=${nameRef.current.value}&meeting=${meetingRef.current.value}`

    const response = await fetch(createUrl, { method: 'POST' });
    const data = await response.json();
    setInvitationLink(_ => data.Meeting.MeetingId)
    setupMeeting({
      meeting: data.Meeting,
      attendee: data.Attendee,
      meetingManager,
      audioDev,
      setShowWhiteBoard,
      setParticipants
    })
  }

  return (
    <>
      {invitationLink === "" ? <>
        <div>Create a New Meeting</div>
        <label htmlFor="name">Your Name</label>
        <input id="name" type="text" ref={nameRef}></input>
        <label htmlFor="meeting">Meeting Name</label>
        <input id="meeting" type="text" ref={meetingRef}></input>
        <button onClick={joinMeeting}>Create</button>
      </> : ""}
      <audio style={{ display: "none" }} ref={audioEle}></audio>
      {invitationLink !== "" && <button onClick={() => {
        navigator.clipboard.writeText(`${location.href}#/${invitationLink}`);
      }}>Copy Invitation Link</button>}


      <MeetingView meetingManager={meetingManager} showWhiteBoard={showWhiteBoard} setShowWhiteBoard={setShowWhiteBoard} showParticipants={showParticipants} setParticipants={setParticipants}>
        <Controlls meetingManager={meetingManager} showWhiteBoard={showWhiteBoard} setShowWhiteBoard={setShowWhiteBoard} showParticipants={showParticipants} setParticipants={setParticipants} />
      </MeetingView>
      <ToastContainer />
    </>
  );
}

export default CreateMeeting;