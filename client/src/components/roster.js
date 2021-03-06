import React from 'react';
import {
    MeetingProvider,
    useRosterState,
    Roster,
    RosterGroup,
    RosterAttendee,
    RosterHeader
} from 'amazon-chime-sdk-component-library-react';

const Participants = () => {
    const { roster } = useRosterState()
    const attendees = Object.values(roster);
    const attendeeItems = attendees.map(attendee => {
        const { chimeAttendeeId, externalUserId: name } = attendee;
        return (
            <RosterAttendee key={chimeAttendeeId} attendeeId={chimeAttendeeId} name={name} />
        );
    });

    return (
        <>
            {attendeeItems.length > 0 && <Roster>
                <RosterHeader
                    title="Present"
                    // badge={2}
                    // onClose={() => { }}
                    // searchValue="Michael"
                    // onSearch={() => { }}
                />
                <RosterGroup>{attendeeItems}</RosterGroup>
            </Roster>}
        </>

    );
}

export default Participants