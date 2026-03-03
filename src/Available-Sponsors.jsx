import {Container, Col, Row, Card, Stack, Button, Image} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {useState} from 'react';

/* This array will serve as test input until data can be fed from the backend
Note, attributes may not be named what they are in the backend  */
const sponsors = [
    {
        first: 'Dennis',
        last: 'Richi',
        profileImg: 'profileTestPic.jpg',
        affiliation: 'Stanford & Sons Antiques LLC.',
        bio: `We got stuff. We got Junk. We got plenty of stuff and
        would love you to haul our stuff.`
    },
    {
        first: 'Jay',
        last: 'Gilstrap',
        profileImg: 'profileTestPic.jpg',
        affiliation: 'Jay Gilstrap Family Dealerships',
        bio: `Trucks and Cars. All at $3 down. `
    },
    {
        first: 'Money',
        last: 'Bags',
        profileImg: 'profileTestPic.jpg',
        affiliation: 'Rug Pull Crypto',
        bio: `We need people to haul servers. No questions asked.`
    },
]

export default function SponsorListings() {

    const [sponsorList, updateSponsorList] = useState(sponsors);

    function SponsorCard({usr}) {
    /* Data is fed from static object sponsors. References may need to be redone for the final version*/
    return (
        <Card>
            <h2>{usr.first} {usr.last}</h2>
            <Stack direction="horizontal" gap={3}>
                <Image height={200} width={200} src={usr.profileImg} roundedCircle/>
                <Col>
                    <div className="text-start">
                        <h4>{usr.affiliation}</h4>
                        <p>{usr.bio}</p>
                    </div>
                    
                    <Button variant="primary" as={Link} to={`/application/${usr.first}`}>Apply Now!</Button>
                </Col>
            </Stack>
        </Card>
    );
    }  

    return (
        <Container style={{ marginTop: '30px' }}>
            <Col>
                <h1>Available Sponsors</h1>
                <p>Safe Drive connects responsible drivers with sponsors who reward safe driving habits. 
                Explore a list of available sponsors, learn more about their incentive programs, 
                and find the one that best fits your goals</p>

                <Container className="border p-3" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    {sponsorList.map((spnsr, idx) => (<SponsorCard usr={spnsr} key={idx}/>) )}
                </Container>
            </Col>
            
        </Container>
    );
}