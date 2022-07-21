import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const Dashboard = () => {
    const { meetingId } = useParams()
    const meetingData = {
        meetingName: 'Test',
        meetingOrganizer: 'Parag',
    }

    useEffect(() => {
        console.log("Will Call Server for Getting Data of Meeting Session")
    }, [])

    return (
        <div>
            <h1>{meetingData.meetingName}</h1>
            <h6>Organized By {meetingData.meetingOrganizer}</h6>
        </div>
    );
}

export default Dashboard;
