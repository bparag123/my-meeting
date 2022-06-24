import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';
import JoinMeeting from './components/joinMeeting';
import CreateMeeting from './components/createMeeting';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Outlet />}>
          <Route path=":meetingId" element={<JoinMeeting />} />
          <Route index element={<CreateMeeting />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
