import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useAuth } from "react-oidc-context";

import HomePage from './Home'
import AboutPage from './About'
import ProfilePage from './ProfilePage'
import AdminPage from './AdminPage'
import CreatePassword from './create_password';
import LoginPage from './LoginPage';
import React, { useState } from 'react';
import Catalog from './Catalog';
import SponsorPage from './SponsorPage';

function App() {
  const auth = useAuth();

  const hideNavs = {
    home: false,
    about: false,
    profile: true,
    admin: true,
    login: auth?.isLoading || auth?.isAuthenticated,
    creatPass: true
  }

  return (
    <div className="App">
          <Navbar expand="lg" className="bg-body-tertiary">
          <Container>
              <Navbar.Brand href="#home">Safe Drive</Navbar.Brand>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link hidden={hideNavs.home} as={Link} to="/">Home</Nav.Link>
                <Nav.Link hidden={hideNavs.about} as={Link} to="/about">About</Nav.Link>
                <Nav.Link hidden={hideNavs.profile} as={Link} to="/profile">Profile</Nav.Link>
                <Nav.Link hidden={hideNavs.admin} as={Link} to="/admin">Admin</Nav.Link>
                <Nav.Link hidden={hideNavs.creatPass} as={Link} to="/create_password">Create Account</Nav.Link>
                <Nav.Link hidden={hideNavs.login} as={Link} to="/login">Login</Nav.Link>
              </Nav>
              </Navbar.Collapse>
          </Container>
        </Navbar>
 
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />}/>
                <Route path="/about" element={<AboutPage />}/>
                <Route path="/profile" element={<ProfilePage />}/>
                <Route path="/admin" element={<AdminPage />}/>
                <Route path="/create_password" element={<CreatePassword />}/>
                <Route path="/login" element={<LoginPage />}/>
                <Route path="/SponsorPage" element={<SponsorPage />}/>
                <Route path="/catalog" element={<Catalog />}/>
            </Routes>
        </BrowserRouter>
    </div>
  );
}

export default App;