import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import VideoCapture from './components/VideoCapture'

function App() {
  const videoJsOptions = {
    controls: false,
    bigPlayButton: false,
    width: 2,
    height: 2,
    fluid: false,
    plugins: {
      record: {
        audio: true,
        /*   video: true, */
        video: {
          // video media constraints: set resolution of camera
          width: { min: 1280, ideal: 640, max: 1920 },
          height: { min: 920, ideal: 480, max: 1080 }
        },
        // dimensions of captured video frames
        frameWidth: 1920,
        frameHeight: 1080,
        maxLength: 10,
        debug: true,
      }
    }
  };
  return (
    <Router>
      <Routes>

        <Route exact path='/' element={< VideoCapture {...videoJsOptions} />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
