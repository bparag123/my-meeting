
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
    Laptop
} from 'amazon-chime-sdk-component-library-react';
import { useState } from 'react';
import axios from 'axios';

export const Controlls = ({ meetingManager, showWhiteBoard, setShowWhiteBoard }) => {
    //Different states to handle the behaviour
    const [muted, setMuted] = useState(false);
    const [screenShared, setScreenShared] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [pauseContentShare, setPauseContentShare] = useState(false);
    const { isVideoEnabled, setIsVideoEnabled } = useLocalVideo()
    const [MediaPipelineId, setMediaPipelineId] = useState("")
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
            const response = await axios.delete(`
            https://iaz55f28ph.execute-api.us-east-1.amazonaws.com/dev/meetings/${meetingManager.meetingId}`)
            // console.log(`https://avuqgrvsd8.execute-api.us-east-1.amazonaws.com/meetings/${meetingManager.meetingId}`)
            // const response = await fetch(`https://avuqgrvsd8.execute-api.us-east-1.amazonaws.com/meetings/${meetingManager.meetingId}`, {
            //     method: 'DELETE'
            // });
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
            console.log('Screen button clicked');

            if (!screenShared) {
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
        onClick: () => {
            console.log("Inside Controller", showWhiteBoard)
            meetingManager.audioVideo.realtimeSendDataMessage('showWhiteboard', !showWhiteBoard)
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

    return (
        <ControlBar showLabels layout="bottom">
            <ControlBarButton {...microphoneButtonProps} />
            <ControlBarButton {...cameraButtonProps} />
            <ControlBarButton {...whiteBoardProps} />
            <ControlBarButton {...screenShareButtonProps} />
            <ControlBarButton {...hangUpButtonProps} />
            <ControlBarButton {...leaveMeetingButtonProps} />
            <ControlBarButton {...startRecordingProps} />
            {screenShared && <ControlBarButton {...pauseButtonProps} />}
        </ControlBar>
    );
}