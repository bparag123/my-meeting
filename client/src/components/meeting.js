import { ContentShare, LocalVideo, RemoteVideo, useRemoteVideoTileState, VideoGrid } from 'amazon-chime-sdk-component-library-react';
import { useState } from 'react';
import classes from './meeting.module.css'
import Participants from './roster';

const MeetingView = ({ children, meetingManager, showWhiteBoard, showParticipants, setParticipants }) => {
    console.log(showParticipants)
    //Getting all the remote attende tile state
    const { tiles, tileIdToAttendeeId } = useRemoteVideoTileState();
    // const roster = useRosterState();
    const [showControlls, setShowControlls] = useState(false)

    meetingManager.subscribeToEventDidReceive((name, attribiutes) => {
        switch (name) {
            case "meetingStartSucceeded":
                setShowControlls(_ => true)
                break;
            default:
                console.log("Default")
        }
        console.log(name, attribiutes)
    })
    if (meetingManager.audioVideo) {
        console.log(meetingManager.audioVideo.getAllVideoTiles())
    }

    //Creating remote video elements for all the remote attendees
    const videos = tiles.map(tileId => {
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

    //Modifying Visibility of Whiteboard
    const x = document.querySelector('#comet-container');
    if (showWhiteBoard) {
        x.style["visibility"] = "visible";
    } else {
        x.style["visibility"] = "hidden";
    }

    return (
        <>
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