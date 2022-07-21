import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios'

const Dashboard = () => {
    const { meetingId } = useParams()
    const [meetingData, setMeetingData] = useState(undefined);

    useEffect(() => {
        const getMetadata = async () => {

            const result = await axios.get(`https://iaz55f28ph.execute-api.us-east-1.amazonaws.com/dev/meetings/getMeetingData/${meetingId}`)
            console.log(result)
            setMeetingData(_ => result.data)
        }
        getMetadata()
    }, [])

    return (
        <div>
            {meetingData ? <>
                <h1>{meetingData.data.MeetingTitle}</h1>
                <h6>Organized By {meetingData.data.Organizer}</h6>
                <p>Start Time : {meetingData.data.StartTime}</p>
                <p>End Time : {meetingData.data.EndTime}</p>
                <h4>Attendees</h4>
                <ul>
                    {meetingData.data.Attendees.map((ele) => {
                        return <li>{ele.ExternalUserId}</li>
                    })}
                </ul>
                {meetingData.transcript.transcriptURL ? <h6>Transcription Of This Meeting <a href={meetingData.transcript.transcriptURL}>here</a></h6>
                    : <h6>{meetingData.transcript.error}</h6>}
                {meetingData.recording.recordingURL ? <h6>recording Of This Meeting <a href={meetingData.recording.recordingURL}>here</a><p>(It might take some to view recording video)</p> </h6> :
                    <h6>{meetingData.recording.error}</h6>}
            </> : ''}


        </div>
    );
}

export default Dashboard;
