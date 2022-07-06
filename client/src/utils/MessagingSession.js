import { DefaultMessagingSession, MessagingSessionConfiguration, ConsoleLogger, LogLevel } from 'amazon-chime-sdk-js'
import getChimeClient from './ChimeClient'
import { v4 as uuid } from 'uuid'

//For Configuring Messaging Session

const configureMessagingSession = async (userArn) => {
    const chimeClient = getChimeClient()
    const msgEndpoint = await chimeClient.getMessagingSessionEndpoint()
    console.log(msgEndpoint)
    const msgConfiguration = new MessagingSessionConfiguration(userArn, uuid(), msgEndpoint.Endpoint.Url, chimeClient)

    const logger = new ConsoleLogger('SDK', LogLevel.INFO)
    const session = new DefaultMessagingSession(msgConfiguration, logger)
    console.log("Session Started", session)

    // session.addObserver(messageObserver)
    return session
}

export default configureMessagingSession