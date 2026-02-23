import { Container, Row, Col, Stack, Card } from 'react-bootstrap';

export default function AboutPage () {
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
                            <Card.Text>An incentive program where sponsors can reward drivers for good driving behavior.</Card.Text>
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