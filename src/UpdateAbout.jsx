import { useState } from 'react';
import { Button, Form, Container, Col, Row} from 'react-bootstrap';
import { generateClient } from 'aws-amplify/data'

export default function UpdateAbout() {
    // About data container
    var [team, setTeam] = useState('Team 04');
    var [sprint, setSprint] = useState('');
    var [date, setDate] = useState('');
    var [name, setName] = useState('Safe Drive');
    var [desc, setDesc] = useState('')

    // Client
    const client = generateClient();

    // Submission Logic
    const createAbout = async () => {
        await client.models.AboutInfo.create({
            sprintNo: sprint,
            releaseDate: date,
            teamName: team,
            productName: name,
            desc: desc
        })
    }

    const handleSubmit = (event) => {
        try {
            event.preventDefault();
            createAbout();
        } catch (err) {
            console.log(err);
        }
    
    };

    return (
        <Container
        style={{
            display: 'flex',
            justifyContent: 'center', // Centers horizontally
            alignItems: 'center',     // Centers vertically
            height: '100vh',          // Ensures the container takes up full height
        }}>
            <Col>
                <h1>Update About Info</h1>
                <p>This page allows for the updating of the About page. Fill out the 
                below information, the click 'Submit' to push new changes. New info
                with a previos sprint number is not allowed.</p>
                <Form>
                    <Form.Group>
                        <Form.Label>Team Name #</Form.Label>
                        <Form.Control placeholder='Team XX' 
                            type="text"
                            onChange={(event) => {setTeam(event.target.value)} }>

                        </Form.Control>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Current Sprint</Form.Label>
                        <Form.Control placeholder='1-10' 
                            type="number"
                            onChange={(event) => {setSprint(event.target.value)} }>

                        </Form.Control>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Release Date</Form.Label>
                        <Form.Control placeholder='MM-DD-YYYY' 
                            type="text"
                            onChange={(event) => {setDate(event.target.value)} }>

                        </Form.Control>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Product Name</Form.Label>
                        <Form.Control type="text"
                            onChange={(event) => {setName(event.target.value)} }>

                        </Form.Control>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Product Description</Form.Label>
                        <Form.Control type="textarea"
                            onChange={(event) => {setDesc(event.target.value)} }>

                        </Form.Control>
                    </Form.Group>
                    <Button type="submit">Submit</Button>
                </Form>
            </Col>
        </Container>
    )
}