import { Container, Col, Card, Stack, Button, Image, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { useLanguage } from './LanguageContext';

const client = generateClient();

export default function SponsorListings() {
  const { t } = useLanguage();
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadSponsors() {
      try {
        setLoading(true);
        setError(null);

        const result = await client.models.Sponsor.list();
        const sponsorRows = result.data ?? [];
        const visible = sponsorRows.filter(s => s.affiliation && s.affiliation.trim() !== '');
        setSponsors(visible);
      } catch (err) {
        console.error('Failed to load sponsors:', err);
        setError('Could not load sponsor listings. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadSponsors();
  }, []);

  function SponsorCard({ sponsor }) {
    return (
      <Card className="mb-3">
        <Card.Body>
          <Stack direction="horizontal" gap={3}>
            <Image
              height={100}
              width={100}
              src="./profileTestPic.jpg"
              roundedCircle
              style={{ objectFit: 'cover', flexShrink: 0 }}
            />
            <Col>
              <div className="text-start">
                <h4 className="mb-1">{sponsor.affiliation}</h4>
                {sponsor.description && (
                  <p className="text-muted mb-2" style={{ fontSize: '0.9rem' }}>
                    {sponsor.description}
                  </p>
                )}
              </div>
              <Button
                variant="primary"
                as={Link}
                to={`/application/${encodeURIComponent(sponsor.sponsorId)}`}
              >
                {t('sponsorList.applyNow')}
              </Button>
            </Col>
          </Stack>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Container style={{ marginTop: '30px' }}>
      <Col>
        <h1>{t('sponsorList.title')}</h1>
        <p>{t('sponsorList.description')}</p>

        {loading && (
          <div className="d-flex align-items-center gap-2 my-4">
            <Spinner animation="border" size="sm" />
            <span>Loading sponsors...</span>
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}

        {!loading && !error && sponsors.length === 0 && (
          <Alert variant="info">
            No sponsors are currently accepting applications. Check back later.
          </Alert>
        )}

        {!loading && !error && sponsors.length > 0 && (
          <Container className="border p-3" style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {sponsors.map(sponsor => (
              <SponsorCard key={sponsor.sponsorId} sponsor={sponsor} />
            ))}
          </Container>
        )}
      </Col>
    </Container>
  );
}