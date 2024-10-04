import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainPage } from "../pages/mainpage";
import { ErrorPage } from "../pages/errorpage";

const App = () => {
  return (
    <BrowserRouter>
      <div className="bg-white">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/*" element={<ErrorPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
