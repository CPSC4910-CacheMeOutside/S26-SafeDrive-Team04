
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

export default function SponsorPage(){
    const [drivers, setDrivers] = useState([
        {id: 1, name: "Bo Darvilel", points: 200},
        {id: 2, name: "Cledus Snow", points: 156},
        {id: 3, name: "Hot-Pants Hillard", points: 186}
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
                <h2 className="mb-3">Sponsor Dashboard</h2>
                <Tabs defaultActiveKey="manage" className="mb-3">
                    <Tab eventKey="manage" title="Manage Points">
                        <Row>
                            <Col md={4}>
                            </Col>
                        </Row>
                    </Tab>
                </Tabs>
            </Container>
        )
        
}
