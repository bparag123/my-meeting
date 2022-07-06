import { ChimeSDKMessaging, ChimeSDKMessagingClient } from '@aws-sdk/client-chime-sdk-messaging'
import config from '../config'

//For creating the Client Object
const getChimeClient = () => {
    const chimeClient = new ChimeSDKMessaging({
        region: 'us-east-1', credentials: {
            secretAccessKey: config.SECRET_ACCESS_KEY,
            accessKeyId: config.ACCESS_KEY_ID
        }
    })
    return chimeClient
}

export default getChimeClient