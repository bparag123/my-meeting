import React from 'react';
import { ChatBubble, ChatBubbleContainer, Flex, useAudioVideo, useMeetingManager } from 'amazon-chime-sdk-component-library-react'
import { useRef } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import moment from 'moment'

const Chat = () => {
    const msgRef = useRef(null);
    const audioVideo = useAudioVideo();
    const [chatData, setChatData] = useState([]);
    const meetingManager = useMeetingManager();
    const localUserName = meetingManager.meetingSessionConfiguration.credentials.externalUserId;
    const localUserId = meetingManager.meetingSessionConfiguration.credentials.attendeeId;

    useEffect(() => {
        audioVideo.realtimeSubscribeToReceiveDataMessage('chat', (data) => {
            const msg = data.json()
            const msgData = {
                ...msg, senderId: data.senderAttendeeId
                , senderName: data.senderExternalUserId
                , timestamp: data.timestampMs
            }
            setChatData(prevState => [...prevState, msgData])
        })
    }, [audioVideo])

    const sendMessage = () => {
        if (msgRef.current.value === "") return
        const dataToSend = {
            body: msgRef.current.value,
            type: 'text',
            time: new Date().getTime()
        }
        audioVideo.realtimeSendDataMessage('chat', dataToSend, 300000)
        msgRef.current.value = ""
        const msgData = {
            ...dataToSend,
            senderId: localUserId,
            senderName: localUserName,
        }
        setChatData(prevState => [...prevState, msgData])
    }

    const containerStyles = `
    display: flex; 
    flex-direction: column;
    width : 30rem;
  `;

    return (
        <div>
            <Flex layout="stack" css={containerStyles}>
                {chatData.map((ele) => {
                    return <ChatBubbleContainer
                        timestamp={moment(ele.time).format("h:mm a")}
                    >
                        <ChatBubble variant={ele.senderId === localUserId ? "outgoing" : "incoming"}
                            showTail={true}
                            senderName={ele.senderName}>
                            {ele.body}
                        </ChatBubble>
                    </ChatBubbleContainer>
                })}
                <input type="text" ref={msgRef} />
                <button onClick={sendMessage}>Send</button>
            </Flex>
        </div >
    );
}

export default Chat;
