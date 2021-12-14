import "./App.css";
import SignUp from "./components/auth/SignUp";
import LogIn from "./components/auth/LogIn";
import Developer_Menu from "./components/developer/menu";
import Manager_Menu from "./components/manager/menu";
import Manager_Insert from "./components/manager/insert";
import Manager_View from "./components/manager/view";
import Manager_Edit from "./components/manager/edit";
import axios from "axios";
import { Route, Routes, BrowserRouter as Router } from "react-router-dom";

axios.interceptors.request.use(
  config => {
    config.headers.authorization = `Bearer ${localStorage.getItem("token")}`;
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/LogIn" element={<LogIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/developer_menu" element={<Developer_Menu />} />
        <Route path="/manager_menu" element={<Manager_Menu />} />
        <Route path="/manager_insert" element={<Manager_Insert />} />
        <Route path="/manager_view" element={<Manager_View />} />
        <Route path="/manager_edit" element={<Manager_Edit />} />
      </Routes>
    </Router>
  );
}

export default App;
