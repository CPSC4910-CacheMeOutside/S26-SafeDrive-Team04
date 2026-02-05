import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import CreatePassword from './create_password';

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
                  <Link to="/Home">Home</Link>
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
                  <Link to="/login">Login</Link>
                </Nav.Link>
                <Nav.Link href="#link">
                  <Link to="/">Create Account</Link>
                </Nav.Link>
            </Nav>
            </Navbar.Collapse>
        </Container>
        </Navbar>

        <Routes>
          <Route path="/" element={<CreatePassword />}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;