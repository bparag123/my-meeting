import React, { useLayoutEffect } from 'react';
import { ChatBubble, ChatBubbleContainer, Flex, useMeetingManager, InfiniteList } from 'amazon-chime-sdk-component-library-react'
import { useRef } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { useSelector } from 'react-redux'
import moment from 'moment'
import getChimeClient from '../utils/ChimeClient'
import configureMessagingSession from '../utils/MessagingSession';

const Chat = () => {
    const msgRef = useRef(null);
    const chatConfig = useSelector(state => state.chatConfig)
    const chimeClient = getChimeClient()
    const [chatData, setChatData] = useState([]);
    const meetingManager = useMeetingManager();
    const localUserName = meetingManager.meetingSessionConfiguration.credentials.externalUserId;
    const localUserId = meetingManager.meetingSessionConfiguration.credentials.attendeeId;


    //This is for Getting All the Messaging When the User Join the Meeting
    useLayoutEffect(() => {

        const getMessages = async () => {
            const msgData = await chimeClient.listChannelMessages({
                ChannelArn: chatConfig.channelArn,
                ChimeBearer: chatConfig.memberArn,
                SortOrder: "ASCENDING"
            })
            setChatData(_ => msgData.ChannelMessages)
        }
        getMessages()
    }, [chatConfig, chimeClient])


    //This is for initializing the Session For the Messaging (Runs Only Once)
    useLayoutEffect(() => {

        const configSession = async () => {
            const messagingSession = await configureMessagingSession(chatConfig.memberArn)

            const messageObserver = {
                messagingSessionDidStart: () => {
                    console.log('Messaging Connection started!');
                },
                messagingSessionDidStartConnecting: reconnecting => {
                    console.log('Messaging Connection connecting');
                },
                messagingSessionDidStop: event => {
                    console.log('Messaging Connection received DidStop event');
                },
                messagingSessionDidReceiveMessage: message => {
                    if (message.type === "CREATE_CHANNEL_MESSAGE") {
                        setChatData(prev => [...prev, JSON.parse(message.payload)])
                        console.log(JSON.parse(message.payload))
                    }
                }
            };
            messagingSession.addObserver(messageObserver)
            await messagingSession.start()
        }
        configSession()

    }, [])
    const sendMessage = async () => {
        if (msgRef.current.value === "") return

        const msg = await chimeClient.sendChannelMessage({
            ChannelArn: chatConfig.channelArn,
            ChimeBearer: chatConfig.memberArn,
            Persistence: 'PERSISTENT',
            Type: 'STANDARD',
            Content: msgRef.current.value
        })
        msgRef.current.value = ""
    }

    const messageItems = chatData.map((ele, id) => {
        return <ChatBubbleContainer timestamp={moment(ele.CreatedTimestamp).format("h:mm a")} key={id}>
            <ChatBubble variant={ele.Sender.Name === localUserName ? "outgoing" : "incoming"}
                showTail={true}
                senderName={ele.Sender.Name}>
                {ele.Content}
            </ChatBubble>
        </ChatBubbleContainer>
    })

    const containerStyles = `
    display: flex; 
    flex-direction: column;
    width : 30rem;
  `;

    return (
        <div>
            <Flex layout="stack" css={containerStyles}>
                <InfiniteList items={messageItems} onLoad={() => { }} isLoading={false} css="height: 50vh" />
                <input type="text" ref={msgRef} />
                <button onClick={sendMessage}>Send</button>
            </Flex>
        </div >
    );
}

export default Chat;
