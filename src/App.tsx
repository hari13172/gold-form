import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Create from "./component/Create";
import Form from "./component/Form";
import Signin from "./Auth/Signin";
import { AuthProvider } from "./Auth/AuthContext";
import ProtectedRoute from "./Auth/ProtectedRoute";
import DueDate from "./component/DueDate";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Default route: Redirect to the Signin page */}
          <Route path="/" element={<Navigate to="/signin" />} />

          {/* Public route for signing in */}
          <Route path="/signin" element={<Signin />} />

          {/* Protected routes: only accessible if the user is signed in */}
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <Create />
              </ProtectedRoute>
            }
          />

          <Route
            path="/form"
            element={
              <ProtectedRoute>
                <Form />
              </ProtectedRoute>
            }
          />

          <Route
            path="/duedate"
            element={
              <ProtectedRoute>
                <DueDate />
              </ProtectedRoute>
            }
          />

          {/* Add more protected routes here */}
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
