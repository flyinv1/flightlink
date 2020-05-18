import { createSlice } from '@reduxjs/toolkit';

const SignalEditorSlice = createSlice({
    name: 'signalEditor',
    initialState: {
        selectedSignalId: ""
    },
    reducers: {
        setSelectedSignalId(state, action) {
            state.selectSignalId = action.payload;
        },
    }
})

export const { setSelectedSignalId } = SignalEditorSlice.actions

export default SignalEditorSlice.reducer;