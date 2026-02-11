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
  const[drivers, setDrivers] = useState([
    { id: 1, name: "Bo Darville", points: 200 },
    { id: 2, name: "Cledus Snow", points: 156 },
    { id: 3, name: "Hot-Pants Hilliard", points: 186 },
    { id: 4, name: "Burt Reynolds", points: 330 },
    { id: 5, name: "Jerry Reed", points: 300 },
    { id: 6, name: "Sally Fields", points: 142 },
    { id: 7, name: "Waylon Jennings", points: 265 },
    { id: 8, name: "Dolly Parton", points: 410 },
    { id: 9, name: "Loretta Lynn", points: 358 },
    { id: 10, name: "Willie Nelson", points: 287 },
    { id: 11, name: "Hank Williams Jr.", points: 199 },
    { id: 12, name: "June Carter", points: 176 },
    { id: 13, name: "Johnny Cash", points: 420 },
    { id: 14, name: "Merle Haggard", points: 310 },
    { id: 15, name: "Tammy Wynette", points: 188 },
    { id: 16, name: "George Strait", points: 360 },
    { id: 17, name: "Reba McEntire", points: 295 },
    { id: 18, name: "Kenny Rogers", points: 270 },
    { id: 19, name: "Shania Twain", points: 345 },
    { id: 20, name: "Garth Brooks", points: 390 },
    { id: 21, name: "Faith Hill", points: 248 },
    { id: 22, name: "Tim McGraw", points: 275 },
    { id: 23, name: "Chris Stapleton", points: 305 },
    { id: 24, name: "Luke Combs", points: 215 },
    { id: 25, name: "Carrie Underwood", points: 335 }
  ]);

    const [selectedId, setSelectedId] = useState(1);
        const [amount, setAmount] = useState(10);
    
        const selectedDriver = drivers.find(d => d.id === selectedId);
    
        const pointAdjust = (value) => {
                setDrivers(prev =>
                    prev.map(d =>
                        d.id === selectedId ? {...d, points: d.points + value } : d
                    )
                );
            };
  
  
  return( 
     <Container className="mt-4">
                <h2 className="mb-3">Admin Dashboard</h2>
                <Tabs defaultActiveKey="manage" className="mb-3">
                    <Tab eventKey="manage" title="Manage Points">
                        <Row>
                            <Col md={4}>
                                <Card>
                                    <Card.Body>
                                        <Card.Title>Drivers</Card.Title>
                                        <ListGroup>
                                            {drivers.map(driver => (
                            
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
                                </Card.Body>
                              </Card>
                            </Col>
                        </Row>
                    </Tab>
                    <Tab eventKey="audit" title="Logs/Reports">
                        <Card><Card.Body>Reports and Audit Logs Coming Sonn</Card.Body></Card> 
                    </Tab>

                    <Tab eventKey="settings" title="Settings">
                        <Card><Card.Body>Settings and Preferences Coming Soon</Card.Body></Card>
                    </Tab>
                  
                </Tabs>
            </Container>
  )
}