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


function SponsorPage() {
    
    const [drivers, setDrivers] = useState([
        {id: 1, name: "Bo Darvilel", points: 200},
        {id: 2, name: "Cledus Snow", points: 156},
        {id: 3, name: "Hot-Pants Hillard", points: 186},
        {id: 4, name: "Burt Reynolds", points: 330},
        {id: 5, name: "Jerry Reed", points: 300}
    ]);

    const [selectedId, setSelectedId] = useState(1);
    const [amount, setAmount] = useState(10);
    const [sortMode, setSortMode] = useState("id");
    const [description, setDescription] = useState("");
    const [logs, setLogs] = useState([]);

    const selectedDriver = drivers.find(d => d.id === selectedId);

    const pointAdjust = (value) => {
        const timestamp = new Date().toLocaleString();
            setDrivers(prev =>
                prev.map(d =>
                    d.id === selectedId ? {...d, points: d.points + value } : d
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
    
    const sortedDrivers = [...drivers].sort((a,b) => {
        if (sortMode === "points") return b.points - a.points;
        if (sortMode === "id") return a.id - b.id;
        return 0;
    });
    
    const navigate = useNavigate();
  return(
            <Container className="mt-4">
              <div style={{ position: "relative", minHeight: "100vh", padding: "30px" }}>  
                <h1 className="mb-3">Sponsor Dashboard</h1>
                <Tabs defaultActiveKey="manage" className="mb-3">
                    <Tab eventKey="manage" title="Manage Drivers">
                        <Row>
                            <Col md={4}>
                                <Card>
                                    <Card.Body>
                                        <Card.Title>Drivers</Card.Title>
                                        <div className="mb-2 d-flex gap-2">
                                            <Button
                                                size="sm"
                                                variant={sortMode === "points" ? "primary" : "outline-primary"}
                                                onClick={() => setSortMode("points")}
                                                >
                                                    Sort by Points
                                                </Button>
                                            
                                            <Button
                                                size="sm"
                                                variant={sortMode === "id" ? "primary" : "outline-primary"}
                                                onClick={() => setSortMode("id")}
                                                >
                                                    Sort by ID
                                                </Button>
                                        </div>
                                        <ListGroup>
                                            {sortedDrivers.map(driver => (
                            
                                            <ListGroup.Item
                                                key={driver.id}
                                                action
                                                active={driver.id === selectedId}
                                                onClick={() => setSelectedId(driver.id)}
                                                >
                                              <div className="d-flex justify-content-between">
                                                <span>{driver.name}</span>
                                                <span className="test-muted">{driver.points}</span>
                                                </div>  
                                            </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    </Card.Body>
                                </Card>
                            </Col>
                            
                            <Col md={8}>
                              <Card>
                                <Card.Body>
                                    <Card.Title>Adjust Points</Card.Title>

                                    <p>
                                        Driver: <strong>{selectedDriver.name}</strong><br />
                                        Current Points: <strong>{selectedDriver.points}</strong>
                                    </p>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Amount</Form.Label>
                                        <Form.Control
                                        type="number"
                                        value={amount}
                                        min={1}
                                        onChange={(e) => setAmount(Number(e.target.value))}
                                      />
                                    </Form.Group>
                                    <div className="d-flex gap-2">
                                        <Button variant="success" onClick={() => pointAdjust(amount)}>
                                            + Add Points
                                        </Button>
                                        <Button variant="danger" onClick={() => pointAdjust(-amount)}>
                                            - Subtract Points
                                        </Button>
                                    </div>
                                    <Form.Group className="mb-3">
                                        <Form.Label> Reason for Adjustment</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Description for Point Change"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            />
                                    </Form.Group>
                                </Card.Body>
                              </Card>
                            </Col>
                        </Row>
                    </Tab>
                    <Tab eventKey="audit" title="Logs/Reports">
                       <Card>
                        <Card.Title>Adjustment History</Card.Title>
                        <ListGroup>
                            {logs.map((log, i) =>(
                                <ListGroup.Item key = {i}>
                                    <strong>{log.driver}</strong> {log.change > 0 ? "gained" : "lost"}{" "}
                                    <strong>{Math.abs(log.change)}</strong> points <br />
                                    <small>
                                        Reason: {log.reason} | {log.time}
                                    </small>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                       </Card>
                    </Tab>

                    <Tab eventKey="settings" title="Settings">
                        <Card><Card.Body>Settings and Preferences Coming Soon</Card.Body></Card>
                    </Tab>
                  
                </Tabs>
              </div>
            </Container>
        )
}
export default SponsorPage;
