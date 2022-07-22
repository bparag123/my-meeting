import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./../layout/dashboard.scss";
import axios from "axios";

const Dashboard = () => {
  const { meetingId } = useParams();
  const [meetingData, setMeetingData] = useState(undefined);

  // Only send the meeting id on transcript error.
  // Delete this line after the backend is fixed.
  meetingData.transcript.error = "59570d84-165b-4bab-a7c5-5f3801022713";


  useEffect(() => {
    const getMetadata = async () => {
      const result = await axios.get(
        `https://iaz55f28ph.execute-api.us-east-1.amazonaws.com/dev/meetings/getMeetingData/${meetingId}`
      );
      console.log(result);
      setMeetingData((_) => result.data);
    };
    getMetadata();
  }, []);

  return (
    <div className="meetingInfo">
      {meetingData ? (
        <>
          <div className="meetingInfoWrapper">
            <div className="meetingHead">
              <h1>{meetingData.data.MeetingTitle}</h1>
            </div>
            <div className="meetingOrganizer">
             Organized By {meetingData.data.Organizer}
            </div>
            <div className="meetingTiming">
              <p>Start Time : {meetingData.data.StartTime}</p>
              <p>End Time : {meetingData.data.EndTime}</p>
            </div>
            <div className="meetingJoiners">
              <h4>Attendees</h4>
              <ul>
                {meetingData.data.Attendees.map((ele) => {
                  return <li>{ele.ExternalUserId}</li>;
                })}
              </ul>
            </div>
            <div className="meetingTranscription">
              {meetingData.transcript.transcriptURL ? (
                <h6>
                  Transcription Of This Meeting{" "}
                  <a href={meetingData.transcript.transcriptURL}>here</a>
                </h6>
              ) : (
                <div>Transcription not found in meeting Id <span>{meetingData.transcript.error}</span></div>
              )}
            </div>
            <div className="meetingRecording">
              {meetingData.recording.recordingURL ? (
                <div>
                  <span>
                    Recording of this meeting is availabe{" "}
                    <a href={meetingData.recording.recordingURL}>here</a>
                  </span>
                  <p>(It might take some to view recording video)</p>{" "}
                </div>
              ) : (
                <h6>{meetingData.recording.error}</h6>
              )}
            </div>
          </div>
        </>
      ) : (
        ""
      )}
    </div>
  );
};

export default Dashboard;
