import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Create from "./component/Create";
import Form from "./component/Form";
import Signin from "./Auth/Signin";

function App() {
  return (
    <Router>
      <div>
        {/* Navigation Links */}
        {/* <nav>
          <ul>
            <li>
              <Link to="/create">Create Page</Link>
            </li>
            <li>
              <Link to="/form">Form Page</Link>
            </li>
          </ul>
        </nav> */}

        {/* Define routes for Create and Form components */}
        <Routes>
          <Route path="/" element={<Signin />} />
          <Route path="/create" element={<Create />} />
          <Route path="/form" element={<Form />} />
          <Route path="/signin" element={<Signin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
