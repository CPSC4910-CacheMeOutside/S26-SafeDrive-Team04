import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { useState } from 'react';

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import HomePage from './Home'
import AboutPage from './About'
import ProfilePage from './ProfilePage'
import AdminPage from './AdminPage'
import CreatePassword from './create_password';
import LoginPage from './LoginPage';
<<<<<<< Updated upstream
import React, { useState } from 'react';
import Catalog from './Catalog';

function NavBar ({view}) {
    return (
        <Navbar expand="lg" className="bg-body-tertiary">
        <Container>
            <Navbar.Brand href="#home">Safe Drive</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
            <Nav id="navbar" className="me-auto">
                <Nav.Link as={Link} to="/">Home</Nav.Link>
                <Nav.Link as={Link} to="/about">About</Nav.Link>
                <Nav.Link hidden={view === 0} as={Link} to="/profile">Profile</Nav.Link>
                <Nav.Link hidden={view !== 3} as={Link} to="/admin">Admin</Nav.Link>
                <Nav.Link hidden={view !== 2} as={Link} to="/catalog">Catalog</Nav.Link> 
                <Nav.Link hidden={view !== 0} as={Link} to="/login">Login</Nav.Link>
                <Nav.Link hidden={view !== 3} as={Link} to="/create_password">Create Account</Nav.Link>
            </Nav>
            </Navbar.Collapse>
        </Container>
    </Navbar>
    );
}

function App() {
    
    const [userClass, setUserClass] = useState(0);

    function setClass (cls) {
        if (cls <= 3)
        {
            setUserClass(cls);
            return;
        }
        console.log(`'${cls}' is not a valid user class`);
    }

    return (
        <div className="App">
            <BrowserRouter>
            
            <NavBar view={userClass}/>

            <Routes>
                <Route path="/" element={<HomePage />}/>
                <Route path="/about" element={<AboutPage />}/>
                <Route path="/profile" element={<ProfilePage />}/>
                <Route path="/admin" element={<AdminPage />}/>
                <Route path="/create_password" element={<CreatePassword />}/>
                <Route path="/login" element={<LoginPage />}/>
                <Route path="/catalog" element={<Catalog />}/>
            </Routes>
            </BrowserRouter>
        </div>
    );
=======
import SponsorSettingsPage from './SponsorSettingsPage';
import TransactionHistoryModal from './components/TransactionHistoryModal';
import SpendPointsModal from './components/SpendPointsModal';

function AppNavbar({ onShowTransactionHistory, onShowSpendPoints }) {
  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="#home">Safe Drive</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#home">
              <Link to="/">Home</Link>
            </Nav.Link>
            <Nav.Link href="#link">
              <Link to="/about">About</Link>
            </Nav.Link>
            <Nav.Link href="#link">
              <Link to="/profile">Profile</Link>
            </Nav.Link>
            <Nav.Link href="#link">
              <Link to="/admin">Admin</Link>
            </Nav.Link>
            <Nav.Link href="#link">
              <Link to="/sponsor-settings">Sponsor Settings</Link>
            </Nav.Link>
            <Nav.Link onClick={onShowTransactionHistory}>
              My Points History
            </Nav.Link>
            <Nav.Link onClick={onShowSpendPoints}>
              Spend Driver Points
            </Nav.Link>
            <Nav.Link href="#link">
              <Link to="/login">Login</Link>
            </Nav.Link>
            <Nav.Link href="#link">
              <Link to="/create_password">Create Account</Link>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

function App() {
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [showSpendPoints, setShowSpendPoints] = useState(false);

  return (
    <div className="App">
      <BrowserRouter>
        <AppNavbar
          onShowTransactionHistory={() => setShowTransactionHistory(true)}
          onShowSpendPoints={() => setShowSpendPoints(true)}
        />

        <Routes>
          <Route path="/" element={<HomePage />}/>
          <Route path="/about" element={<AboutPage />}/>
          <Route path="/profile" element={<ProfilePage />}/>
          <Route path="/admin" element={<AdminPage />}/>
          <Route path="/sponsor-settings" element={<SponsorSettingsPage />}/>
          <Route path="/create_password" element={<CreatePassword />}/>
          <Route path="/login" element={<LoginPage />}/>
        </Routes>

        <TransactionHistoryModal
          show={showTransactionHistory}
          onHide={() => setShowTransactionHistory(false)}
          driverAlias="Breaker_1-9"
        />

        <SpendPointsModal
          show={showSpendPoints}
          onHide={() => setShowSpendPoints(false)}
        />
      </BrowserRouter>
    </div>
  );
>>>>>>> Stashed changes
}

export default App;