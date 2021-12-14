import './App.css';
import SignUp from './components/auth/SignUp';
import LogIn from './components/auth/LogIn';
import Developer_Menu from './components/developer/menu';
import { Route, Routes, BrowserRouter as Router } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/LogIn" element={<LogIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/developer_menu" element={<Developer_Menu />} />
      </Routes>
    </Router>
  );
}

export default App;