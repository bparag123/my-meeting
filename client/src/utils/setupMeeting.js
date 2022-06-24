import { MeetingSessionConfiguration } from "amazon-chime-sdk-js";
import { toast } from "react-toastify";

const setupMeeting = async ({ meeting, attendee, meetingManager, audioDev, setShowWhiteBoard }) => {

    const meetingSessionConfiguration = new MeetingSessionConfiguration(meeting, attendee);
    // Use the join API to create a meeting session using the MeetingSessionConfiguration

    await meetingManager.join(
        meetingSessionConfiguration
    );
    //Configuration of device for attending Meeting
    meetingManager.audioVideo.setDeviceLabelTrigger(async () =>
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
    );
    const audioInputDevices = await meetingManager.audioVideo.listAudioInputDevices();
    const audioOutputDevices = await meetingManager.audioVideo.listAudioOutputDevices();
    const videoInputDevices = await meetingManager.audioVideo.listVideoInputDevices();

    await meetingManager.audioVideo.startAudioInput(audioInputDevices[2]);
    await meetingManager.audioVideo.chooseAudioOutput(audioOutputDevices[2]);
    await meetingManager.audioVideo.startVideoInput(videoInputDevices[0]);
    await meetingManager.audioVideo.bindAudioElement(audioDev)


    const observer = {
        audioVideoDidStart: () => {
            console.log("didStart")
            //Start our local user video
            meetingManager.audioVideo.startLocalVideoTile();
            // meetingManager.audioVideo.bindVideoElement(localTileId, videoDev);
        },

        videoTileDidUpdate: tile => {
            //Here i need to update the video element 
            console.log(tile)
            // meetingManager.audioVideo.bindVideoElement(tile.tileId, tile.boundVideoElement)
        }
    }

    meetingManager.audioVideo.realtimeSubscribeToReceiveDataMessage("showWhiteboard", (data) => {
        setShowWhiteBoard(_ => data.json())
    })
    //Binding the Observer
    meetingManager.audioVideo.addObserver(observer)

    // meetingManager.audioVideo.realtimeSubscribeToReceiveDataMessage('newAttendee', (data) => {
    //     // toast()
    //     console.log(data.json())
    // })

    //starting transcription
    const transcriptEventHandler = (transcriptEvent) => {
        console.log(transcriptEvent)
    }
    meetingManager.audioVideo.transcriptionController.subscribeToTranscriptEvent(transcriptEventHandler)

    // Start the session to join the meeting

    await meetingManager.start();
}

export default setupMeeting