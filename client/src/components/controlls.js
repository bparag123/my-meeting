import {
  Camera,
  ControlBar,
  ControlBarButton,
  LeaveMeeting,
  Microphone,
  Phone,
  ScreenShare,
  Clear,
  Pause,
  Play,
  useLocalVideo,
  Record,
  Laptop,
  Attendees,
  Meeting,
  Chat,
  useVideoInputs,
  useAudioInputs,
} from 'amazon-chime-sdk-component-library-react';
import { useState } from 'react';
import axios from 'axios';
import setupWhiteboard from '../utils/setupWhiteboard';
import { useSelector, useDispatch } from 'react-redux';
import transcriptConfig from '../store/slices/transcription'
import { useNavigate } from 'react-router-dom';

export const Controlls = ({ meetingManager, showWhiteBoard, setShowWhiteBoard, showParticipants, setParticipants, showChat, setChat }) => {

  const [muted, setMuted] = useState(false);
  const navigate = useNavigate()
  const [screenShared, setScreenShared] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const isTranscripting = useSelector(state => state.transcriptConfig.active)
  const [pauseContentShare, setPauseContentShare] = useState(false);
  const { isVideoEnabled, setIsVideoEnabled } = useLocalVideo()
  const [MediaPipelineId, setMediaPipelineId] = useState("")
  const dispatch = useDispatch()
  const { selectedDevice } = useVideoInputs()
  const { selectedDevice: AudioSeletedDevice } = useAudioInputs()
  let localUserName = "";
  console.log(meetingManager)
  //Getting Local Username
  if (meetingManager.audioVideo) {
    localUserName =
      meetingManager.audioVideo.realtimeController.state.localExternalUserId;
  }

  const microphoneButtonProps = {
    icon: muted ? (
      <span className="muted">
        {" "}
        <Microphone height={30} width={30} muted />
      </span>
    ) : (
      <span className="unmute">
        <Microphone height={30} width={30} />
      </span>
    ),
    onClick: async () => {
      setMuted(!muted);
      if (!muted) {
        await meetingManager.audioVideo.stopAudioInput()
        meetingManager.audioVideo.realtimeMuteLocalAudio();
      } else {
        await meetingManager.audioVideo.startAudioInput(AudioSeletedDevice)
        meetingManager.audioVideo.realtimeUnmuteLocalAudio();
      }
    },
    label: "Mute",
  };

  const cameraButtonProps = {
    icon: isVideoEnabled ? (
      <span className="actionIcon">
        {" "}
        <Camera height={30} width={30} />{" "}
      </span>
    ) : (
      <span className="actionDisable">
        {" "}
        <Camera height={30} width={30} disabled />{" "}
      </span>
    ),
    onClick: async () => {
      if (isVideoEnabled) {
        await meetingManager.audioVideo.stopVideoInput()
        meetingManager.audioVideo.stopLocalVideoTile();
        setIsVideoEnabled(false);
      } else {
        await meetingManager.audioVideo.startVideoInput(selectedDevice);
        setIsVideoEnabled(true);
        meetingManager.audioVideo.startLocalVideoTile();
      }
    },
    label: "Camera",
  };

  const pauseButtonProps = {
    icon: pauseContentShare ? (
      <span className="actionIcon">
        {" "}
        <Play height={30} width={30} />{" "}
      </span>
    ) : (
      <span className="actionDisable">
        {" "}
        <Pause height={30} width={30} />{" "}
      </span>
    ),
    onClick: () => {
      console.log("Pause Button Clicked");
      if (!pauseContentShare) {
        setPauseContentShare((state) => true);
        meetingManager.audioVideo.pauseContentShare();
      } else {
        setPauseContentShare((state) => false);
        meetingManager.audioVideo.unpauseContentShare();
      }
    },
    label: "Pause",
  };

  const hangUpButtonProps = {
    icon: (
      <span className="actionIcon">
        {" "}
        <Phone height={30} width={30} />{" "}
      </span>
    ),
    onClick: async () => {
      setShowWhiteBoard((_) => false);
      const mId = meetingManager.meetingId
      const response = await axios.delete(`
            https://iaz55f28ph.execute-api.us-east-1.amazonaws.com/dev/meetings/${meetingManager.meetingId}`);
      console.log(response.status);
      if (response.status === 200) {
        console.log("Ending Meeting");
        navigate(`/dashboard/${mId}`, { replace: true })
      }
    },
    label: "End",
  };

  const leaveMeetingButtonProps = {
    icon: (
      <span className="actionIcon">
        {" "}
        <LeaveMeeting className="backRed" height={30} width={30} />{" "}
      </span>
    ),
    onClick: async () => {
      setShowWhiteBoard((_) => false);
      meetingManager.audioVideo.stopLocalVideoTile();
      meetingManager.audioVideo.stop();
      meetingManager.leave();
      console.log("Leaving Meeting");
    },
    label: "Leave",
  };

  const screenShareButtonProps = {
    icon: screenShared ? (
      <span className="actionIcon">
        {" "}
        <Clear height={30} width={30} />{" "}
      </span>
    ) : (
      <span className="actionDisable">
        {" "}
        <ScreenShare height={30} width={30} />{" "}
      </span>
    ),
    onClick: () => {
      if (!screenShared) {
        setParticipants((_) => false);
        setScreenShared((state) => true);
        meetingManager.audioVideo.startContentShareFromScreenCapture();
      } else {
        setScreenShared((state) => false);
        meetingManager.audioVideo.stopContentShare();
      }
    },
    label: "Share",
  };

  const whiteBoardProps = {
    icon: showWhiteBoard ? (
      <span className="actionIcon">
        {" "}
        <Clear height={30} width={30} />{" "}
      </span>
    ) : (
      <span className="actionDisable">
        {" "}
        <Laptop height={30} width={30} />{" "}
      </span>
    ),
    onClick: async () => {
      console.log(process.env.A);
      if (!showWhiteBoard) {
        setParticipants((_) => false);
        const headers = {
          Authorization: "Bearer P6y4WbP76WrN8rB70A2aYH3AI0sYjQBJDUrdpx2i",
        };
        const whiteBoardResponse = await axios.post(
          "https://hq.pixelpaper.io/api/board",
          {},
          {
            headers,
          }
        );
        setupWhiteboard(whiteBoardResponse.data.room_id, localUserName);
        meetingManager.audioVideo.realtimeSendDataMessage("showWhiteboard", {
          display: !showWhiteBoard,
          roomId: whiteBoardResponse.data.room_id,
        });
      } else {
        meetingManager.audioVideo.realtimeSendDataMessage("showWhiteboard", {
          display: !showWhiteBoard,
        });
      }
      setShowWhiteBoard((_) => !showWhiteBoard);
    },
    label: "White Board",
  };

  const startRecordingProps = {
    icon: isRecording ? (
      <span className="actionIcon">
        {" "}
        <Clear height={30} width={30} />{" "}
      </span>
    ) : (
      <span className="actionDisable">
        {" "}
        <Record height={30} width={30} />{" "}
      </span>
    ),
    onClick: async () => {
      if (isRecording) {
        await axios.get(
          `https://iaz55f28ph.execute-api.us-east-1.amazonaws.com/dev/meetings/stopRecording/${MediaPipelineId}`
        );
        setIsRecording((_) => false);
      } else {
        const data = await axios.get(
          `https://iaz55f28ph.execute-api.us-east-1.amazonaws.com/dev/meetings/startRecording/${meetingManager.meetingId}`
        );
        setIsRecording((_) => true);
        setMediaPipelineId((_) => data.data.MediaPipelineId);
      }
    },
    label: "Record",
  };

  const showParticipantsProp = {
    icon: showParticipants ? (
      <span className="actionIcon">
        {" "}
        <Clear height={30} width={30} />{" "}
      </span>
    ) : (
      <span className="actionDisable">
        {" "}
        <Attendees height={30} width={30} />{" "}
      </span>
    ),
    onClick: () => {
      setParticipants((_) => !showParticipants);
    },
    label: "Participants",
  };

  const showChatProps = {
    icon: showChat ? <span className="actionIcon"> <Clear height={30} width={30} /> </span> : <span className="actionDisable"> <Chat height={30} width={30} /> </span>,
    onClick: () => {
      setChat(_ => !showChat)
    },
    label: 'Chat'
  }



  const startTranscriptionProps = {
    icon: isTranscripting ? (
      <span className="actionIcon">
        {" "}
        <Clear height={30} width={30} />{" "}
      </span>
    ) : (
      <span className="actionDisable">
        {" "}
        <Meeting height={30} width={30} />{" "}
      </span>
    ),
    onClick: async () => {
      if (isTranscripting) {
        await axios.get(
          `https://iaz55f28ph.execute-api.us-east-1.amazonaws.com/dev/meetings/stopTranscription/${meetingManager.meetingId}`
        );
        dispatch(transcriptConfig.actions.transcriptionSwitch({ active: false }))
      } else {
        await axios.get(
          `https://iaz55f28ph.execute-api.us-east-1.amazonaws.com/dev/meetings/startTranscription/${meetingManager.meetingId}`
        );
        dispatch(transcriptConfig.actions.transcriptionSwitch({ active: true }))
      }
    },
    label: "Transcription",
  };

  return (
    <div className="actionBtnList">
      <ControlBar className="mainControl" showLabels layout="bottom">
        <ControlBarButton {...microphoneButtonProps} className="actionButton" />
        <ControlBarButton {...cameraButtonProps} className="actionButton" />
        <ControlBarButton {...whiteBoardProps} className="actionButton" />
        <ControlBarButton
          {...screenShareButtonProps}
          className="actionButton"
        />
        <ControlBarButton
          {...hangUpButtonProps}
          className="actionButton back-red"
        />
        <ControlBarButton
          {...leaveMeetingButtonProps}
          className="actionButton back-red"
        />
        <ControlBarButton {...startRecordingProps} className="actionButton" />
        <ControlBarButton {...startTranscriptionProps} className="actionButton" />
        <ControlBarButton {...showParticipantsProp} className="actionButton" />
        <ControlBarButton {...showChatProps} className="actionButton" />
        {screenShared && (
          <ControlBarButton {...pauseButtonProps} className="actionButton" />

        )}
      </ControlBar>
    </div>
  );
};
