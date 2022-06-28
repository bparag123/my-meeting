
import {
    Camera,
    ControlBar,
    ControlBarButton,
    LeaveMeeting,
    Microphone,
    Phone,
    ScreenShare,
    Clear,
    Pause,
    Play,
    useLocalVideo,
    Record,
    Laptop,
    Attendees
} from 'amazon-chime-sdk-component-library-react';
import { useState } from 'react';
import axios from 'axios';
import setupWhiteboard from '../utils/setupWhiteboard';

export const Controlls = ({ meetingManager, showWhiteBoard, setShowWhiteBoard, showParticipants, setParticipants }) => {
    //Different states to handle the behaviour
    const [muted, setMuted] = useState(false);
    const [screenShared, setScreenShared] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [pauseContentShare, setPauseContentShare] = useState(false);
    const { isVideoEnabled, setIsVideoEnabled } = useLocalVideo()
    const [MediaPipelineId, setMediaPipelineId] = useState("")

    console.log(meetingManager);

    const microphoneButtonProps = {
        icon: muted ? <Microphone muted /> : <Microphone />,
        onClick: () => {
            setMuted(!muted);
            if (!muted) {
                meetingManager.audioVideo.realtimeMuteLocalAudio();
            } else {
                meetingManager.audioVideo.realtimeUnmuteLocalAudio();
            }
        },
        label: 'Mute'
    };

    const cameraButtonProps = {
        icon: isVideoEnabled ? <Camera /> : <Camera disabled />,
        onClick: async () => {
            if (isVideoEnabled) {
                setIsVideoEnabled(false)
            } else {
                setIsVideoEnabled(true)
            }
        },
        label: 'Camera'
    };

    const pauseButtonProps = {
        icon: pauseContentShare ? <Play /> : <Pause />,
        onClick: () => {
            console.log('Pause Button Clicked')
            if (!pauseContentShare) {
                setPauseContentShare(state => true)
                meetingManager.audioVideo.pauseContentShare()
            } else {
                setPauseContentShare(state => false)
                meetingManager.audioVideo.unpauseContentShare()
            }
        },
        label: 'Pause'
    };

    const hangUpButtonProps = {
        icon: <Phone />,
        onClick: async () => {
            setShowWhiteBoard(_ => false)
            const response = await axios.delete(`
            https://iaz55f28ph.execute-api.us-east-1.amazonaws.com/dev/meetings/${meetingManager.meetingId}`)
            console.log(response.status)
            if (response.status === 204) {
                console.log("Ending Meeting")
            }
        },
        label: 'End'
    };

    const leaveMeetingButtonProps = {
        icon: <LeaveMeeting />,
        onClick: async () => {
            setShowWhiteBoard(_ => false)
            meetingManager.audioVideo.stopLocalVideoTile()
            meetingManager.audioVideo.stop()
            meetingManager.leave()
            console.log("Leaving Meeting");
        },
        label: "Leave"
    }

    const screenShareButtonProps = {
        icon: screenShared ? <Clear /> : <ScreenShare />,
        onClick: () => {
            if (!screenShared) {
                setParticipants(_ => false)
                setScreenShared(state => true)
                meetingManager.audioVideo.startContentShareFromScreenCapture();
            } else {
                setScreenShared(state => false)
                meetingManager.audioVideo.stopContentShare();
            }
        },
        label: 'Share'
    };

    const whiteBoardProps = {
        icon: showWhiteBoard ? <Clear /> : <Laptop />,
        onClick: async () => {
            console.log(process.env.A)
            if (!showWhiteBoard) {
                setParticipants(_ => false)
                const headers = {
                    "Authorization": 'Bearer P6y4WbP76WrN8rB70A2aYH3AI0sYjQBJDUrdpx2i'
                }
                const whiteBoardResponse = await axios.post('https://hq.pixelpaper.io/api/board', {}, {
                    headers
                })
                setupWhiteboard(whiteBoardResponse.data.room_id, "Me")
                meetingManager.audioVideo.realtimeSendDataMessage('showWhiteboard', { display: !showWhiteBoard, roomId: whiteBoardResponse.data.room_id })
            } else {
                meetingManager.audioVideo.realtimeSendDataMessage('showWhiteboard', { display: !showWhiteBoard })
            }
            setShowWhiteBoard(_ => !showWhiteBoard)
        },
        label: 'White Board'
    }

    const startRecordingProps = {
        icon: isRecording ? <Clear /> : <Record />,
        onClick: async () => {
            if (isRecording) {
                await axios.get(`https://iaz55f28ph.execute-api.us-east-1.amazonaws.com/dev/meetings/stopRecording/${MediaPipelineId}`)
                setIsRecording(_ => false)
            } else {
                const data = await axios.get(`https://iaz55f28ph.execute-api.us-east-1.amazonaws.com/dev/meetings/startRecording/${meetingManager.meetingId}`)
                setIsRecording(_ => true)
                setMediaPipelineId(_ => data.data.MediaPipelineId)
            }
        },
        label: 'Record'
    }

    const showParticipantsProp = {
        icon: showParticipants ? <Clear /> : <Attendees />,
        onClick: () => {
            setParticipants(_ => !showParticipants)
        },
        label: 'Participants'
    }

    return (
        <ControlBar showLabels layout="bottom">
            <ControlBarButton {...microphoneButtonProps} />
            <ControlBarButton {...cameraButtonProps} />
            <ControlBarButton {...whiteBoardProps} />
            <ControlBarButton {...screenShareButtonProps} />
            <ControlBarButton {...hangUpButtonProps} />
            <ControlBarButton {...leaveMeetingButtonProps} />
            <ControlBarButton {...startRecordingProps} />
            <ControlBarButton {...showParticipantsProp} />
            {screenShared && <ControlBarButton {...pauseButtonProps} />}
        </ControlBar>
    );
}