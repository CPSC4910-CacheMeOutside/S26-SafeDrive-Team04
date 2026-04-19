import { useState } from 'react';
import { Button, Form, Container, Stack, Row, Alert} from 'react-bootstrap';
import { generateClient } from 'aws-amplify/data'
import { useLanguage } from './LanguageContext';

export default function UpdateAbout() {
    const { t } = useLanguage();
    var [formStatus, setStatus] = useState(0);

    // About data container
    var [team, setTeam] = useState('Team 04');
    var [sprint, setSprint] = useState('');
    var [date, setDate] = useState('');
    var [name, setName] = useState('Safe Drive');
    var [desc, setDesc] = useState('')

    // Client — must use apiKey auth since AboutInfo only allows publicApiKey
    const client = generateClient({ authMode: 'apiKey' });

    // Submission Logic
    const createAbout = async () => {
        await client.models.AboutInfo.delete({
            sprintNo: Number(sprint)
        });

        const { data: writeData, errors } = await client.models.AboutInfo.create({
            sprintNo: Number(sprint),
            releaseDate: date,
            teamName: team,
            productName: name,
            desc: desc
        });

        if (errors && errors.length > 0) {
            console.log(errors);
            throw new Error(errors[0].message);
        }

        console.log(writeData);
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
                <h1><strong>{t('about.title')}</strong></h1>
                <p></p>
                <p>{t('about.instructions')}</p>
                <Form onSubmit={handleSubmit}>
                    <Form.Group>
                        <Form.Label>{t('about.teamName')}</Form.Label>
                        <Form.Control placeholder={t('about.teamPlaceholder')}
                            type="text"
                            onChange={(event) => {setTeam(event.target.value)} }>

                        </Form.Control>
                    </Form.Group>
                    <Stack direction="horizontal" gap={3}>
                        <Form.Group className='p-2'>
                            <Form.Label>{t('about.sprintLabel')}</Form.Label>
                            <Form.Control placeholder={t('about.sprintPlaceholder')}
                                type="number"
                                onChange={(event) => {setSprint(event.target.value)} }>

                            </Form.Control>
                        </Form.Group>
                        <Form.Group className='p-2'>
                            <Form.Label>{t('about.releaseDateLabel')}</Form.Label>
                            <Form.Control placeholder={t('about.datePlaceholder')}
                                type="text"
                                onChange={(event) => {setDate(event.target.value)} }>

                            </Form.Control>
                        </Form.Group>
                        <Form.Group className='p-2 w-100'>
                            <Form.Label>{t('about.productName')}</Form.Label>
                            <Form.Control type="text"
                                onChange={(event) => {setName(event.target.value)} }>

                            </Form.Control>
                        </Form.Group>
                    </Stack>
                    <Form.Group>
                        <Form.Label>{t('about.productDesc')}</Form.Label>
                        <Form.Control type="text" as="textarea" style={{ height: '100px' }}
                            onChange={(event) => {setDesc(event.target.value)} }>

                        </Form.Control>
                    </Form.Group>
                    <br></br>
                    <Button className="top-0 start-0" variant='primary' type="submit">{t('about.submit')}</Button>
                    <Alert hidden={formStatus !== 1} variant='success'>{t('about.successAlert')}</Alert>
                    <Alert hidden={formStatus !== 2} variant='danger'>{t('about.errorAlert')}</Alert>
                </Form>
            </Row>
        </Container>
    )
}