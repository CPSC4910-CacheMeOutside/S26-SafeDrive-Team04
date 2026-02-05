import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button'
import './App.css';

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

/* Login component to be implemented 
*/



function AboutPage () {
  return (
    <div>
      <h1>About our App</h1>
    </div>
  );
}

function HomePage () {
  return (
    <div>
      <h1>Welcome Home</h1>
    </div>
  );
}





function App() {
  return (
    <div className="App">
      <BrowserRouter>

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
                  {/* Login path to be implemented*/}
                  <Link to="/">Login</Link>
                </Nav.Link>
            </Nav>
            </Navbar.Collapse>
        </Container>
        </Navbar>

        <Routes>
          <Route path="/" element={<HomePage />}/>
          <Route path="/about" element={<AboutPage />}/>
          <Route path="/profile" element={<ProfilePage />}/>
          <Route path="/admin" element={<AdminPage />}></Route>
          {/* login path to be implemented */}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
