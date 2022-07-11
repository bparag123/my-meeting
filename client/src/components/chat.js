import React, { useLayoutEffect } from 'react';
import { ChatBubble, ChatBubbleContainer, Flex, useMeetingManager, InfiniteList, MessageAttachment } from 'amazon-chime-sdk-component-library-react'
import { useRef } from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux'
import moment from 'moment'
import getChimeClient from '../utils/ChimeClient'
import configureMessagingSession from '../utils/MessagingSession';
import { getPresignedUrl, uploadFileToBucket, getFileDownloadableUrl } from '../utils/UploadAttachment';
import formatBytes from '../utils/formatBytes';

const Chat = () => {
    const msgRef = useRef(null);
    const fileRef = useRef(null);
    const chatConfig = useSelector(state => state.chatConfig)
    const chimeClient = getChimeClient()
    const [chatData, setChatData] = useState([]);
    const meetingManager = useMeetingManager();
    const localUserName = meetingManager.meetingSessionConfiguration.credentials.externalUserId;
    const localUserId = meetingManager.meetingSessionConfiguration.credentials.attendeeId;


    //This is for Getting All the Messaging When the User Join the Meeting
    useLayoutEffect(() => {
        console.log("Chat Runs")
        const getMessages = async () => {
            const msgData = await chimeClient.listChannelMessages({
                ChannelArn: chatConfig.channelArn,
                ChimeBearer: chatConfig.memberArn,
                SortOrder: "ASCENDING"
            })
            console.log(msgData.ChannelMessages)
            setChatData(_ => msgData.ChannelMessages)
        }
        getMessages()
    }, [chatConfig])


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
        if (fileRef.current.value !== '') {
            const file = fileRef.current.files[0]
            try {
                //UploadFile API
                const presignedUrl = await getPresignedUrl(file.name, file.type)

                await uploadFileToBucket(presignedUrl, file)

                const downloadableUrl = await getFileDownloadableUrl(file.name)

                const msg = await chimeClient.sendChannelMessage({
                    ChannelArn: chatConfig.channelArn,
                    ChimeBearer: chatConfig.memberArn,
                    Persistence: 'PERSISTENT',
                    Type: 'STANDARD',
                    Content: downloadableUrl,
                    Metadata:
                        JSON.stringify({
                            name: file.name,
                            size: formatBytes(file.size),
                        }),
                })

                fileRef.current.value = ""
            } catch (error) {
                console.log(error.message)
            }
        }
        else if (msgRef.current.value !== "") {
            await chimeClient.sendChannelMessage({
                ChannelArn: chatConfig.channelArn,
                ChimeBearer: chatConfig.memberArn,
                Persistence: 'PERSISTENT',
                Type: 'STANDARD',
                Content: msgRef.current.value
            })
            msgRef.current.value = ""
        }

    }

    const Attachment = (msg, url) => {
        const data = JSON.parse(msg)
        return <MessageAttachment
            onClick={(e) => {
            }}
            name={data.name}
            size={data.size}
            downloadUrl={url} />
    }

    const messageItems = chatData.map((ele, id) => {
        return <ChatBubbleContainer timestamp={moment(ele.CreatedTimestamp).format("h:mm a")} key={id}>
            <ChatBubble variant={ele.Sender.Name === localUserName ? "outgoing" : "incoming"}
                showTail={true}
                senderName={ele.Sender.Name}>
                {ele.Metadata ?
                    Attachment(ele.Metadata, ele.Content)
                    :
                    ele.Content
                }
            </ChatBubble>


        </ChatBubbleContainer >
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
                <input
                    type="file"
                    accept="file_extension|audio/*|video/*|image/*|media_type"
                    ref={fileRef}
                />
                <button onClick={sendMessage}>Send</button>
            </Flex>
        </div >
    );
}

export default Chat;
