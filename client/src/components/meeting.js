import { ContentShare, LocalVideo, RemoteVideo, useRemoteVideoTileState, VideoGrid, useMeetingEvent } from 'amazon-chime-sdk-component-library-react';
import { useRef, useState } from 'react';
import classes from './meeting.module.css'
import Canvas from './whiteBoard';

const MeetingView = ({ children, meetingManager, showWhiteBoard }) => {
    //Getting all the remote attende tile state
    const { tiles, tileIdToAttendeeId } = useRemoteVideoTileState();
    const [showControlls, setShowControlls] = useState(false);
    const canvasRef = useRef(null);
    meetingManager.subscribeToEventDidReceive((name, attribiutes) => {
        switch (name) {
            case "meetingStartSucceeded":
                console.log("Started")
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

    // useEffect(() => {
    //     console.log(meetingManager.meetingStatus)
    // })

    //realTime Data Listener
    if (meetingManager.audioVideo) {
        meetingManager.audioVideo.realtimeSubscribeToReceiveDataMessage('Drawing', (data) => {
            canvasRef.current.loadPaths(data.json())
        })

        meetingManager.audioVideo.realtimeSubscribeToReceiveDataMessage('undoDrawing', (data) => {
            canvasRef.current.undo()
        })

        meetingManager.audioVideo.realtimeSubscribeToReceiveDataMessage('redoDrawing', (data) => {
            canvasRef.current.redo();
        })

        meetingManager.audioVideo.realtimeSubscribeToReceiveDataMessage('resetDrawing', (data) => {
            canvasRef.current.resetCanvas();
        })

        meetingManager.audioVideo.realtimeSubscribeToReceiveDataMessage('clearDrawing', (data) => {
            canvasRef.current.clearCanvas();
        })
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
            <div className={classes['whiteBoard']}>
                {showWhiteBoard ? <Canvas meetingManager={meetingManager} ref={canvasRef} /> : ''}
            </div>
            <div className={classes['contentShare']}>
                <ContentShare />
            </div>
            <div className={classes['custom-grid']}>
                <VideoGrid layout="standard">
                    <LocalVideo nameplate='Me' />
                    {/* Rendering the remote videos */}
                    {videos}
                    {/* This component is for content sharing */}
                </VideoGrid>
            </div>
            {showControlls && children}
        </>
    );
};

export default MeetingView