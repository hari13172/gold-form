import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Create from "./component/Create";
import Form from "./component/Form";
import Signin from "./Auth/Signin";
import { AuthProvider } from "./Auth/AuthContext";
import ProtectedRoute from "./Auth/ProtectedRoute";


const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public route for signing in */}
          <Route path="/signin" element={<Signin />} />

          {/* Protected route: only accessible if the user is signed in */}
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


          {/* Add more protected routes here */}
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
