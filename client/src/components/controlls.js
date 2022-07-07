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
  useAudioInputs,
  useVideoInputs,
  useAudioOutputs,
  useSelectVideoQuality,
} from "amazon-chime-sdk-component-library-react";
import { useState } from "react";
import axios from "axios";
import setupWhiteboard from "../utils/setupWhiteboard";

export const Controlls = ({
  meetingManager,
  showWhiteBoard,
  setShowWhiteBoard,
  showParticipants,
  setParticipants,
}) => {
  //Different states to handle the behaviour
  const [muted, setMuted] = useState(false);
  const [screenShared, setScreenShared] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [pauseContentShare, setPauseContentShare] = useState(false);
  const { isVideoEnabled, setIsVideoEnabled } = useLocalVideo();
  const [MediaPipelineId, setMediaPipelineId] = useState("");

  let localUserName = "";
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
    onClick: () => {
      setMuted(!muted);
      if (!muted) {
        meetingManager.audioVideo.realtimeMuteLocalAudio();
      } else {
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
        meetingManager.audioVideo.stopLocalVideoTile();
        setIsVideoEnabled(false);
      } else {
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

      const response = await axios.delete(`
            https://iaz55f28ph.execute-api.us-east-1.amazonaws.com/dev/meetings/${meetingManager.meetingId}`);
      console.log(response.status);
      if (response.status === 204) {
        console.log("Ending Meeting");
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

  return (
    <div className="actionBtnList">
      <ControlBar className="mainControl"  showLabels layout="bottom">
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
        <ControlBarButton {...showParticipantsProp} className="actionButton" />
        {screenShared && (
          <ControlBarButton {...pauseButtonProps} className="actionButton" />
        )}
      </ControlBar>
    </div>
  );
};
