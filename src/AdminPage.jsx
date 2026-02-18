import { Container, Row, Col, Stack, Card } from 'react-bootstrap';

export default function AdminPage(){
  return(
    <Container className="py-4" style={{ maxWidth: 800}}>
      <h2 className="mb-3">Admin Panel</h2>

      <div style={{ padding: 20, borderRedius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.1)"}}>
        <h5>Assign Points(mock)</h5>
        <p>Select a driver to add/subtract points</p>
        <ul style={{ textAlign: "left"}}>
          <li>Driver: Breaker_1-9</li>
          <li>Action: +10 / -10 buttons (next)</li>
          <li>Reason: "Package Delivered On Time"</li>
        </ul>
      </div>
    </Container>
  );
}