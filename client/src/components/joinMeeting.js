import {
    useMeetingManager
} from 'amazon-chime-sdk-component-library-react';
import { useRef, useEffect, useState } from 'react';
import { Controlls } from './controlls';
import MeetingView from "./meeting.js";
import setupMeeting from '../utils/setupMeeting';
import { useParams } from 'react-router-dom';
import Participants from './roster';

// import WhiteBoard from './components/whiteBoard';

function JoinMeeting() {
    const { meetingId } = useParams()
    const meetingManager = useMeetingManager();
    const audioEle = useRef(null);
    const videoEle = useRef(null);
    const nameRef = useRef(null);
    const [audioDev, setAudioDev] = useState("");
    const [videoDev, setVideoDev] = useState("");
    const [showWhiteBoard, setShowWhiteBoard] = useState(false);
    const [showParticipants, setParticipants] = useState(true);

    useEffect(() => {
        setAudioDev(_ => audioEle.current)
        setVideoDev(_ => videoEle.current)
    }, [audioEle, meetingManager])
    const joinMeeting = async () => {

        const joinUrl = `https://iaz55f28ph.execute-api.us-east-1.amazonaws.com/dev/meetings/joinMeeting?meetingId=${meetingId}&externalUserId=${nameRef.current.value}`

        const response = await fetch(joinUrl);

        const data = await response.json();
        console.log(data);
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
            <div>Join Meeting</div>
            <label htmlFor="name">Your Name</label>
            <input id="name" type="text" ref={nameRef}></input>
            <button onClick={joinMeeting}>Join</button>
            <audio style={{ display: "none" }} ref={audioEle}></audio>

            <MeetingView meetingManager={meetingManager} showWhiteBoard={showWhiteBoard} setShowWhiteBoard={setShowWhiteBoard} showParticipants={showParticipants} setParticipants={setParticipants}>
                <Controlls meetingManager={meetingManager} showWhiteBoard={showWhiteBoard} setShowWhiteBoard={setShowWhiteBoard} showParticipants={showParticipants} setParticipants={setParticipants} />
            </MeetingView>
        </>
    );
}

export default JoinMeeting;
