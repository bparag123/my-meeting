import { ContentShare, LocalVideo, RemoteVideo, useAudioInputs, useAudioOutputs, useBackgroundBlur, useRemoteVideoTileState, useSelectVideoQuality, useVideoInputs, VideoGrid } from 'amazon-chime-sdk-component-library-react';
import { useEffect, useState } from 'react';
import classes from './meeting.module.css'
import Participants from './roster';
import { isVideoTransformDevice } from 'amazon-chime-sdk-js';

const MeetingView = ({ children, meetingManager, showWhiteBoard, showParticipants, setParticipants }) => {
    const audioInput = useAudioInputs();
    const audioOutput = useAudioOutputs();
    const { devices, selectedDevice } = useVideoInputs();
    const selectQuality = useSelectVideoQuality();
    const { isBackgroundBlurSupported, createBackgroundBlurDevice } =
        useBackgroundBlur();
    const [isVideoTransformCheckBoxOn, setisVideoTransformCheckBoxOn] =
        useState(false);

    //Getting all the remote attende tile state
    const { tiles, tileIdToAttendeeId } = useRemoteVideoTileState();
    // const roster = useRosterState();
    const [showControlls, setShowControlls] = useState(false)

    meetingManager.subscribeToEventDidReceive((name, attribiutes) => {
        switch (name) {
            case "meetingStartSucceeded":
                setShowControlls(_ => true)
                break;
            case "meetingEnded":
                setShowControlls(_ => false);
                break
            default:
                console.log("Default")
        }
        console.log(name, attribiutes)
    })

    let videos = [];

    if (meetingManager.audioVideo) {
        videos = tiles.map(tileId => {
            const attendeeId = tileIdToAttendeeId[tileId]
            //Getting the external user Id for the user
            const attendee = meetingManager.audioVideo.getRemoteVideoSources().find((ele) => {
                return ele.attendee.attendeeId === attendeeId
            })

            if (attendee) {
                return <RemoteVideo name={attendee.attendee.externalUserId} tileId={tileId} key={tileId} />
            } else {
                return ""
            }
        });
    }

    //Modifying Visibility of Whiteboard
    const x = document.querySelector('#comet-container');
    if (showWhiteBoard) {
        x.style["visibility"] = "visible";
    } else {
        x.style["visibility"] = "hidden";
    }

    const changeAudioInputs = async (e) => {
        await meetingManager.audioVideo.startAudioInput(audioInput.devices.find((ele) => {
            return ele.deviceId === e.target.value
        }))
    }

    const listOfAudioInputs = audioInput.devices.map((device) => {
        return <option value={device.deviceId}>{device.label}</option>
    })

    const changeAudioOutputs = async (e) => {
        await meetingManager.audioVideo.chooseAudioOutput(e.target.value)
    }

    const listOfAudioOutputs = audioOutput.devices.map((device) => {
        return <option value={device.deviceId}>{device.label}</option>
    })

    const changeVideoInputs = async (e) => {
        await meetingManager.audioVideo.startVideoInput(devices.find((ele) => {
            return ele.deviceId === e.target.value
        }))
    }

    const listOfVideoQualities = ["360p", "540p", "720p"].map((quality) => {
        return <option value={quality}>{quality}</option>
    })

    const selectVideoQuality = (e) => {
        selectQuality(e.target.value)
    }

    const listOfVideoInputs = devices.map((device) => {
        return <option value={device.deviceId}>{device.label}</option>
    })

    const onClick = () => {
        setisVideoTransformCheckBoxOn((current) => !current);
    };

    useEffect(() => {

        async function toggleBackgroundBlur() {
            try {
                let current = selectedDevice;
                if (isVideoTransformCheckBoxOn) {
                    current = await createBackgroundBlurDevice(selectedDevice);
                } else {
                    if (isVideoTransformDevice(selectedDevice)) {
                        current = await selectedDevice.intrinsicDevice();
                    }
                }
                await meetingManager.startVideoInputDevice(current);
            } catch (error) {
                // Handle device selection failure here
                console.error('Failed to toggle Background Blur');
            }
        }

        toggleBackgroundBlur();
    }, [isVideoTransformCheckBoxOn, meetingManager]);

    return (
        <>
            {showControlls ? <div>
                {isBackgroundBlurSupported && (
                    <button onClick={onClick}>
                        {isVideoTransformDevice(selectedDevice)
                            ? 'Background Normal'
                            : 'Background Blur'}
                    </button>
                )}
                <label htmlFor="video_quality">Video Quality</label>
                <select onChange={selectVideoQuality} name="video_quality" id="video_quality">
                    {listOfVideoQualities}
                </select>
                <label htmlFor="audio_inputs">Audio Input</label>
                <select onChange={changeAudioInputs} name="audio_inputs" id="audio_inputs">
                    {listOfAudioInputs}
                </select>
                <label htmlFor="audio_outputs">Audio Output</label>
                <select onChange={changeAudioOutputs} name="audio_outputs" id="audio_outputs">
                    {listOfAudioOutputs}
                </select>
                <label htmlFor="video_inputs">Video Input</label>
                <select onChange={changeVideoInputs} name="video_inputs" id="video_inputs">
                    {listOfVideoInputs}
                </select>
            </div> : ''}

            <div className={classes['mainLayout']}>
                <div className={showParticipants ? classes['showparticipants'] : classes['hideparticipants']}>
                    <Participants />
                </div>
                <div className={showWhiteBoard ? classes['disablemeetingPane'] : classes['meetingPane']}>
                    <div className={classes['contentShare']}>
                        <ContentShare />
                    </div>
                    <div className={classes['custom-grid']}>
                        <VideoGrid layout="standard">
                            <LocalVideo nameplate='Me' />
                            {/* Rendering the remote videos */}
                            {videos}
                        </VideoGrid>
                    </div>
                </div>
            </div>
            {showControlls && children}
        </>
    );
};

export default MeetingView