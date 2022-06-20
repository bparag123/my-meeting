
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
    useLocalVideo
} from 'amazon-chime-sdk-component-library-react';
import { useState } from 'react';

export const Controlls = ({ meetingManager }) => {
    //Different states to handle the behaviour
    const [muted, setMuted] = useState(false);
    const [screenShared, setScreenShared] = useState(false);
    const [pauseContentShare, setPauseContentShare] = useState(false);
    const { isVideoEnabled, setIsVideoEnabled } = useLocalVideo()

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
            const response = await fetch(`http://localhost:3000/meetings/${meetingManager.meetingId}`, {
                method: 'DELETE'
            });
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
        icon: screenShared ? <Clear /> : <ScreenShare />,
        onClick: () => {
            //setting up the realTimeMessage
            // meetingManager.audioVideo.realtimeSendDataMessage('Drawing', ["Hi", "Bye"])
        },
        label: 'White Board'
    }
    return (
        <ControlBar showLabels layout="bottom">
            <ControlBarButton {...microphoneButtonProps} />
            <ControlBarButton {...cameraButtonProps} />
            <ControlBarButton {...whiteBoardProps} />
            <ControlBarButton {...screenShareButtonProps} />
            <ControlBarButton {...hangUpButtonProps} />
            <ControlBarButton {...leaveMeetingButtonProps} />
            {screenShared && <ControlBarButton {...pauseButtonProps} />}
        </ControlBar>
    );
}