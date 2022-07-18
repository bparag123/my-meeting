import {
  CameraSelection,
  ContentShare,
  LocalVideo,
  MicSelection,
  QualitySelection,
  RemoteVideo,
  SpeakerSelection,
  useBackgroundBlur,
  useRemoteVideoTileState,
  useVideoInputs,
  VideoGrid,
  useMeetingStatus,
} from "amazon-chime-sdk-component-library-react";
import "./../layout/createMeeting.scss";
import { useEffect, useState } from "react";
import classes from "./meeting.module.css";
import Participants from "./roster";
import { isVideoTransformDevice } from "amazon-chime-sdk-js";
import Chat from "./chat";
import Transcription from './transcription'

const MeetingView = ({
  children,
  meetingManager,
  showWhiteBoard,
  showParticipants,
  showChat,
  setChat,
}) => {
  const status = useMeetingStatus();
  const { selectedDevice } = useVideoInputs();
  const { isBackgroundBlurSupported, createBackgroundBlurDevice } =
    useBackgroundBlur();
  const [isVideoTransformCheckBoxOn, setisVideoTransformCheckBoxOn] =
    useState(false);
  //Getting all the remote attende tile state
  const { tiles, tileIdToAttendeeId } = useRemoteVideoTileState();
  // const roster = useRosterState();
  const [showControlls, setShowControlls] = useState(false);
  meetingManager.subscribeToEventDidReceive((name, attribiutes) => {
    switch (name) {
      case "meetingStartSucceeded":
        setShowControlls((_) => true);
        break;
      case "meetingEnded":
        setShowControlls((_) => false);
        break;
      default:
        console.log("Default");
    }
    console.log(name, attribiutes);
  });

  let videos = [];

  if (meetingManager.audioVideo) {
    videos = tiles.map((tileId) => {
      const attendeeId = tileIdToAttendeeId[tileId];
      //Getting the external user Id for the user
      const attendee = meetingManager.audioVideo
        .getRemoteVideoSources()
        .find((ele) => {
          return ele.attendee.attendeeId === attendeeId;
        });

      if (attendee) {
        return (
          <RemoteVideo
            name={attendee.attendee.externalUserId}
            tileId={tileId}
            key={tileId}
          />
        );
      } else {
        return "";
      }
    });
  }

  //Modifying Visibility of Whiteboard
  const x = document.querySelector("#comet-container");
  if (showWhiteBoard) {
    x.style["visibility"] = "visible";
  } else {
    x.style["visibility"] = "hidden";
  }

  const onClick = () => {
    setisVideoTransformCheckBoxOn((current) => !current);
  };

  useEffect(() => {
    async function toggleBackgroundBlur() {
      try {
        let current = selectedDevice;
        if (isVideoTransformCheckBoxOn) {
          current = await createBackgroundBlurDevice(selectedDevice);
        } else {
          if (isVideoTransformDevice(selectedDevice)) {
            current = await selectedDevice.intrinsicDevice();
          }
        }
        await meetingManager.startVideoInputDevice(current);
      } catch (error) {
        // Handle device selection failure here
        console.error("Failed to toggle Background Blur");
      }
    }

    toggleBackgroundBlur();
  }, [isVideoTransformCheckBoxOn]);

  return (
    // <>
    //   <div>
    //     {showControlls ? <div className={classes['options']}>
    //       {isBackgroundBlurSupported && (
    //         <button onClick={onClick}>
    //           {isVideoTransformDevice(selectedDevice)
    //             ? 'Background Normal'
    //             : 'Background Blur'}
    //         </button>
    //       )}
    //       <QualitySelection />
    //       <MicSelection />
    //       <CameraSelection />
    //       <SpeakerSelection />
    //     </div> : ''}

    //     {status ? <div className={classes['mainLayout']}>

    //       <div className={showParticipants ? classes['showparticipants'] : classes['hideparticipants']}>
    //         <Participants />
    //       </div>
    //       <div className={showWhiteBoard ? classes['disablemeetingPane'] : classes['meetingPane']}>
    //         <div className="usersList">
    //           <div className={classes['contentShare']}>
    //             <ContentShare />
    //           </div>
    //           <div className={classes['custom-grid']}>
    //             <VideoGrid layout="standard">
    //               <LocalVideo nameplate='Me' />
    //               {/* Rendering the remote videos */}
    //               {videos}
    //             </VideoGrid>
    //           </div>
    //         </div>
    //       </div>
    //       <div className={showChat ? classes['showchat'] : classes['hidechat']}>
    //         <Chat />
    //       </div>

    //     </div> : ''}
    //     {showControlls && children}
    //   </div>
    // </>

    <>
      {status ? (
        <div className={classes["mainLayout"]}>
          <div
            className={
              showParticipants
                ? classes["showparticipants"]
                : classes["hideparticipants"]
            }
          >
            <Participants />
          </div>

          <div
            className={`${
              showWhiteBoard
                ? classes["disablemeetingPane"]
                : classes["meetingPane"]
            } ${classes.videoGridWrapper}`}
          >
            {showControlls ? (
              <div className={classes["options"]}>
                {isBackgroundBlurSupported && (
                  <button onClick={onClick}>
                    {isVideoTransformDevice(selectedDevice)
                      ? "Background Normal"
                      : "Background Blur"}
                  </button>
                )}
                <QualitySelection />
                <MicSelection />
                <CameraSelection />
                <SpeakerSelection />
              </div>
            ) : (
              ""
            )}
            <div className={classes["userslist"]}>
              <div className={classes["contentShare"]}>
                <ContentShare />
              </div>
              <div className={`${classes["custom-grid"]} ${classes["userWrapper"]}`}>
                <VideoGrid layout="standard">
                  <LocalVideo nameplate="Me" />
                  {/* Rendering the remote videos */}
                  {videos}
                </VideoGrid>
              </div>
              {/* //setting for Transcription */}
              <Transcription />
            </div>
            <div
              className={showChat ? classes["showchat"] : classes["hidechat"]}
            >
              <Chat />
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
      {showControlls && children}
    </>
  );
};

export default MeetingView;
