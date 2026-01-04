import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Settings from "./pages/Settings";
import Draft from "./pages/Draft";
import Write from "./pages/Write";
import CoWrite from "./pages/CoWrite";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/draft" element={<Draft />} />
        <Route path="/write" element={<Write />} />
        <Route path="/co-write" element={<CoWrite />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
