import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Settings from "./pages/Settings";
import Draft from "./pages/Draft";
import Write from "./pages/Write";
import CoWrite from "./pages/CoWrite";

import TestProvider from "./redux-test/TestProvider";
import DraftTest from "./redux-test/DraftTest";
import WriteTest from "./redux-test/WriteTest";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/draft" element={<Draft />} />
        <Route path="/write" element={<Write />} />
        <Route path="/co-write" element={<CoWrite />} />
        <Route
  path="/redux-test"
  element={
    <TestProvider>
      <DraftTest />
    </TestProvider>
  }
/>

<Route
  path="/redux-test/write"
  element={
    <TestProvider>
      <WriteTest />
    </TestProvider>
  }
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
