import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Logout from './services/Logout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import PrivateRoute from './services/PrivateRoute';
import Navbar from './services/Navbar';

function App() {
  return (
      <Router>
        <Navbar />
        <Routes>
          <Route path='/login' element={<Login />} />
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
