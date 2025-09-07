import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Logout from './services/Logout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import PrivateRoute from './services/PrivateRoute';
import Navbar from './Composants/Navbar';
import Home from './pages/Home';
import './index.css';
import Register from './pages/Register';
import RegisterAdmin from './pages/RegisterAdmin';
import Profil from './pages/Profil';
import Admin from './pages/Admin';
import Apidoc from "./pages/Apidoc";

function App() {
  return (
      <Router>
        <Navbar />
        <Routes>
          <Route path="/doc-api" element={<Apidoc />} />
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path="/registerAdmin" element={<RegisterAdmin />} /> 
          <Route path='/logout' element={<Logout />} />
          <Route
            path='/dashboard'
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
            />
            <Route
            path='/profil'
            element={
              <PrivateRoute>
                <Profil />
              </PrivateRoute>
            }
            />
            <Route
            path='/admin'
            element={
              <PrivateRoute>
                <Admin />
              </PrivateRoute>
            }
            />
        </Routes>
      </Router>
    );
};

export default App;
