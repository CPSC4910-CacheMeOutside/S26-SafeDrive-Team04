import { Container, Row, Col, Stack, Card } from 'react-bootstrap';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from "../amplify/data/resource";
import { useEffect, useState } from 'react';

const client = generateClient<Schema>({ authMode: "iam" });

type About = Schema["About"]["type"];

export default function AboutPage () {
    const [about, setAbout] = useState<About | null>(null);
    const [status, setStatus] = useState("Loading from database...");
    useEffect(() => {
    (async () => {
            const res = await client.models.About.list();
            if(!res.data?.length){
                const created = await client.models.About.create({
                    headline: "Hello! We are Team 4",
                    currentSprint: 3,
                    nextReleaseDate: "2026-02-26",
                    SafeDriveText: "An incentive program where sponsors can reward drivers for good driving behavior."
                });
                setAbout(created.data ?? null);
                setStatus("");
                return;
            }
            setAbout(res.data[0]);
            setStatus("");
        })();
}, []);

if (!about){
    return <div style={{ padding: "60px" }}>{status}</div>;
}
    
    return (
    <div style={{ position: "relative", minHeight: "100vh", padding: "60px" }}> 
    <h1><strong>{about.headline}</strong></h1>

    
    <Container fluid>
        <div style={{ position: "relative", minHeight: "100vh", padding: "40px" }}> 
            <Row>
                <Col>
                    <Card style={{ width: '18rem' }}>
                        <Card.Img variant="top" src="./truckIco.jpg"/>
                        <Card.Body>
                            <Card.Title><strong>Safe Drive</strong></Card.Title>
                            <Card.Text>{about.SafeDriveText}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Card style={{ width: '18rem' }}>
                        <Card.Img variant="top" src="./sprintIco.png"/>
                        <Card.Body>
                            <Card.Title><strong>Current Sprint</strong></Card.Title>
                            <Card.Text>03</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Card style={{ width: '18rem' }}>
                        <Card.Img variant="top" src="./calendarIco.png"/>
                        <Card.Body>
                            <Card.Title><strong>Next Release Date</strong></Card.Title>
                            <Card.Text>02-19-2026</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
      </Container>
    </div>
  );
}