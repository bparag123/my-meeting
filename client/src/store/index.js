import { configureStore } from '@reduxjs/toolkit'
import chatConfig from './slices/chatConfig'


const store = configureStore({
    reducer: {
        chatConfig: chatConfig.reducer
    }
})

export default store