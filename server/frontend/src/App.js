import LoginPanel from "./components/Login/Login";
import Register from "./components/Register/Register"; // 1. Import du composant Register
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPanel />} />
      {/* 2. Ajout de la route pour l'inscription */}
      <Route path="/register" element={<Register />} /> 
    </Routes>
  );
}

export default App;