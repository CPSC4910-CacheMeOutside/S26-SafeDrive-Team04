import { useState } from 'react';
import { Button, Form, Container, Stack, Row, Alert} from 'react-bootstrap';
import { generateClient } from 'aws-amplify/data'

export default function UpdateAbout() {
    var [formStatus, setStatus] = useState(0);

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
        const writeStatus = await client.models.AboutInfo.create({
            sprintNo: Number(sprint),
            releaseDate: date,
            teamName: team,
            productName: name,
            desc: desc
        })

        console.log(writeStatus);
    }

    const handleSubmit = async (event) => {
        try {
            event.preventDefault();
            await createAbout();
            console.log(`Success! Sent ${team}, ${sprint}, ${date}, ${name}, ${desc} to about database`)
            setStatus(1)
        } catch (err) {
            console.log(err);
            setStatus(2)
        }
    };

    return (
        <Container>
            <Row>
                <h1>Update About Info</h1>
                <p>This page allows for the updating of the About page. Fill out the 
                below information, the click 'Submit' to push new changes. New info
                with a previos sprint number is not allowed.</p>
                <Form onSubmit={handleSubmit}>
                    <Form.Group>
                        <Form.Label>Team Name #</Form.Label>
                        <Form.Control placeholder='Team XX' 
                            type="text"
                            onChange={(event) => {setTeam(event.target.value)} }>

                        </Form.Control>
                    </Form.Group>
                    <Stack direction="horizontal" gap={3}>
                        <Form.Group className='p-2'>
                            <Form.Label>Current Sprint</Form.Label>
                            <Form.Control placeholder='1-10' 
                                type="number"
                                onChange={(event) => {setSprint(event.target.value)} }>

                            </Form.Control>
                        </Form.Group>
                        <Form.Group className='p-2'>
                            <Form.Label>Release Date</Form.Label>
                            <Form.Control placeholder='MM-DD-YYYY' 
                                type="text"
                                onChange={(event) => {setDate(event.target.value)} }>

                            </Form.Control>
                        </Form.Group>
                        <Form.Group className='p-2 w-100'>
                            <Form.Label>Product Name</Form.Label>
                            <Form.Control type="text"
                                onChange={(event) => {setName(event.target.value)} }>

                            </Form.Control>
                        </Form.Group>
                    </Stack>
                    <Form.Group>
                        <Form.Label>Product Description</Form.Label>
                        <Form.Control type="text" as="textarea" style={{ height: '100px' }}
                            onChange={(event) => {setDesc(event.target.value)} }>

                        </Form.Control>
                    </Form.Group>
                    <br></br>
                    <Button className="top-0 start-0" variant='primary' type="submit">Submit</Button>
                    <Alert hidden={formStatus !== 1} variant='success'> Success! Sent {team}, {sprint}, {date}, {name}, {desc} to about database </Alert>
                    <Alert hidden={formStatus !== 2} variant='danger'> There was a problem with your submission </Alert>
                </Form>
            </Row>
        </Container>
    )
}