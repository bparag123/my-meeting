import { configureStore } from '@reduxjs/toolkit'
import chatConfig from './slices/chatConfig'
import transcriptConfig from './slices/transcription'


const store = configureStore({
    reducer: {
        chatConfig: chatConfig.reducer,
        transcriptConfig: transcriptConfig.reducer
    }
})

export default store