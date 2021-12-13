import './App.css';
import SignUp from './components/SignUp';
import LogIn from "./components/LogIn";
import { Route, Routes, HashRouter as Router } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LogIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </Router>
  );
}

export default App;