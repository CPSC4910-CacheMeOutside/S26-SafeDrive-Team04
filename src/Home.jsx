import { Button, Container, Row, Col, Card } from "react-bootstrap";
import { generateClient } from 'aws-amplify/data';
import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import useAmplifyAuth from "./UseAmplifyAuth";
import { useLanguage } from "./LanguageContext";
import "./App.css";

export default function HomePage () {
  const auth = useAmplifyAuth();
  const { t } = useLanguage();
  // Must use apiKey auth since AboutInfo only allows publicApiKey
  const client = generateClient({ authMode: 'apiKey' });

  const [data, setData] = useState({
    sprintNo: 0,
    releaseDate: "00-00-0000",
    teamName: "Team 00",
    productName: "---",
    desc: "If you are reading this, there's no data to pull or your query has failed."
  });

  useEffect(() => {
    async function getAboutData() {
      try {
        const { data: items, errors } = await client.models.AboutInfo.list();

        if (errors && errors.length > 0) {
          console.log(errors);
          return;
        }

        if (items && items.length > 0) {
          // Display the record with the highest sprint number (most current)
          const info = items.reduce((latest, item) =>
            item.sprintNo > latest.sprintNo ? item : latest
          );
          setData({
            sprintNo: info.sprintNo,
            releaseDate: info.releaseDate,
            teamName: info.teamName,
            productName: info.productName,
            desc: info.desc
          });
        }
      } catch (err) {
        console.log(`ERROR: ${err}`);
      }
    }

    getAboutData();
  }, []);

  return (
    <div style={{ position: "relative", minHeight: "100vh", padding: "60px", overflowX: "hidden" }}>
      <div className="hero-content">
      <h1 style={{ fontSize: "60px", fontWeight: "bold" }}>{t('home.welcome')}</h1>
      <p className="fs-2">{t('home.tagline')}</p>
      <Button style={{backgroundColor: "#10b981", border: "none", padding: "12px 24px", fontSize: "1.1rem"}} className="glow-button mt-5 px-5 py-3 fs-3 fw-bold" onClick={() => auth.signupRedirect()}>{t('home.getStarted')}</Button>
      </div>

      <div style={{ marginTop: "60px" }}>
        <h1 style={{ marginBottom: "24px" }}>{t('about.greeting')} <strong>{data.teamName}</strong></h1>
        <Container>
          <Row className="g-4 justify-content-center">
            <Col xs="auto">
              <Card style={{ width: '16rem' }}>
                <Card.Img variant="top" src="./truckIco.jpg" alt="Truck icon representing the SafeDrive product"/>
                <Card.Body>
                  <Card.Title>{t('about.introducing')} {data.productName}</Card.Title>
                  <Card.Text>{data.desc}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col xs="auto">
              <Card style={{ width: '16rem' }}>
                <Card.Img variant="top" src="./sprintIco.png" alt="Sprint icon indicating the current development sprint"/>
                <Card.Body>
                  <Card.Title>{t('about.currentSprint')}</Card.Title>
                  <Card.Text>{data.sprintNo}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col xs="auto">
              <Card style={{ width: '16rem' }}>
                <Card.Img variant="top" src="./calendarIco.png" alt="Calendar icon representing the next scheduled release date"/>
                <Card.Body>
                  <Card.Title>{t('about.nextRelease')}</Card.Title>
                  <Card.Text>{data.releaseDate}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      <img src="/truckAnim2.png" className="truckAnim2" alt="Truck carrying gifts" />
    </div>
  );
}
