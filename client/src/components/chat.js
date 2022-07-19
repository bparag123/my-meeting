import React, { useLayoutEffect } from 'react';
import { ChatBubble, ChatBubbleContainer, Flex, EmojiPicker, useMeetingManager, InfiniteList, MessageAttachment } from 'amazon-chime-sdk-component-library-react'
import { useRef } from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux'
import moment from 'moment'
import getChimeClient from '../utils/ChimeClient'
import configureMessagingSession from '../utils/MessagingSession';
import { getPresignedUrl, uploadFileToBucket, getFileDownloadableUrl } from '../utils/UploadAttachment';
import formatBytes from '../utils/formatBytes';
import Picker from 'emoji-picker-react'
import emojiParser from '../utils/emojiFormat';
import classes from './chat.module.css'

const Chat = () => {
    const msgRef = useRef(null);
    const fileRef = useRef(null);
    const chatConfig = useSelector(state => state.chatConfig)
    const chimeClient = getChimeClient()
    const [chatData, setChatData] = useState([]);
    const [text, setText] = useState("");
    const meetingManager = useMeetingManager();
    const [showEmoji, setShowEmoji] = useState(false)
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
        else if (text !== "") {
            await chimeClient.sendChannelMessage({
                ChannelArn: chatConfig.channelArn,
                ChimeBearer: chatConfig.memberArn,
                Persistence: 'PERSISTENT',
                Type: 'STANDARD',
                Content: text
            })
            msgRef.current.value = ""
            setText(_ => "")
            setShowEmoji(_ => false)
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
                    emojiParser(ele.Content)
                }
            </ChatBubble>


        </ChatBubbleContainer >
    })

    const containerStyles = `
    display: flex; 
    flex-direction: column;
    width : 30rem;
  `;

    const onEmojiClick = (event, emojiObject) => {
        console.log(emojiObject.emoji)
        const codePoint = emojiObject.emoji.codePointAt(0)
        console.log(codePoint)
        msgRef.current.value += emojiObject.emoji
        setText(state => {
            return state + `<emo>${codePoint}</emo>`
        })
        // setChosenEmoji(state => state + `<emo>${codePoint}</emo>`)
        // repl(chosenEmoji)
    };

    // const onBackSpace = (e) => {
    //     if (e.key === 'Backspace') {
    //         if (text.slice(-6) === "</emo>") {
    //             console.log("It's emo")
    //         }
    //     }
    // }

    return (
        <div className='chatWrapper'>
            <Flex className='ChatFlex' layout="stack" css={containerStyles}>
                <InfiniteList items={messageItems} onLoad={() => { }} isLoading={false} css="height: 50vh" />
                <input type="text" ref={msgRef} onChange={(e) => {
                    console.log("Change", e.target.value)
                    setText(state => {
                        console.log(text)
                        return state + e.target.value.slice(e.target.value.length - 1)
                    })
                }} />
                <input
                    type="file"
                    accept="file_extension|audio/*|video/*|image/*|media_type"
                    ref={fileRef}
                />
                <div className='emojiWrapper'>
                    <button className='emojiBtn' onClick={() => {
                        setShowEmoji(state => !state)
                    }}><EmojiPicker height={20} width={20} /></button>
                    <button className='sendBtn' onClick={sendMessage}>Send</button>
                </div>

                {showEmoji ? <div className={classes['emojiPicker']}><Picker onEmojiClick={onEmojiClick} /></div> : ''}
            </Flex>
        </div >
    );
}

export default Chat;
