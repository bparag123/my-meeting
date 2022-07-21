import { configureStore } from '@reduxjs/toolkit'
import chatConfig from './slices/chatConfig'
import transcriptConfig from './slices/transcription'
import whiteboardConfig from './slices/whiteboard'


const store = configureStore({
    reducer: {
        chatConfig: chatConfig.reducer,
        transcriptConfig: transcriptConfig.reducer,
        whiteboardConfig: whiteboardConfig.reducer
    }
})

export default store