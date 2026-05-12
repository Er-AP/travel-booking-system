import { useState } from "react";
import "./index.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [isLogin, setIsLogin] = useState(true);
  const token = localStorage.getItem("token");
  if (token) return <Dashboard />;
  return isLogin
    ? <Login setIsLogin={setIsLogin} />
    : <Register setIsLogin={setIsLogin} />;
}