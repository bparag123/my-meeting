import { MeetingSessionConfiguration } from "amazon-chime-sdk-js";
import setupWhiteboard from "./setupWhiteboard";
// import configureMessagingSession from '../utils/MessagingSession'

const setupMeeting = async ({ meeting, attendee, meetingManager, audioDev, setShowWhiteBoard, setParticipants, MemberArn, ChannelArn }) => {

    // Use the join API to create a meeting session using the MeetingSessionConfiguration
    const meetingSessionConfiguration = new MeetingSessionConfiguration(meeting, attendee);

    // const messagingSession = await configureMessagingSession(MemberArn)
    // await messagingSession.start()
    await meetingManager.join(
        meetingSessionConfiguration
    );


    //Configuration of device for attending Meeting
    meetingManager.audioVideo.setDeviceLabelTrigger(async () =>
        await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    );
    const audioInputDevices = await meetingManager.audioVideo.listAudioInputDevices();
    const audioOutputDevices = await meetingManager.audioVideo.listAudioOutputDevices();
    const videoInputDevices = await meetingManager.audioVideo.listVideoInputDevices();
    console.log("My Video", videoInputDevices)
    console.log("My Audio Input", audioInputDevices)
    console.log("My Audio Output", audioOutputDevices)

    await meetingManager.audioVideo.startAudioInput(audioInputDevices[0]);
    await meetingManager.audioVideo.chooseAudioOutput(audioOutputDevices[0].deviceId);
    await meetingManager.audioVideo.startVideoInput(videoInputDevices[0]);
    await meetingManager.audioVideo.bindAudioElement(audioDev)

    const observer = {
        audioVideoDidStart: () => {
            console.log("didStart")
            //Start our local user video
            // meetingManager.audioVideo.startLocalVideoTile();
            // meetingManager.audioVideo.bindVideoElement(localTileId, videoDev);
        },

        videoTileDidUpdate: tile => {
            //Here i need to update the video element 
            console.log(tile)
            // meetingManager.audioVideo.bindVideoElement(tile.tileId, tile.boundVideoElement)
        }
    }

    meetingManager.audioVideo.realtimeSubscribeToReceiveDataMessage("showWhiteboard", (data) => {
        const incomingData = data.json()
        if (incomingData.roomId) {
            setParticipants(_ => false)
            setupWhiteboard(incomingData.roomId, attendee.ExternalUserId)
        }
        setShowWhiteBoard(_ => incomingData.display)
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

export default setupMeeting