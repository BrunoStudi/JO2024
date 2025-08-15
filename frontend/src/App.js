import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Logout from './services/Logout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import PrivateRoute from './services/PrivateRoute';
import Navbar from './Composants/Navbar';
import Home from './pages/Home';
import './index.css';
import Register from './pages/Register';

function App() {
  return (
      <Router>
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/logout' element={<Logout />} />
          <Route
            path='/dashboard'
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
            />
        </Routes>
      </Router>
    );
};

export default App;
