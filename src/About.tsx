import { Container, Row, Col, Stack, Card } from 'react-bootstrap';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from "../amplify/data/resource";
import { useEffect, useState } from 'react';

const client = generateClient<Schema>({ authMode: "iam" });

export default function AboutPage () {
    
    const [aboutText, setAboutText] = useState("Loading from database...");
    useEffect(() => {
    (async () => {
        const res = await client.models.About.list();
        if(!res.data?.length){
            await client.models.About.create({ content: "An incentive program where sponsors can award drivers for good driving behavior"});
                setAboutText("Seeded. Refresh");
                return;
            }
            setAboutText(res.data[0].content);
        })();
}, []);
    
    return (
    <div style={{ position: "relative", minHeight: "100vh", padding: "60px" }}> 
    <h1><strong>Hello! We are Team 04</strong></h1>

    
    <Container fluid>
        <div style={{ position: "relative", minHeight: "100vh", padding: "40px" }}> 
            <Row>
                <Col>
                    <Card style={{ width: '18rem' }}>
                        <Card.Img variant="top" src="./truckIco.jpg"/>
                        <Card.Body>
                            <Card.Title><strong>Safe Drive</strong></Card.Title>
                            <Card.Text>{aboutText}</Card.Text>
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