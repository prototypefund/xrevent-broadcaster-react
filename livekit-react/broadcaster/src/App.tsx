import '@livekit/react-components/dist/index.css';
import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { PreJoinPageSub } from './PreJoinPageSub';
import { PreJoinPage } from './PreJoinPage';
import { RoomPage } from './RoomPage';

const App = () => {
  return (
    <div className="container">
      <React.StrictMode>
        <Router>
          <Routes>
            <Route path="/room" element={<RoomPage />} />
            <Route path="/" element={<PreJoinPageSub />} />
            <Route path="/provider" element={<PreJoinPage />} />
          </Routes>
        </Router>
      </React.StrictMode>
    </div>
  );
};

export default App;
