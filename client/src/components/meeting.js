import { ContentShare, LocalVideo, RemoteVideo, useContentShareState, useLocalVideo, useMeetingManager, useRemoteVideoTileState, VideoGrid, VideoTile } from 'amazon-chime-sdk-component-library-react';
import classes from './meeting.module.css'

const MeetingView = ({ children, meetingManager }) => {
    //Getting all the remote attende tile state
    const { tiles, tileIdToAttendeeId } = useRemoteVideoTileState();

    // const meetingManager = useMeetingManager()
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
        return <RemoteVideo name={attendee.attendee.externalUserId} tileId={tileId} key={tileId} />
    });

    return (
        <>
            <div className={classes['custom-grid']}>
                <VideoGrid layout="standard">
                    <LocalVideo nameplate='Me' />
                    {/* Rendering the remote videos */}
                    {videos}
                    {/* This component is for content sharing */}
                    <ContentShare />
                </VideoGrid>
            </div>
            {children}
        </>
    );
};

export default MeetingView