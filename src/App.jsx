import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import Journal from "./pages/Journal";
import Reminders from "./pages/Reminders";
import Archive from "./pages/Archive";
import Progress from "./pages/Progress";
import Stocks from "./pages/Stocks";
import Welcome from "./pages/Welcome";

function App() {
  const isAuthenticated = true; // Replace with your actual auth check

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <Welcome />} />
        <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/signin" />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/journal" element={isAuthenticated ? <Journal /> : <Navigate to="/signin" />} />
        <Route path="/reminders" element={isAuthenticated ? <Reminders /> : <Navigate to="/signin" />} />
        <Route path="/archive" element={isAuthenticated ? <Archive /> : <Navigate to="/signin" />} />
        <Route path="/progress" element={isAuthenticated ? <Progress /> : <Navigate to="/signin" />} />
        <Route path="/stocks" element={isAuthenticated ? <Stocks /> : <Navigate to="/signin" />} />
      </Routes>
    </Router>
  );
}

export default App;