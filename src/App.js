import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';

import HomePage from './Home'
import AboutPage from './About'
import ProfilePage from './ProfilePage'
import AdminPage from './AdminPage'
import CreatePassword from './create_password';
import LoginPage from './LoginPage';
import LogoutPage from './LogoutPage';
import SponsorPage from './SponsorPage';
import EditProfilePage from './EditProfilePage';



function App() {
  const auth = useAuth();

  const hideNavs = {
    home: false,
    about: false,
    profile: true,
    admin: true,
    login: false,
    creatPass: true
  }

  return (
    <div className="App">
      <BrowserRouter>
          <Navbar expand="lg" className="bg-body-tertiary">
          <Container>
              <Navbar.Brand href="#home">Safe Drive</Navbar.Brand>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                {!auth.isAuthenticated && <Nav.Link hidden={hideNavs.home} as={Link} to="/">Home</Nav.Link>}
                {!auth.isAuthenticated && <Nav.Link hidden={hideNavs.about} as={Link} to="/about">About</Nav.Link>}
                <Nav.Link hidden={hideNavs.profile} as={Link} to="/profile">Profile</Nav.Link>
                <Nav.Link hidden={hideNavs.admin} as={Link} to="/admin">Admin</Nav.Link>
                <Nav.Link hidden={hideNavs.creatPass} as={Link} to="/create_password">Create Account</Nav.Link>
                {auth.isAuthenticated && <Nav.Link as={Link} to="/SponsorPage">My Dashboard</Nav.Link>}
              </Nav>
              <Nav className="ms-auto">
                {!auth.isAuthenticated && <Nav.Link as={Link} to="/login">Login</Nav.Link>}
                {auth.isAuthenticated && <Nav.Link as={Link} to="/edit_profile">Edit Profile</Nav.Link>}
                {auth.isAuthenticated && <Nav.Link as={Link} to="/logout">Logout</Nav.Link>}
              </Nav>
              </Navbar.Collapse>
          </Container>
        </Navbar>

        <Routes>
          <Route path="/" element={<HomePage />}/>
          <Route path="/about" element={<AboutPage />}/>
          <Route path="/profile" element={<ProfilePage />}/>
          <Route path="/admin" element={<AdminPage />}/>
          <Route path="/create_password" element={<CreatePassword />}/>
          <Route path="/login" element={<LoginPage />}/>
          <Route path="/logout" element={<LogoutPage />}/>
          <Route path="/SponsorPage" element={<SponsorPage />}/>
          <Route path="/edit_profile" element={<EditProfilePage />}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;