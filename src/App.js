import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

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
import React from 'react';

const hideNavs = {
home: false,
about: false,
profile: true,
admin: true,
login: false,
createPass: true
}

function NavBar () {

    return (
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
                <Nav.Link hidden={hideNavs.login} as={Link} to="/login">Login</Nav.Link>
                <Nav.Link hidden={hideNavs.createPass} as={Link} to="/creat_password">Create Account</Nav.Link>
            </Nav>
            </Navbar.Collapse>
        </Container>
    </Navbar>
    );
}

function App() {
    return (
        <div className="App">
            <BrowserRouter>
            
            <NavBar/>

            <Routes>
                <Route path="/" element={<HomePage />}/>
                <Route path="/about" element={<AboutPage />}/>
                <Route path="/profile" element={<ProfilePage />}/>
                <Route path="/admin" element={<AdminPage />}/>
                <Route path="/create_password" element={<CreatePassword />}/>
                <Route path="/login" element={<LoginPage />}/>
            </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;