import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider } from 'styled-components'
import { lightTheme, MeetingProvider, BackgroundBlurProvider, BackgroundReplacementProvider } from 'amazon-chime-sdk-component-library-react';
// import WhiteBoard from './components/whiteBoard';
// import MeetingView from './components/meeting';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider theme={lightTheme}>
    <BackgroundReplacementProvider>
      <BackgroundBlurProvider>
        <MeetingProvider>
          <App />
        </MeetingProvider>
      </BackgroundBlurProvider>
    </BackgroundReplacementProvider>
  </ThemeProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

