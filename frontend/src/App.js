import './App.css';
import SignUp from './components/user_auth/SignUp';
import LogIn from "./components/user_auth/LogIn";
import { Route, Routes, BrowserRouter as Router } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/LogIn" element={<LogIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </Router>
  );
}

export default App;