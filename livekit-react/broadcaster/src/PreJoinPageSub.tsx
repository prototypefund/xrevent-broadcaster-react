import { faBolt, faVideoCamera } from '@fortawesome/free-solid-svg-icons';
import { ControlButton } from '@livekit/react-components';
import { ReactElement, useEffect, useState } from 'react';
import { AspectRatio } from 'react-aspect-ratio';
import { useNavigate } from 'react-router-dom';
import  subSplash  from './res/images/SubscriberSplash.png'

export const PreJoinPageSub = () => {
  // initial state from query parameters
  const searchParams = new URLSearchParams(window.location.search);
  const storedUrl = searchParams.get('url') ?? 'wss://xrevent.livekit.cloud';
  const storedToken = searchParams.get('token') ?? '';

  // state to pass onto room
  const [url, setUrl] = useState(storedUrl);
  const [token, setToken] = useState<string>(storedToken);
  const [adaptiveStream, setAdaptiveStream] = useState(true);
  const [producerEnabled] = useState(false);
  // disable connect button unless validated
  const [connectDisabled, setConnectDisabled] = useState(true);
  const navigate = useNavigate();

  

  useEffect(() => {
    if (token && url) {
      setConnectDisabled(false);
    } else {
      setConnectDisabled(true);
    }
    
  }, [token, url]);

  const navigateToProvider = async () =>{
    navigate({
        pathname: '/provider',
      });
  }

  const connectToRoom = async () => {
    
    if (
      window.location.protocol === 'https:' &&
      url.startsWith('ws://') &&
      !url.startsWith('ws://localhost')
    ) {
      alert('Unable to connect to insecure websocket from https');
      return;
    }

    const params: { [key: string]: string } = {
      url,
      token,
      producerEnabled: producerEnabled ? '1' :'0',
      adaptiveStream: adaptiveStream ? '1' : '0',
    };
   
    navigate({
      pathname: '/room',
      search: '?' + new URLSearchParams(params).toString(),
    });
  };

  let videoElement: ReactElement;
  videoElement = <div className="logo">
                    <img src={subSplash} alt="Broadcast Subscriber Logo" />
                  </div>;
  

  return (
    <div className="prejoin">
      <main>
        <h2>XRevent Broadcaster</h2>
        <hr />
        <div className="entrySection">
          <div>
            <div className="label">LiveKit URL</div>
            <div>
              <input 
                type="text" 
                name="url" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
              />
            </div>
          </div>
          <div>
            <div className="label">Token</div>
            <div>
              <input
                type="text"
                name="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                autoFocus={true}
              />
            </div>
          </div>
          <div className="options">
            <div>
              <input
                id="adaptivestream-option"
                type="checkbox"
                name="adaptiveStream"
                checked={adaptiveStream}
                onChange={(e) => setAdaptiveStream(e.target.checked)}
              />
              <label htmlFor="adaptivestream-option">Adaptive Stream</label>
            </div>
          </div>
        </div>

        <div className="videoSection">
          <AspectRatio ratio={16 / 9}>{videoElement}</AspectRatio>
        </div>

        <div className="controlSection">
          <div className="left">
            <ControlButton
              label="Switch"
              icon={faVideoCamera}
              onClick={navigateToProvider}
            />
          </div>
          <div className="right">
            <ControlButton
              label="Connect"
              disabled={connectDisabled}
              icon={faBolt}
              onClick={connectToRoom}
            />
          </div>
        </div>
      </main>
      <footer>
        This page is built with <a href="https://github.com/livekit/livekit-react">LiveKit React</a>
        &nbsp; (
        <a href="https://github.com/livekit/livekit-react/blob/master/example/src/PreJoinPage.tsx">
          source
        </a>
        )
      </footer>
    </div>
  );
};
