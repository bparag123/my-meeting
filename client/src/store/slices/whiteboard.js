import { createSlice } from '@reduxjs/toolkit'


const whiteboardConfig = createSlice({
    name: 'whiteboardConfig',
    initialState: {
        whiteboardId: ''
    },
    reducers: {
        setWhiteboard(state, { payload }) {
            state.whiteboardId = payload.whiteboardId
        }
    }
})

export default whiteboardConfig