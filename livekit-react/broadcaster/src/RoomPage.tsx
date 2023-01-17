import { faSquare, faThLarge, faUserFriends } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Room, RoomEvent, setLogLevel, VideoPresets } from 'livekit-client';
import { AudioRenderer, DisplayContext, DisplayOptions, LiveKitRoom,  ParticipantView,  StageProps } from '@livekit/react-components';
import { useState } from 'react';
import 'react-aspect-ratio/aspect-ratio.css';
import { useNavigate, useLocation } from 'react-router-dom';

export const RoomPage = () => {
  const [numParticipants, setNumParticipants] = useState(0);
 

  const [displayOptions, setDisplayOptions] = useState<DisplayOptions>({
    stageLayout: 'grid',
    showStats: true,
  });
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const url = query.get('url');
  const token = query.get('token');
  const recorder = query.get('recorder');

  if (!url || !token) {
    return <div>url and token are required</div>;
  }

  const onLeave = () => {
    navigate('/');
  };

  const updateParticipantSize = (room: Room) => {
    setNumParticipants(room.participants.size + 1);
    
  };

  const onParticipantDisconnected = (room: Room) => {
    updateParticipantSize(room);

    /* Special rule for recorder */
    if (recorder && parseInt(recorder, 10) === 1 && room.participants.size === 0) {
      console.log('END_RECORDING');
    }
  };

  const updateOptions = (options: DisplayOptions) => {
    setDisplayOptions({
      ...displayOptions,
      ...options,
    });
  };

  return (
    <>
    {isSet(query, 'producerEnabled') ?
    
    <DisplayContext.Provider value={displayOptions}>
      <div className="roomContainer">
        <div className="topBar">
          <h2>XRevent Broadcaster</h2>
          <div className="right">
            <div>
              <input
                id="showStats"
                type="checkbox"
                onChange={(e) => updateOptions({ showStats: e.target.checked })}
              />
              <label htmlFor="showStats">Show Stats</label>
            </div>
            <div>
              <button
                className="iconButton"
                disabled={displayOptions.stageLayout === 'grid'}
                onClick={() => {
                  updateOptions({ stageLayout: 'grid' });
                }}
              >
                <FontAwesomeIcon height={32} icon={faThLarge} />
              </button>
              <button
                className="iconButton"
                disabled={displayOptions.stageLayout === 'speaker'}
                onClick={() => {
                  updateOptions({ stageLayout: 'speaker' });
                }}
              >
                <FontAwesomeIcon height={32} icon={faSquare} />
              </button>
            </div>
            <div className="participantCount">
              <FontAwesomeIcon icon={faUserFriends} />
              <span>{numParticipants} / </span>
            </div>
          </div>
        </div>
        <LiveKitRoom
          url={url}
          token={token}
          onConnected={(room) => {
            setLogLevel('debug');
            onConnected(room, query);
            room.on(RoomEvent.ParticipantConnected, () => updateParticipantSize(room));
            room.on(RoomEvent.ParticipantDisconnected, () => onParticipantDisconnected(room));
            updateParticipantSize(room);
          }}
          roomOptions={{
            adaptiveStream: isSet(query, 'adaptiveStream'),
            dynacast: isSet(query, 'dynacast'),
            publishDefaults: {
              simulcast: isSet(query, 'simulcast'),
            },
            videoCaptureDefaults: {
              resolution: VideoPresets.h720.resolution,
            },
          }}
          onLeave={onLeave}
        />
      </div>
    </DisplayContext.Provider>


    : // If not producer, we are consumer
      //    <DisplayContext.Consumer value={displayOptions}>
    <DisplayContext.Provider value={displayOptions}>
         
      
      <LiveKitRoom
        url={url}
        token={token}
        stageRenderer={renderStage}
        
       
      
        onConnected={(room) => {
          setLogLevel('debug');
          onConnected(room, query);
          room.on(RoomEvent.ParticipantConnected, () => updateParticipantSize(room));
          room.on(RoomEvent.ParticipantDisconnected, () => onParticipantDisconnected(room));
          
          room.on(RoomEvent.TrackPublished, (publication, participant) => {
            publication.setSubscribed(true);
            // We may want to filter for a specific participant having the publisher role
            console.log("Participant ID we subscribed to: " + participant.toString());
            console.log("Publication we subscribed to: " + publication.toString());
          })
          room.on(RoomEvent.TrackSubscribed, (track, publication, participant) =>{
            console.log("Got Track Subscribed: " + track.kind +";  " +publication + ";  " + participant);

            
          })

          room.on(RoomEvent.ConnectionQualityChanged, (quality, participant) => {
            
           console.log("Quality: " + quality.toString());
          //var publisher = room.participants.get("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NzE3OTEwODEsImlzcyI6IkFQSXJNYXRnYkJ3Tm50eCIsIm5iZiI6MTY3MTcwNDY4MSwic3ViIjoidXNlci0wNWEwYzE2MCIsInZpZGVvIjp7InJvb20iOiJyb29tLTQ4MDczOGNmIiwicm9vbUpvaW4iOnRydWV9fQ.yx9tYzkyCumcXBd0xwiJDocSQHrof2nASs1eowwLvSA");
          console.log("Participant: " + participant.identity.toString() + " Available Tracks: " + participant.getTracks().toString());
          console.log("LocalTracks: " + room.localParticipant.getTracks().toString());
          })

          
          room.on(RoomEvent.AudioPlaybackStatusChanged, () => {
            if (!room.canPlaybackAudio) {
              console.log("Audio BLOCKED: MustClickDaShit. ");
              room.startAudio();
            }
          });

          
          updateParticipantSize(room);
        }}

        connectOptions={{
          
          autoSubscribe: false
        }}

        roomOptions={{
          
          adaptiveStream: isSet(query, 'adaptiveStream'),
          dynacast: isSet(query, 'dynacast'),
          publishDefaults: {
            simulcast: isSet(query, 'simulcast'),
          },
        }}
        onLeave={onLeave}
      />
     
     <div className="roomContainer">
      <div className="topBar">
        <h2>XRevent Live Video</h2>
        <div className="right">
          <div className="participantCount">
            <FontAwesomeIcon icon={faUserFriends} />
            <span>{numParticipants}</span>
          </div>
        </div>
      </div>
   


     
    </div>
    </DisplayContext.Provider>
 // </DisplayContext.Consumer>
    }

    </>
  );
};


function renderStage( roomProps: StageProps) {
  
  
  if (roomProps.roomState.isConnecting) {
    return <div>Connecting...</div>;
  }
  if (roomProps.roomState.error) {
    return <div>Error: {roomProps.roomState.error.message}</div>;
  }
  if (!roomProps) {
    return <div>Room closed</div>;
  }

  //roomProps.roomState.room.getParticipantByIdentity('user-05a0c160').getTrack('screen_share_audio');

  return (
    <>
      <div
        style={{
          overflowY: "auto"
        }}
      >

        {roomProps.roomState.participants.map((participant) => (
         <div key={participant.sid}>{(participant.identity === 'user-05a0c160') ? 
              <ParticipantView
              key={participant.sid}
              participant={participant}
              showOverlay={true}
              aspectWidth={16}
              aspectHeight={9}
            /> 
            
            :
            
            null}</div>
        ))}
        {roomProps.roomState.audioTracks.map((track) => (
          <div key={track.sid}>Killa {track.kind}
          <AudioRenderer key={track.sid} track={track} isLocal={false} /></div>
        ))}
      </div>
      
    </>
  );
}


async function onConnected(room: Room, query: URLSearchParams) {
  // make it easier to debug
  (window as any).currentRoom = room;
  console.log("HALLO");

  if (isSet(query, 'producerEnabled')){
    if (isSet(query, 'audioEnabled')) {
      const audioDeviceId = query.get('audioDeviceId');
      if (audioDeviceId && room.options.audioCaptureDefaults) {
        room.options.audioCaptureDefaults.deviceId = audioDeviceId;
      }
      await room.localParticipant.setMicrophoneEnabled(true);
    }

    if (isSet(query, 'videoEnabled')) {
      const videoDeviceId = query.get('videoDeviceId');
      if (videoDeviceId && room.options.videoCaptureDefaults) {
        room.options.videoCaptureDefaults.deviceId = videoDeviceId;
      }
      await room.localParticipant.setCameraEnabled(true);
    }
  } else {
    console.log("Only wanna Watch!");
    
    
    //var publisher = room.participants.get("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NzE3OTEwODEsImlzcyI6IkFQSXJNYXRnYkJ3Tm50eCIsIm5iZiI6MTY3MTcwNDY4MSwic3ViIjoidXNlci0wNWEwYzE2MCIsInZpZGVvIjp7InJvb20iOiJyb29tLTQ4MDczOGNmIiwicm9vbUpvaW4iOnRydWV9fQ.yx9tYzkyCumcXBd0xwiJDocSQHrof2nASs1eowwLvSA");
      const participants = room.participants;
      
      participants.forEach( ( participant) => {
        console.log("Participant: " + participant.identity.toString());
       
        participant.videoTracks.forEach(( track) => {
          console.log("Videotrack: " + track.trackInfo?.type);
          track.setSubscribed(true);
         
        })

        participant.audioTracks.forEach((aTrack) => {
          aTrack.setSubscribed(true);
        })
    })





  }

}

function isSet(query: URLSearchParams, key: string): boolean {
  return query.get(key) === '1' || query.get(key) === 'true';
}
