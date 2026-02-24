import { Container, Row, Col, Stack, Card } from 'react-bootstrap';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Form from "react-bootstrap/Form"
import Tabs from "react-bootstrap/Tabs"
import Tab from"react-bootstrap/Tab"
export default function AdminPage(){
  
  const [drivers, setDrivers] = useState([
    { id: 1, name: "Bo Darvilel", points: 200 },
    { id: 2, name: "Cledus Snow", points: 156 },
    { id: 3, name: "Hot-Pants Hillard", points: 186 },
    { id: 4, name: "Burt Reynolds", points: 330 },
    { id: 5, name: "Jerry Reed", points: 300 }
  ]);

  const [selectedId, setSelectedId] = useState(1);
  const [amount, setAmount] = useState(10);
  const [sortMode, setSortMode] = useState("id");
  const [description, setDescription] = useState("");
  const [logs, setLogs] = useState([]);
  const pointAdjust = (value) => {
    const timestamp = new Date().toLocaleString();
    setDrivers(prev =>
      prev.map(d =>
        d.id === selectedId ? { ...d, points: d.points + value } : d
      )
    );
    setLogs(prev => [
      {
        driver: selectedDriver.name,
        change: value,
        reason: description || "No Reason Provided",
        time: timestamp
      },
      ...prev
    ]);
    setDescription("");
  };
  const sortedDrivers = [...drivers].sort((a, b) => {
    if (sortMode === "points") return b.points - a.points;
    if (sortMode === "id") return a.id - b.id;
    return 0;
  });
    
    const navigate = useNavigate();

  return(
    <Container className="mt-4">
      <div style={{ position: "relative", minHeight: "100vh", padding: "40px" }}>
        <h1><strong>Admin Dashboard</strong></h1>
        <div style={{ padding: 20, borderRedius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.1)"}}>
          <h5>Assign Points(mock)</h5>
          <p>Select a driver to add/subtract points</p>
          <ul style={{ textAlign: "left"}}>
            <li>Driver: Breaker_1-9</li>
            <li>Action: +10 / -10 buttons (next)</li>
            <li>Reason: "Package Delivered On Time"</li>
          </ul>
        </div>
      </div>
    </Container>
  );
}