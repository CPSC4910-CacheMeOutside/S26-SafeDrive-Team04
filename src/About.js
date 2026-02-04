import { Container, Row, Col, Stack, Card } from 'react-bootstrap';

export default function AboutPage () {
    return (
    <div>
    <h1>Hello! We are <strong>Team 04</strong></h1>

    
    <Container fluid>
        <div
        style={{
            display: 'flex',
            justifyContent: 'center', // Centers horizontally
            alignItems: 'center',     // Centers vertically
            height: '100vh',          // Ensures the container takes up full height
        }}
        >
            <Row>
                <Col>
                    <Card style={{ width: '18rem' }}>
                        <Card.Img variant="top" src="truckIco.jpg"/>
                        <Card.Body>
                            <Card.Title>Introducing Safe Drive</Card.Title>
                            <Card.Text>Safe Drive is a driver incentive program allowing sponsors to reward their drivers for good driving behavior.</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Card style={{ width: '18rem' }}>
                        <Card.Img variant="top" src="sprintIco.png"/>
                        <Card.Body>
                            <Card.Title>Current Sprint</Card.Title>
                            <Card.Text>01</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Card style={{ width: '18rem' }}>
                        <Card.Img variant="top" src="calendarIco.png"/>
                        <Card.Body>
                            <Card.Title>Next Release Date</Card.Title>
                            <Card.Text>02-05-2026</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
      </Container>
    </div>
  );
}