import { createSlice } from '@reduxjs/toolkit'


const transcriptConfig = createSlice({
    name: 'transcriptConfig',
    initialState: {
        active: false
    },
    reducers: {
        transcriptionSwitch(state, { payload }) {
            state.active = payload.active
        }
    }
})

export default transcriptConfig