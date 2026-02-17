import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Image from 'react-bootstrap/Image';
import { NavDropdown } from 'react-bootstrap';
import { Route, Routes, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { useEffect, useState, useRef } from 'react';

import HomePage from './Home'
import AboutPage from './About'
import ProfilePage from './ProfilePage'
import AdminPage from './AdminPage'
import CreatePassword from './create_password';
import LoginPage from './LoginPage';
import LogoutPage from './LogoutPage';
import SponsorPage from './SponsorPage';
import EditProfilePage from './EditProfilePage';
import ConversionRatioProvider from './ConversionRatioContext';
import NotificationProvider from './NotificationContext';
import PointsProvider from './PointsContext';
import Catalog from './Catalog';


function App() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectedSubRef = useRef(null);

  const groups = auth.user?.profile?.["cognito:groups"] || [];
  
  // temporary until backend gets setup
  const [profilePic, setProfilePic] = useState(auth.user?.profile?.picture || "./profileTestPic.jpg");

  const hideNavs = {
    home: false,
    about: false,
    profile: true,
    login: false,
    creatPass: true
  }

  // after a successful login, redirects users to their dashboard based on their group role (admin, driver, or sponsor)
  useEffect(() => {
    if (!auth.isAuthenticated) {
        redirectedSubRef.current = null;
        return;
    }
    if (auth.isLoading || !auth.user?.profile) return;
    if (location.pathname !== "/callback") return;

    const sub = auth.user.profile.sub;
    if (redirectedSubRef.current === sub) return;

    const groups = auth.user.profile?.["cognito:groups"] || [];

    let destination = "/";
    if (groups.includes("Admin")) {
        destination = "/admin";
    } else if (groups.includes("Sponsor")) {
        destination = "/SponsorPage";
    }

    redirectedSubRef.current = sub;
    navigate(destination, { replace: true });

    setProfilePic(auth.user.profile?.picture || "./profileTestPic.jpg");
  }, [auth.isAuthenticated, auth.isLoading, auth.user, location.pathname, navigate]);

  return (
    <div className="App">
        <Navbar expand="lg" className="bg-body-tertiary">
          <Container>
              <Navbar.Brand href="#home">Safe Drive</Navbar.Brand>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                {!auth.isAuthenticated && <Nav.Link hidden={hideNavs.home} as={Link} to="/">Home</Nav.Link>}
                {!auth.isAuthenticated && <Nav.Link hidden={hideNavs.about} as={Link} to="/about">About</Nav.Link>}
                <Nav.Link hidden={hideNavs.profile} as={Link} to="/profile">Profile</Nav.Link>
                <Nav.Link hidden={hideNavs.creatPass} as={Link} to="/create_password">Create Account</Nav.Link>
                {auth.isAuthenticated && groups.includes("Admin") && (<Nav.Link as={Link} to="/admin">My Dashboard</Nav.Link>)}
                {auth.isAuthenticated && groups.includes("Sponsor") && (<Nav.Link as={Link} to="/SponsorPage">My Dashboard</Nav.Link>)}
                <Nav.Link as={Link} to="/Catalog">Catalog</Nav.Link>
              </Nav>
              <Nav className="ms-auto align-items-center">
                {!auth.isAuthenticated && <Nav.Link onClick={() => auth.signinRedirect()}>Login</Nav.Link>}
                {auth.isAuthenticated &&
                  <div className="d-flex align-items-center">
                    <span className="me-2">{auth.user?.profile?.email}</span>
                    <NavDropdown
                      title={
                        <Image
                          src={profilePic || "./profileTestPic.jpg" }
                          roundedCircle
                          width={50}
                          height={50}/>
                      }
                      id="profile-dropdown"
                      align="end"
                    >
                      <NavDropdown.Item as={Link} to="/edit_profile">Edit Profile</NavDropdown.Item>
                      <NavDropdown.Divider />
                      <NavDropdown.Item as={Link} to="/logout">Logout</NavDropdown.Item>
                    </NavDropdown>
                  </div>
                }
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
          <Route path="/edit_profile" element={<EditProfilePage profilePic={profilePic} setProfilePic={setProfilePic} />}/>
          <Route path="/Catalog" element={<Catalog />}/>
          <Route path="/ConversionRatioContext" element={<ConversionRatioProvider />}/>
          <Route path="/NotificationContext" element={<NotificationProvider />}/>
          <Route path="/PointsContext" element={<PointsProvider />}/>
          <Route path="/callback" element={<div>Logging in...</div>} />
        </Routes>
    </div>
  );
}

export default App;