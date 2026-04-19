import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { HiOutlineEnvelope } from "react-icons/hi2"
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Image from 'react-bootstrap/Image';
import { Button, NavDropdown } from 'react-bootstrap';
import { useFontSize } from './FontSizeContext';
import { useLanguage, LANGUAGE_NAMES } from './LanguageContext';
import { Route, Routes, Link, useLocation, useNavigate } from 'react-router-dom';
import useAmplifyAuth from './UseAmplifyAuth';
import { useEffect, useState, useRef } from 'react';

import HomePage from './Home'
import AboutPage from './About'
import AdminPage from './AdminPage'
import AdminAccountTakeover from './AdminAccountTakeover';
import LoginPage from './LoginPage';
import AccountManagement from './AccountManagement';
import SponsorPage from './SponsorPage';
import DriverPage from './DriverPage';
import EditProfilePage from './EditProfilePage';
import ConversionRatioProvider from './ConversionRatioContext';
import NotificationProvider from './NotificationContext';
import PointsProvider from './PointsContext';
import CatalogBuilder from './CatalogBuilder';
import SponsorCatalog from "./SponsorCatalog";
import SponsorNotificationsPage from './SponsorNotificationsPage';
import DriverNotificationsPage from './DriverNotificationsPage';
import DriverApplication from './DriverApplication';
import SponsorApplication from './SponsorApplication';
import SponsorListings from './Available-Sponsors';
import AdminSponsorViewPage from "./AdminSponsorViewPage";
import AdminSponsorAccountEdit from './AdminSponsorAccountEdit';
import UpdateAbout from './UpdateAbout';

function App() {

  /* Nav config */
  const { fontSize, cycleFontSize } = useFontSize();
  const { language, setLanguage, t } = useLanguage();
  const auth = useAmplifyAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectedSubRef = useRef(null);

  const groups = auth.groups || [];
  
  // temporary until backend gets setup
  const [profilePic, setProfilePic] = useState("./profileTestPic.jpg");
 
  const hideNavs = {
    home: false,
    about: false,
    login: false,
  }

  // after a successful login, redirects users to their dashboard based on their group role (admin, driver, or sponsor)
  useEffect(() => {
    if (!auth.isAuthenticated) {
        redirectedSubRef.current = null;
        return;
    }
    if (auth.isLoading || !auth.profile) return;
    if (location.pathname !== "/callback") return;

    const sub = auth.profile?.sub;
    if (redirectedSubRef.current === sub) return;

    let destination = "/";
    if (groups.includes("Admin")) {
        destination = "/AdminPage";
    } else if (groups.includes("Sponsor")) {
        destination = "/SponsorPage";
    } else if (groups.includes("Driver")) {
        destination = "/DriverPage";
    }

    redirectedSubRef.current = sub;
    navigate(destination, { replace: true });

    setProfilePic(auth.profile?.picture || "./profileTestPic.jpg");
  }, [auth.isAuthenticated, auth.isLoading, auth.user, location.pathname, navigate]);

  return (
    <div className="App">
        <Navbar expand="lg" className="custom-navbar" variant="dark">
          <Container fluid>
              {!auth.isAuthenticated && (<Navbar.Brand href="#home">Safe Drive</Navbar.Brand>)}
              {auth.isAuthenticated && groups.includes("Admin") && (<Navbar.Brand href="#home">Safe Drive (Admin)</Navbar.Brand>)}
              {auth.isAuthenticated && groups.includes("Driver") && (<Navbar.Brand href="#home">Safe Drive (Driver)</Navbar.Brand>)}
              {auth.isAuthenticated && groups.includes("Sponsor") && (<Navbar.Brand href="#home">Safe Drive (Sponsor)</Navbar.Brand>)}
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                {!auth.isAuthenticated && <Nav.Link hidden={hideNavs.home} as={Link} to="/">Home</Nav.Link>}
               
                {auth.isAuthenticated && groups.includes("Admin") && (<Nav.Link as={Link} to="/AdminPage">My Dashboard</Nav.Link>)}

                {auth.isAuthenticated && groups.includes("Driver") && (<Nav.Link as={Link} to="/DriverPage">My Dashboard</Nav.Link>)}
                {auth.isAuthenticated && groups.includes("Driver") && (<Nav.Link as={Link} to="/sponsor-list" aria-label="Apply">Apply</Nav.Link>)}
                {auth.isAuthenticated && groups.includes("Driver") && (<Nav.Link as={Link} to="/sponsor-catalog">Catalog</Nav.Link>)}
                {auth.isAuthenticated && groups.includes("Driver") && (<Nav.Link as={Link} to="/driver-notifications" aria-label="Driver Notifications">Driver Notif</Nav.Link>)}

                {auth.isAuthenticated && groups.includes("Sponsor") && (<Nav.Link as={Link} to="/SponsorPage">My Dashboard</Nav.Link>)}
                {auth.isAuthenticated && groups.includes("Sponsor") && (<Nav.Link as={Link} to="/sponsor-application">Sponsor Application</Nav.Link>)}
                {auth.isAuthenticated && groups.includes("Sponsor") && (<Nav.Link as={Link} to="/CatalogBuilder">Catalog</Nav.Link>)}
                {auth.isAuthenticated && groups.includes("Sponsor") && (<Nav.Link as={Link} to="/sponsor-notifications" aria-label="Sponsor Notifications">Sponsor Notif</Nav.Link>)}
                <NavDropdown
                  title={LANGUAGE_NAMES[language]}
                  id="language-dropdown"
                  className="me-2"
                  aria-label={t('navbar.language')}
                >
                  {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                    <NavDropdown.Item
                      key={code}
                      onClick={() => setLanguage(code)}
                      active={language === code}
                    >
                      {name}
                    </NavDropdown.Item>
                  ))}
                </NavDropdown>
              </Nav>
              <Nav className="ms-auto align-items-center">
                {!auth.isAuthenticated && <Nav.Link onClick={() => auth.signupRedirect()}>Sign Up</Nav.Link>}
                {!auth.isAuthenticated && <Nav.Link onClick={() => auth.signinRedirect()}>Login</Nav.Link>}
                {auth.isAuthenticated &&
                  <div className="d-flex align-items-center gap-2">
                    <span className="me-2" style={{ fontSize: "18px", color: "#d1d5db" }}>{auth.profile?.email}</span>
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
                      <NavDropdown.Item as={Link} to="/edit_profile">{t('navbar.editProfile')}</NavDropdown.Item>
                      <NavDropdown.Divider />
                      <NavDropdown.Item as={Link} to="/AccountManagement">{t('navbar.accountSettings')}</NavDropdown.Item>
                      <NavDropdown.Divider />
                      <NavDropdown.Item onClick={() => auth.signoutRedirect()}>{t('navbar.logout')}</NavDropdown.Item>
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
          <Route path="/updateAbout" element={<UpdateAbout />}/>
          <Route path="/AdminPage" element={<AdminPage />}/>
          <Route path="/admin/drivers/:driverId/edit" element={<AdminAccountTakeover />} />
          <Route path="/login" element={<LoginPage />}/>
          <Route path="/AccountManagement" element={<AccountManagement />}/>
          <Route path="/SponsorPage" element={<SponsorPage />}/>
          <Route path="/DriverPage" element={<DriverPage />}/>
          <Route path="/edit_profile" element={<EditProfilePage profilePic={profilePic} setProfilePic={setProfilePic} />}/>
          <Route path="/CatalogBuilder" element={<CatalogBuilder />}/>
          <Route path="/sponsor-notifications" element={<SponsorNotificationsPage />}/>
          <Route path="/driver-notifications" element={<DriverNotificationsPage />}/>
          <Route path="/ConversionRatioContext" element={<ConversionRatioProvider />}/>
          <Route path="/NotificationContext" element={<NotificationProvider />}/>
          <Route path="/PointsContext" element={<PointsProvider />}/>
          <Route path="/sponsor-catalog" element={<SponsorCatalog sponsorId={1}/>}/>
          <Route path="/callback" element={<div>{t('common.loading')}</div>} />
          <Route path="/sponsor-list" element={<SponsorListings />} />
            {
            /* These imbeded routes are a proof of concept. Future versions will autopoulate these sub routes with 
             one route from each registered sponsor. Sponsors will be passed via objects similar to those below. 
             Application pages intake the sponsored user being applied to and use for processing.
             
             - Louis 
             */}
          <Route path="/application/:appliedSponsor" element={<DriverApplication appliedSponsor />} />
          <Route path="/sponsor-application" element={<SponsorApplication />} />
          <Route path="/admin/sponsors/:sponsorId/edit" element={<AdminSponsorAccountEdit />} />
          <Route path="/admin/sponsors/:sponsorId/view" element={<AdminSponsorViewPage />} />
        </Routes>
    </div>
  );
}
 
export default App;