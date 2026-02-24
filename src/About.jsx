import { Container, Row, Col, Stack, Card } from 'react-bootstrap';
import { generateClient } from 'aws-amplify/data';
import { useState, useEffect } from 'react';

const currentSprint = 4;

export default function AboutPage () {

    const client = generateClient();
    var [data, setData] = useState({
        sprintNo: 0,
        releaseDate: "00-00-0000",
        teamName: "Team 00",
        productName: "---",
        desc: "If you are reading this, there's no data to pull or your query has failed."
    });
    
    useEffect(() => {
        async function getAboutData() {
            try {
                // get a specific item
                const { data: info, errors } = await client.models.AboutInfo.get({
                    sprintNo: currentSprint
                });

                if (errors) {
                    console.log(errors);
                    return;
                }

                if (info) {
                    console.log(`Recived the following from the backend ${info}`)
                    setData({
                        sprintNo: info.sprintNo,
                        releaseDate: info.releaseDate,
                        teamName: info.teamName,
                        productName: info.productName,
                        desc: info.desc
                    });
                }
            } catch (err) {
                console.log(`ERROR: ${err}`)
            }
        } 

        getAboutData();

    }, []);

    return (
    <div>
    <h1>Hello! We are <strong>{data.teamName}</strong></h1>

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
                        <Card.Img variant="top" src="./truckIco.jpg"/>
                        <Card.Body>
                            <Card.Title>Introducing {data.productName}</Card.Title>
                            <Card.Text>{data.desc}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Card style={{ width: '18rem' }}>
                        <Card.Img variant="top" src="./sprintIco.png"/>
                        <Card.Body>
                            <Card.Title>Current Sprint</Card.Title>
                            <Card.Text>{data.sprintNo}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Card style={{ width: '18rem' }}>
                        <Card.Img variant="top" src="./calendarIco.png"/>
                        <Card.Body>
                            <Card.Title>Next Release Date</Card.Title>
                            <Card.Text>{data.releaseDate}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
      </Container>
    </div>
  );
}