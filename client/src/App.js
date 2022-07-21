import { HashRouter, Outlet, Route, Routes } from 'react-router-dom';
import JoinMeeting from './components/joinMeeting';
import CreateMeeting from './components/createMeeting';
import "./layout/App.scss"
import Dashboard from './components/Dashboard';

function App() {

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Outlet />}>
          <Route path=":meetingId" element={<JoinMeeting />} />
          <Route index element={<CreateMeeting />} />
          <Route path="dashboard/:meetingId" element={<Dashboard />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
