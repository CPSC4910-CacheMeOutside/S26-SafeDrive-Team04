import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Image from 'react-bootstrap/Image';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { useEffect, useState } from 'react';
import { NavDropdown } from 'react-bootstrap';

import HomePage from './Home'
import AboutPage from './About'
import ProfilePage from './ProfilePage'
import AdminPage from './AdminPage'
import CreatePassword from './create_password';
import LoginPage from './LoginPage';
import LogoutPage from './LogoutPage';
import Catalog from './Catalog';
import SponsorPage from './SponsorPage';
import EditProfilePage from './EditProfilePage';
import Sponsor_ViewDrivers from './Sponsor_ViewDrivers';

function NavBar({ view, profilePic }) {
    const auth = useAuth(); 

    return (
        <Navbar expand="lg" className="bg-body-tertiary">
            <Container>
                <Navbar.Brand as={Link} to="/">Safe Drive</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        {!auth.isAuthenticated && (<Nav.Link as={Link} to="/">Home</Nav.Link>)}
                        {!auth.isAuthenticated && (<Nav.Link as={Link} to="/about">About</Nav.Link>)}
                        <Nav.Link hidden={view === 0} as={Link} to="/profile">Profile</Nav.Link>
                        <Nav.Link hidden={view !== 3} as={Link} to="/admin">Admin</Nav.Link>
                        <Nav.Link hidden={view !== 2} as={Link} to="/catalog">Catalog</Nav.Link>
                        <Nav.Link hidden={view !== 3} as={Link} to="/create_password">Create Account</Nav.Link>
                        {auth.isAuthenticated && (<Nav.Link as={Link} to="/SponsorPage">My Dashboard</Nav.Link>)}
                    </Nav>
                    <Nav className="ms-auto align-items-center">
                        {!auth.isAuthenticated && (<Nav.Link as={Link} to="/login">Login</Nav.Link>)}
                        {auth.isAuthenticated && (
                            <div className="d-flex align-items-center">
                                <span className="me-2">
                                    {auth.user?.profile?.email}
                                </span>
                                <NavDropdown
                                    title={
                                        <Image
                                            src={profilePic || "/profileTestPic.jpg"}
                                            roundedCircle
                                            width={50}
                                            height={50}
                                        />
                                    }
                                    id="profile-dropdown"
                                    align="end"
                                >
                                    <NavDropdown.Item as={Link} to="/edit_profile">Edit Profile</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item as={Link} to="/logout">Logout</NavDropdown.Item>
                                </NavDropdown>
                            </div>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

function App() {
    const auth = useAuth(); 
    const navigate = useNavigate();
    const location = useLocation();

    const [profilePic, setProfilePic] = useState(
        auth.user?.profile?.picture || "/profileTestPic.jpg"
    );

    const [userClass, setUserClass] = useState(0);

    function setClass(cls) {
        if (cls <= 3) {
            setUserClass(cls);
            return;
        }
        console.log(`'${cls}' is not a valid user class`);
    }

    // Redirect sponsor users to dashboard
    useEffect(() => {
        if (!auth.isAuthenticated) return;

        const groups = auth.user?.profile?.["cognito:groups"];

        if (
            groups?.includes("Sponsor") &&
            (location.pathname === "/" || location.pathname === "/login")
        ) {
            navigate("/SponsorPage", { replace: true });
        }

        setProfilePic(
            auth.user?.profile?.picture || "/profileTestPic.jpg"
        );

    }, [auth.isAuthenticated, location.pathname, auth.user, navigate]);

    return (
        <div className="App">

            <NavBar
                view={userClass}
                profilePic={profilePic}
            />

            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/create_password" element={<CreatePassword />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/logout" element={<LogoutPage />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/SponsorPage" element={<SponsorPage />} />
                <Route
                    path="/edit_profile"
                    element={
                        <EditProfilePage
                            profilePic={profilePic}
                            setProfilePic={setProfilePic}
                        />
                    }
                />
                <Route path="/sponsor_viewDrivers" element={<Sponsor_ViewDrivers />} />
            </Routes>
        </div>
    );
}

export default App;