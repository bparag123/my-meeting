import React, { useLayoutEffect } from 'react';
import { ChatBubble, ChatBubbleContainer, Flex, useMeetingManager, InfiniteList, MessageAttachment } from 'amazon-chime-sdk-component-library-react'
import { useRef } from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux'
import moment from 'moment'
import getChimeClient from '../utils/ChimeClient'
import configureMessagingSession from '../utils/MessagingSession';
// import upload from '../utils/UploadAttachment';

const fileObjDefaults = {
    name: '',
    file: '',
    type: '',
    response: null,
    key: '',
};

const Chat = () => {
    const msgRef = useRef(null);
    const fileRef = useRef(null);
    const chatConfig = useSelector(state => state.chatConfig)
    const chimeClient = getChimeClient()
    const [chatData, setChatData] = useState([]);
    const meetingManager = useMeetingManager();
    const [fileObj, setFileObj] = useState(fileObjDefaults)
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
            console.log("Sending File")
            try {

                //UploadFile API
                //After receiving response from api i need to setup the file config url

                const msg = await chimeClient.sendChannelMessage({
                    ChannelArn: chatConfig.channelArn,
                    ChimeBearer: chatConfig.memberArn,
                    Persistence: 'PERSISTENT',
                    Type: 'STANDARD',
                    Content: ' ',
                    Metadata: JSON.stringify({
                        attachments: [
                            {
                                fileKey: 'response.key',
                                name: 'uploadObj.name',
                                size: 'uploadObj.file.size',
                                type: 'uploadObj.file.type',
                            },
                        ],
                    })
                })
                console.log(msg)
                fileRef.current.value = ""
                // setFileObj(_ => fileObjDefaults)
            } catch (error) {
                console.log(error.message)
            }

            // upload(fileObj)
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

    const messageItems = chatData.map((ele, id) => {
        return <ChatBubbleContainer timestamp={moment(ele.CreatedTimestamp).format("h:mm a")} key={id}>
            <ChatBubble variant={ele.Sender.Name === localUserName ? "outgoing" : "incoming"}
                showTail={true}
                senderName={ele.Sender.Name}>
                {ele.Metadata ?
                    <MessageAttachment
                        name="Monthly_report.txt"
                        size="30.3KB"
                        downloadUrl="https://www.w3.org/TR/PNG/iso_8859-1.txt" />
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
                    onChange={(event) => {
                        const file = event.currentTarget.files[0];
                        if (!file) return;

                        if (file.size / 1024 / 1024 < 5) {
                            setFileObj({
                                file: file,
                                name: file.name,
                            });
                        }
                    }}
                />
                <button onClick={sendMessage}>Send</button>
            </Flex>
        </div >
    );
}

export default Chat;
