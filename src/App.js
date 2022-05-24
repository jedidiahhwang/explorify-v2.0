import './App.css';

import "bootstrap/dist/css/bootstrap.min.css";

import Login from "./Components/Login.js";
import Dashboard from "./Components/Dashboard.js";

const code = new URLSearchParams(window.location.search).get("code");

function App() {
  return code ? <Dashboard code={code} /> : <Login />
}

export default App;
