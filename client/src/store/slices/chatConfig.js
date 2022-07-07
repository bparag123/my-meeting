import { createSlice } from '@reduxjs/toolkit'


const chatConfig = createSlice({
    name: 'chatConfig',
    initialState: {
        channelArn: '',
        memberArn: ''
    },
    reducers: {
        setUpChat(state, { payload }) {
            state.channelArn = payload.channelArn
            state.memberArn = payload.memberArn
        }
    }
})

export default chatConfig