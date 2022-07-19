import { useAudioVideo } from 'amazon-chime-sdk-component-library-react';
import React, { useEffect, useState } from 'react';
import classes from './transcription.module.css'

const Transcription = () => {

    const [transcriptData, setTranscriptData] = useState("")

    const audioVideo = useAudioVideo()
    useEffect(() => {
        const transcriptEventHandler = (transcriptEvent) => {

            if (transcriptEvent.results) {
                if (transcriptEvent.results[0].isPartial) {
                    setTranscriptData(_ => transcriptEvent.results[0].alternatives[0].transcript)
                }
            }
        }
        audioVideo.transcriptionController.subscribeToTranscriptEvent(transcriptEventHandler)
    }, [])
    return (
        <div className={classes['transcription']}>
            {transcriptData}
        </div>
    );
}

export default Transcription;
