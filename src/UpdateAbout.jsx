import { useState } from 'react';
import { Container, Row, Col, Stack, Card, Form } from 'react-bootstrap';

export default function UpdateAbout() {
    var [team, setTeam] = useState('Team 04');
    var [sprint, setSprint] = useState('');
    var [date, setDate] = useState();
    var [name, setName] = useState('Safe Drive');
    var [desc, setDesc] = useState('')

    return (
        <div
        style={{
            display: 'flex',
            justifyContent: 'center', // Centers horizontally
            alignItems: 'center',     // Centers vertically
            height: '100vh',          // Ensures the container takes up full height
        }}>
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
                    <Form.Range placeholder='1-10' 
                        type="text"
                        onChange={(event) => {setSprint(event.target.value)} }>

                    </Form.Range>
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
                    <Form.Control type="plaintext"
                        onChange={(event) => {setDesc(event.target.value)} }>

                    </Form.Control>
                </Form.Group>
            </Form>

            <Button>Submit</Button>

        </div>
    )
}