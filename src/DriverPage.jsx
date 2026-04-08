import { useEffect, useMemo, useState } from "react";
import { fetchAuthSession, getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";
import { useLanguage } from "./LanguageContext";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";

function DriverPage() {
  const { t } = useLanguage();
  const [driver, setDriver] = useState({
    id: 1,
    subId: "",
    username: "",
    name: "",
    email: "",
    phoneNumber: "",
    groups: [],
    points: 200,
    sponsors: [
      {
        id: "SPUser1",
        name: "East Bound and Down",
        status: "active",
        joinedDate: "2026-03-31"
      },
      {
        id: "SPUser3",
        name: "DriversCo",
        status: "active",
        joinedDate: "2026-03-20"
      }
    ],
    applications: [
      {
        id: "APP1",
        sponsorId: "SPUser2",
        sponsorName: "Get Your Kicks on Rt 66",
        status: "rejected",
        submittedAt: "2026-03-30"
      },
      {
        id: "APP2",
        sponsorId: "SPUser4",
        sponsorName: "Convoy Boys",
        status: "pending",
        submittedAt: "2026-03-25"
      }
    ]
  });

  useEffect(() => {
    async function loadUser() {
      try {
        const [session, currentUser, attributes] = await Promise.all([
          fetchAuthSession(),
          getCurrentUser(),
          fetchUserAttributes()
        ]);

        const idPayload = session.tokens?.idToken?.payload ?? {};
        const accessPayload = session.tokens?.accessToken?.payload ?? {};

        const fullName =
        attributes.name ||
        [attributes.given_name, attributes.family_name].filter(Boolean).join(" ") ||
        "";

        const groups =
          idPayload["cognito:groups"] ||
          accessPayload["cognito:groups"] ||
          [];

        setDriver((prev) => ({
          ...prev,
          username: currentUser.username ?? "",
          fullName,
          email: attributes.email ?? "",
          phoneNumber: attributes.phone_number ?? "",
          groups
        }));
      } catch (error) {
        console.error("Failed to load Cognito user info:", error);
      }
    }

    loadUser();
  }, []);

  const applicationsByStatus = useMemo(() => {
    return {
      pending: driver.applications.filter((app) => app.status === "pending"),
      approved: driver.applications.filter((app) => app.status === "approved"),
    };
  }, [driver.applications]);

  const getBadgeVariant = (status) => {
    switch (status) {
      case "active":
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "danger";
      default:
        return "secondary";
    }
  };

  return (
    <Container className="mt-4">
      <div style={{ minHeight: "100vh", padding: "40px" }}>
        <h1><strong>{t('driver.dashboard')}</strong></h1>

        <Row className="mb-4">
          <Col md={4}>
            <Card>
              <Card.Body>
                <Card.Title>{t('driver.myProfile')}</Card.Title>
                <p className="mb-2"><strong>{t('driver.name')}</strong> {driver.fullName || t('driver.unknownUser')}</p>
                <p className="mb-2"><strong>{t('driver.email')}</strong> {driver.email || t('driver.noEmail')}</p>
                <p className="mb-2"><strong>{t('driver.phone')}</strong> {driver.phoneNumber || t('driver.noPhone')}</p>
                <p className="mb-2"><strong>{t('driver.groups')}</strong> {driver.groups.join(", ") || t('driver.none')}</p>
                <p className="mb-0"><strong>{t('driver.points')}</strong> {driver.points}</p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={8}>
            <Card>
              <Card.Body>
                <Card.Title>{t('driver.overview')}</Card.Title>
                <Row>
                  <Col sm={4}>
                    <Card className="text-center">
                      <Card.Body>
                        <h4>{driver.sponsors.length}</h4>
                        <div className="text-muted">{t('driver.sponsors')}</div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col sm={4}>
                    <Card className="text-center">
                      <Card.Body>
                        <h4>{applicationsByStatus.pending.length}</h4>
                        <div className="text-muted">{t('driver.pendingApps')}</div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col sm={4}>
                    <Card className="text-center">
                      <Card.Body>
                        <h4>{driver.applications.length}</h4>
                        <div className="text-muted">{t('driver.totalApplications')}</div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Tabs defaultActiveKey="sponsors" className="mb-4">
          <Tab eventKey="sponsors" title={t('driver.mySponsors')}>
            <Card className="mt-3">
              <Card.Body>
                <Card.Title>{t('driver.associatedSponsors')}</Card.Title>
                {!driver.sponsors.length ? (
                  <div className="text-muted">{t('driver.noSponsors')}</div>
                ) : (
                  <ListGroup>
                    {driver.sponsors.map((sponsor) => (
                      <ListGroup.Item key={sponsor.id}>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{sponsor.name}</strong>
                            <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                              {t('driver.joined')} {sponsor.joinedDate}
                            </div>
                          </div>
                          <Badge bg={getBadgeVariant(sponsor.status)}>
                            {sponsor.status}
                          </Badge>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Card.Body>
            </Card>
          </Tab>

          <Tab eventKey="applications" title={t('driver.applications')}>
            <Card className="mt-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Card.Title className="mb-0">{t('driver.myApplications')}</Card.Title>
                  <Button variant="primary" size="sm">
                    {t('driver.browseSponsors')}
                  </Button>
                </div>

                {!driver.applications.length ? (
                  <div className="text-muted">{t('driver.noApplications')}</div>
                ) : (
                  <ListGroup>
                    {driver.applications.map((app) => (
                      <ListGroup.Item key={app.id}>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{app.sponsorName}</strong>
                            <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                              {t('driver.submitted')} {app.submittedAt}
                            </div>
                          </div>

                          <div className="d-flex align-items-center gap-2">
                            <Badge bg={getBadgeVariant(app.status)}>
                              {app.status}
                            </Badge>

                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>
      </div>
    </Container>
  );
}

export default DriverPage;
