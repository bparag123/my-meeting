import { useMeetingManager } from "amazon-chime-sdk-component-library-react";
import { useRef, useEffect, useState } from "react";
import { Controlls } from "./controlls";
import MeetingView from "./meeting.js";
import setupMeeting from "../utils/setupMeeting";
import { useParams } from "react-router-dom";
import "./../layout/createMeeting.scss";

// import WhiteBoard from './components/whiteBoard';

function JoinMeeting() {
  const { meetingId } = useParams();
  const meetingManager = useMeetingManager();
  const audioEle = useRef(null);
  const nameRef = useRef(null);
  const [audioDev, setAudioDev] = useState("");
  const [showWhiteBoard, setShowWhiteBoard] = useState(false);
  const [showParticipants, setParticipants] = useState(true);
  const [showChat, setChat] = useState(false);
  const [joined, setIsJoined] = useState(false);

  meetingManager.subscribeToEventDidReceive((name, attribiutes) => {
    switch (name) {
      case "meetingStartSucceeded":
        setIsJoined((_) => true);
        break;
      case "meetingEnded":
        setIsJoined((_) => false);
        break;
      default:
        console.log("Default");
    }
    console.log(name, attribiutes);
  });

  useEffect(() => {
    setAudioDev((_) => audioEle.current);
  }, [audioEle, meetingManager]);
  const joinMeeting = async () => {
    const joinUrl = `https://iaz55f28ph.execute-api.us-east-1.amazonaws.com/dev/meetings/joinMeeting?meetingId=${meetingId}&externalUserId=${nameRef.current.value}`;

    const response = await fetch(joinUrl);

    const data = await response.json();
    setupMeeting({
      meeting: data.Meeting,
      attendee: data.Attendee,
      meetingManager,
      audioDev,
      setShowWhiteBoard,
      setParticipants,
    });
    setIsJoined((_) => true);
  };

  return (
    <div className="main-wrapper">
      {joined ? (
        ""
      ) : (
        <>
          <div className="create-wrapper">
            <h2>Join Meeting</h2>
            <div className="form-grp">
              <label htmlFor="name">Meeting ID or Personal Link Name</label>
              <input id="name" type="text" className="h-40" ref={nameRef} placeholder="Enter Meeting ID or Personal Link Name"></input>
            </div>
            <button onClick={joinMeeting} className="btn-primary h-40 w-100">
              Join
            </button>
          </div>
        </>
      )}
      <audio style={{ display: "none" }} ref={audioEle}></audio>

      <MeetingView
        meetingManager={meetingManager}
        showWhiteBoard={showWhiteBoard}
        setShowWhiteBoard={setShowWhiteBoard}
        showParticipants={showParticipants}
        setParticipants={setParticipants}
        setChat={setChat}
        showChat={showChat}
      >
        <Controlls
          meetingManager={meetingManager}
          showWhiteBoard={showWhiteBoard}
          setShowWhiteBoard={setShowWhiteBoard}
          showParticipants={showParticipants}
          setParticipants={setParticipants}
          setChat={setChat}
          showChat={showChat}
        />

      </MeetingView>
    </div>
  );
}

export default JoinMeeting;
