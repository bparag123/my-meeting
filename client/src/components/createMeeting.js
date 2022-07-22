/* eslint-disable no-restricted-globals */
import { useMeetingManager } from "amazon-chime-sdk-component-library-react";
import { useRef, useEffect, useState } from "react";
import { Controlls } from "./controlls";
import MeetingView from "./meeting.js";
import setupMeeting from "../utils/setupMeeting";
import { ToastContainer } from "react-toastify";
import './../layout/createMeeting.scss';
import { ReactComponent as CopyIcon } from './../images/copy.svg';
import { useDispatch, useSelector } from 'react-redux'
import chatConfigSlice from "../store/slices/chatConfig";
import { useNavigate } from "react-router-dom";

function CreateMeeting() {
  const meetingManager = useMeetingManager();
  const audioEle = useRef(null);
  const nameRef = useRef(null);
  const meetingRef = useRef(null);
  const [audioDev, setAudioDev] = useState("");
  const [showWhiteBoard, setShowWhiteBoard] = useState(false);
  const [showParticipants, setParticipants] = useState(false);
  const [showChat, setChat] = useState(false);
  const [invitationLink, setInvitationLink] = useState("");
  const chatConfig = useSelector((state) => state.chatConfig)
  const dispatch = useDispatch()

  useEffect(() => {
    meetingManager.subscribeToEventDidReceive((name, attribiutes) => {
      switch (name) {
        case "meetingStartSucceeded":
          setInvitationLink((_) => meetingManager.meetingId);
          break;
        case "meetingEnded":
          setInvitationLink((_) => "");
          console.log("Ended ")
          break;
        default:
          console.log("Default");
      }
      console.log(name, attribiutes);
    });
  }, [])

  useEffect(() => {
    setAudioDev((_) => audioEle.current);
  }, [audioEle, meetingManager]);
  const joinMeeting = async () => {
    const createUrl = `https://iaz55f28ph.execute-api.us-east-1.amazonaws.com/dev/meetings?name=${nameRef.current.value}&meeting=${meetingRef.current.value}`;
    const response = await fetch(createUrl, { method: "POST" });
    const data = await response.json();
    console.log(data)

    dispatch(chatConfigSlice.actions.setUpChat({ channelArn: data.Channel.ChannelArn, memberArn: data.MemberARN }))

    setInvitationLink((_) => data.Meeting.MeetingId);
    setupMeeting({
      meeting: data.Meeting,
      attendee: data.Attendee,
      meetingManager,
      audioDev,
      setShowWhiteBoard,
      setParticipants,
      MemberArn: data.MemberARN,
      ChannelArn: data.Channel.ChannelArn
    });
  };

  return (
    <div className="main-wrapper">
      {invitationLink === "" ? (
        <div className="create-wrapper">
          <h2>Create a New Meeting</h2>
          <div className="form-grp">
            <label htmlFor="name">Your Name</label>
            <input
              id="name"
              type="text"
              className="h-40"
              placeholder="Enter Meeting ID or Personal Link Name"
              ref={nameRef}
            ></input>
          </div>
          <div className="form-grp">
            <label htmlFor="meeting">Meeting Name</label>
            <input
              id="meeting"
              type="text"
              className="h-40"
              placeholder="Enter Meeting Name"
              ref={meetingRef}
            ></input>
          </div>
          <button onClick={joinMeeting} className="btn-primary h-40 w-100">
            Create
          </button>
        </div>
      ) : (
        ""
      )}
      <audio style={{ display: "none" }} ref={audioEle}></audio>
      {invitationLink !== "" && (
        <button
          className="copyLinkbtn"
          title=" Copy Invitation Link"
          onClick={() => {
            // const joiningLink = "https://iaz55f28ph.execute-api.us-east-1.amazonaws.com/dev/meetings/joinMeeting?meetingId=76da9bfb-44e1-45e1-b0cb-fb46311e2713&chennalARN=arn:aws:chime:us-east-1:514342474989:app-instance/adfbab3a-4e8d-4b43-ad19-77c5fdaec567/channel/ff866143a0d596f9f17c7295f5566d47a693b356064f3c3a74587f6c7d4a7792&adminARN=arn:aws:chime:us-east-1:514342474989:app-instance/adfbab3a-4e8d-4b43-ad19-77c5fdaec567/user/safdsdfsd"
            navigator.clipboard.writeText(
              `${location.href}#/${invitationLink}?channelArn=${chatConfig.channelArn}&adminArn=${chatConfig.memberArn}`
            );
          }}
        >
          <CopyIcon />
        </button>
      )}
      <div className="mainMeeting">

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
        <ToastContainer />
      </div>
    </div>
  );
}

export default CreateMeeting;
