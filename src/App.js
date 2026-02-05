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

function ProfilePage(){
  const alias = "Breaker_1-9";
  const points = 144;
  return(
    <Container className="py-4" style={{ maxWidth: 700 }}>
      <h2 classname="mb-3">Driver Profile</h2>

      <div style={{
        padding: 20,
        borderRadius: 10,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <h4>{alias}</h4>
        <div style={{ fontsize: 14, opacity: 0.7}}>Current Points</div>
        <div style={{ fontsize: 40, fontweight: 700}}>{points}</div>
      </div>

    </Container>
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
          {/* login path to be implemented */}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
