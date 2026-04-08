import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from './LanguageContext';
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import { ListGroupItem } from 'react-bootstrap';
import { fetchUnassignedUsers, assignUserGroup } from './adminAssignRoles-api';
import { fetchDriverUsers } from './adminUpdateDriverInfo-api';
import { fetchSponsorUsers } from './adminUpdateDriverInfo-api';

function AdminPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [unassignedUsers, setUnassignedUsers] = useState([]);
  const [selectedPendingUsername, setSelectedPendingUsername] = useState("");
  const [selectedRole, setSelectedRole] = useState("Driver");
  const [loadingPendingUsers, setLoadingPendingUsers] = useState(false);
  const [assigningRole, setAssigningRole] = useState(false);
  const [roleCardMessage, setRoleCardMessage] = useState("");
  const [roleCardError, setRoleCardError] = useState("");

  const [driverUsers, setDriverUsers] = useState([]);
  const [selectedDriverUsername, setSelectedDriverUsername] = useState("");
  const [loadingDriverUsers, setLoadingDriverUsers] = useState(false);
  const [driverUsersError, setDriverUsersError] = useState("");

  const [sponsorUsers, setSponsorUsers] = useState([]);
  const [selectedSponsorUsername, setSelectedSponsorUsername] = useState("");
  const [loadingSponsorUsers, setLoadingSponsorUsers] = useState(false);
  const [sponsorUsersError, setSponsorUsersError] = useState("");

  const selectedDriverUser = useMemo(
    () => driverUsers.find((u) => u.username === selectedDriverUsername) ?? null,
    [driverUsers, selectedDriverUsername]
  );

  const selectedSponsorUser = useMemo(
    () => sponsorUsers.find((u) => u.username === selectedSponsorUsername) ?? null,
    [sponsorUsers, selectedSponsorUsername]
  );

  const loadDriverUsers = async () => {
    try {
      setLoadingDriverUsers(true);
      setDriverUsersError("");

      const data = await fetchDriverUsers();
      const users = Array.isArray(data) ? data : [];

      setDriverUsers(users);
      setSelectedDriverUsername((prev) => {
        if (prev && users.some((u) => u.username === prev)) return prev;
        return users[0]?.username ?? "";
      });
    } catch (error) {
      console.error(error);
      setDriverUsersError("Failed to load drivers.");
    } finally {
      setLoadingDriverUsers(false);
    }
  };

  const loadSponsorUsers = async () => {
    try {
      setLoadingSponsorUsers(true);
      setSponsorUsersError("");

      const data = await fetchSponsorUsers();
      const users = Array.isArray(data) ? data : [];

      setSponsorUsers(users);
      setSelectedSponsorUsername((prev) => {
        if (prev && users.some((u) => u.username === prev)) return prev;
        return users[0]?.username ?? "";
      });
    } catch (error) {
      console.error(error);
      setSponsorUsersError("Failed to load sponsors.");
    } finally {
      setLoadingSponsorUsers(false);
    }
  };

  const selectedPendingUser = useMemo(
    () => unassignedUsers.find((u) => u.username === selectedPendingUsername) ?? null,
    [unassignedUsers, selectedPendingUsername]
  );

  const loadUnassignedUsers = async () => {
    try {
      setLoadingPendingUsers(true);
      setRoleCardError("");
      setRoleCardMessage("");

      const data = await fetchUnassignedUsers();
      const users = Array.isArray(data) ? data : [];

      setUnassignedUsers(users);
      setSelectedPendingUsername((prev) => {
        if (prev && users.some((u) => u.username === prev)) return prev;
        return users[0]?.username ?? "";
      });
    } catch (error) {
      console.error(error);
      setRoleCardError("Failed to load unassigned users.");
    } finally {
      setLoadingPendingUsers(false);
    }
  };

  useEffect(() => {
    loadDriverUsers();
    loadSponsorUsers();
    loadUnassignedUsers();
  }, []);

  const handleAssignRole = async () => {
    if (!selectedPendingUser) return;

    try {
      setAssigningRole(true);
      setRoleCardError("");
      setRoleCardMessage("");

      await assignUserGroup(selectedPendingUser.username, selectedRole);

      setRoleCardMessage(
        `${selectedPendingUser.name || selectedPendingUser.username} assigned to ${selectedRole}.`
      );

      const updatedUsers = unassignedUsers.filter(
        (u) => u.username !== selectedPendingUser.username
      );
      setUnassignedUsers(updatedUsers);
      setSelectedPendingUsername(updatedUsers[0]?.username ?? "");

      await loadDriverUsers();
      await loadSponsorUsers();
    } catch (error) {
      console.error(error);
      setRoleCardError("Failed to assign role.");
    } finally {
      setAssigningRole(false);
    }
  };

  const handleDismissUnassignedUser = () => {
    if (!selectedPendingUser) return;

    const updatedUsers = unassignedUsers.filter(
      (u) => u.username !== selectedPendingUser.username
    );

    setUnassignedUsers(updatedUsers);
    setSelectedPendingUsername(updatedUsers[0]?.username ?? "");
    setRoleCardMessage(
      `${selectedPendingUser.name || selectedPendingUser.username} removed from the list.`
    );
    setRoleCardError("");
  };

  const [SponsoredUsers, setSponsUser] = useState([
    {
      id: "SPUser1",
      name: "SPUser1",
      drivers: [
        { id: 5, name: "Jerry Reed", points: 300 },
        { id: 4, name: "Burt Reynolds", points: 330 }
      ],
      logs: [],
    },
    {
      id: "SPUser2",
      name: "SPUser2",
      drivers: [
        { id: 1, name: "Bo Darvilel", points: 200 },
        { id: 2, name: "Cledus Snow", points: 156 },
        { id: 3, name: "Hot-Pants Hillard", points: 186 }
      ],
      logs: [],
    },
    {
      id: "SPUser3",
      name: "SPUser3",
      drivers: [
        { id: 6, name: "Johnny Cash", points: 400 },
        { id: 7, name: "Willie Nelson", points: 450 },
        { id: 8, name: "Waylon Jennings", points: 500 },
        { id: 9, name: "Kris Kristofferson", points: 400 }
      ],
      logs: [],
    },
  ]);

  const [selectedSponsUserId, setSelectedSponsUserId] = useState(SponsoredUsers[0]?.id ?? "");
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [amount, setAmount] = useState(10);
  const [sortMode, setSortMode] = useState("id");
  const [description, setDescription] = useState("");

  const selectedSponsUser = useMemo(
    () => SponsoredUsers.find((c) => c.id === selectedSponsUserId),
    [SponsoredUsers, selectedSponsUserId]
  );

  const SponsUserDrivers = selectedSponsUser?.drivers ?? [];
  const SponsUserLogs = selectedSponsUser?.logs ?? [];

  const validDriver = useMemo(() => {
    if (!SponsUserDrivers.length) return null;
    if (selectedDriverId == null) return SponsUserDrivers[0].id;
    const driverLoc = SponsUserDrivers.some((d) => d.id === selectedDriverId);
    return driverLoc ? selectedDriverId : SponsUserDrivers[0].id;
  }, [SponsUserDrivers, selectedDriverId]);

  const selectedDriver = useMemo(
    () => SponsUserDrivers.find((d) => d.id === validDriver) ?? null,
    [SponsUserDrivers, validDriver]
  );

  const pointAdjust = (value) => {
    if (!selectedSponsUser || !selectedDriver) return;
    const timestamp = new Date().toLocaleString();
    const reason = description?.trim() ? description.trim() : "No Reason Provided";

    setSponsUser(prev =>
      prev.map((SponsUser) => {
        if (SponsUser.id !== selectedSponsUserId) return SponsUser;

        const updatedDrivers = SponsUser.drivers.map((d) =>
          d.id === selectedDriver.id ? { ...d, points: d.points + value } : d
        );

        const newLog = {
          driverId: selectedDriver.id,
          driver: selectedDriver.name,
          change: value,
          reason,
          time: timestamp,
        };

        return {
          ...SponsUser,
          drivers: updatedDrivers,
          logs: [newLog, ...SponsUser.logs],
        };
      })
    );

    setDescription("");
  };

  const handleAdminAccountTakeover = () => {
    if (!selectedDriverUser) return;
    navigate(`/admin/drivers/${selectedDriverUser.username}/edit`);
  };

  const handleSponsorAccountTakeover = () => {
    if (!selectedSponsorUser) return;
    navigate(`/admin/sponsors/${selectedSponsorUser.username}/edit`);
  };

  return (
    <Container className="mt-4">
      <div style={{ position: "relative", minHeight: "100vh", padding: "40px" }}>
        <h1><strong>{t('admin.title')}</strong></h1>

        <Tabs defaultActiveKey="manage" className="mb-4">
          <Tab eventKey="manage" title={t('admin.manageDrivers')}>
            <Row>
              <Col md={4}>
                <Card className="mb-4">
                  <Card.Body>
                    <Card.Title>Drivers</Card.Title>

                    {driverUsersError && (
                      <div className="alert alert-danger py-2">{driverUsersError}</div>
                    )}

                    {loadingDriverUsers ? (
                      <div className="text-muted">Loading drivers...</div>
                    ) : !driverUsers.length ? (
                      <div className="text-muted">No drivers found.</div>
                    ) : (
                      <>
                        <ListGroup className="mb-3">
                          {driverUsers.map((user) => (
                            <ListGroupItem
                              key={user.username}
                              action
                              active={user.username === selectedDriverUsername}
                              onClick={() => setSelectedDriverUsername(user.username)}
                            >
                              <div className="fw-semibold">
                                {user.name || user.preferred_username || user.username}
                              </div>
                              <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                                {user.email || user.username}
                              </div>
                            </ListGroupItem>
                          ))}
                        </ListGroup>

                        <Button
                          style={{ width: "160px", height: "50px" }}
                          variant="outline-secondary"
                          onClick={loadDriverUsers}
                          disabled={loadingDriverUsers}
                        >
                          Refresh
                        </Button>
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              <Col md={5}>
                <Card>
                  <Card.Body>
                    <Card.Title>{t('admin.adjustPoints')}</Card.Title>

                    {!selectedDriver ? (
                      <div className="text-muted">{t('admin.selectDriverToAdjust')}</div>
                    ) : (
                      <>
                        <p>
                          {t('admin.sponsoredUser')}: <strong>{selectedSponsUser?.name}</strong>
                          <br />
                          {t('admin.driver')}: <strong>{selectedDriverUser.name || selectedDriverUser.preferred_username || selectedDriverUser.username}</strong>
                          <br />
                          {t('admin.currentPoints')}: <strong>{selectedDriver.points}</strong>
                        </p>

                        <Form.Group className="mb-3">
                          <Form.Label>{t('admin.amount')}</Form.Label>
                          <Form.Control
                            type="number"
                            value={amount}
                            min={1}
                            onChange={(e) => setAmount(Number(e.target.value))}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>{t('admin.reasonForAdjustment')}</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder={t('admin.descriptionPlaceholder')}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                        </Form.Group>

                        <div className="d-flex gap-2">
                          <Button variant="success" onClick={() => pointAdjust(amount)}>
                            {t('admin.addPoints')}
                          </Button>
                          <Button variant="danger" onClick={() => pointAdjust(-amount)}>
                            {t('admin.subtractPoints')}
                          </Button>
                          <Button variant="secondary" onClick={handleAdminAccountTakeover}>
                            {t('admin.manageAccount')}
                          </Button>
                        </div>
                      </>
                    )}
                  </Card.Body>
                </Card>

                <Card className="mt-4">
                  <Card.Body>
                    <Card.Title>Edit Driver Account</Card.Title>
                    {!selectedDriverUser ? (
                      <div className="text-muted">Select a driver to manage their account.</div>
                    ) : (
                      <>
                        <p className="mb-3">
                          Manage account information for{" "}
                          <strong>
                            {selectedDriverUser.name || selectedDriverUser.preferred_username || selectedDriverUser.username}
                          </strong>.
                        </p>
                        <Button
                          style={{ width: "160px", height: "50px" }}
                          variant="secondary"
                          onClick={() => navigate(`/admin/drivers/${selectedDriverUser.username}/edit`)}
                        >
                          Edit Account
                        </Button>
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>

          <Tab eventKey="manageSponsors" title="Manage Sponsors">
            <Row>
              <Col md={4}>
                <Card>
                  <Card.Body>
                    <Card.Title>Sponsors</Card.Title>

                    {loadingSponsorUsers ? (
                      <div className="text-muted">Loading sponsors...</div>
                    ) : !sponsorUsers.length ? (
                      <div className="text-muted">No sponsors found.</div>
                    ) : (
                      <>
                        <ListGroup className="mb-3">
                          {sponsorUsers.map((user) => (
                            <ListGroupItem
                              key={user.username}
                              action
                              active={user.username === selectedSponsorUsername}
                              onClick={() => setSelectedSponsorUsername(user.username)}
                            >
                              <div className="fw-semibold">
                                {user.name || user.preferred_username || user.username}
                              </div>
                              <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                                {user.email || user.username}
                              </div>
                            </ListGroupItem>
                          ))}
                        </ListGroup>

                        <Button
                          style={{ width: "160px", height: "50px" }}
                          variant="outline-secondary"
                          onClick={loadSponsorUsers}
                          disabled={loadingSponsorUsers}
                        >
                          Refresh
                        </Button>
                      </>
                    )}

                    {sponsorUsersError && (
                      <div className="alert alert-danger py-2 mt-3">
                        {sponsorUsersError}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              <Col md={5}>
                <Card>
                  <Card.Body>
                    <Card.Title>Edit Sponsor Profile</Card.Title>

                    {!selectedSponsorUser ? (
                      <div className="text-muted">
                        Select a sponsor to manage their profile.
                      </div>
                    ) : (
                      <>
                        <p className="mb-3">
                          Editing profile for{" "}
                          <strong>
                            {selectedSponsorUser.name ||
                              selectedSponsorUser.preferred_username ||
                              selectedSponsorUser.username}
                          </strong>
                        </p>

                        <Button
                          style={{ width: "180px", height: "50px" }}
                          variant="secondary"
                          onClick={() =>
                            navigate(`/admin/drivers/${selectedSponsorUser.username}/edit`)
                          }
                        >
                          Edit Account
                        </Button>
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>

          <Tab eventKey="pendingUsers" title="Pending Users">
            <Col md={5}>
              <Card className="mb-4">
                <Card.Body>
                  <Card.Title>Assign Role</Card.Title>

                  {roleCardError && (
                    <div className="alert alert-danger py-2">{roleCardError}</div>
                  )}
                  {roleCardMessage && (
                    <div className="alert alert-success py-2">{roleCardMessage}</div>
                  )}

                  {loadingPendingUsers ? (
                    <div className="text-muted">Loading unassigned users...</div>
                  ) : !unassignedUsers.length ? (
                    <div className="text-muted">No unassigned users found.</div>
                  ) : (
                    <>
                      <ListGroup className="mb-3">
                        {unassignedUsers.map((user) => (
                          <ListGroupItem
                            key={user.username}
                            action
                            active={user.username === selectedPendingUsername}
                            onClick={() => setSelectedPendingUsername(user.username)}
                          >
                            <div className="fw-semibold">
                              {user.name || user.preferred_username || user.username}
                            </div>
                            <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                              {user.email || user.username}
                            </div>
                          </ListGroupItem>
                        ))}
                      </ListGroup>

                      {selectedPendingUser && (
                        <>
                          <div className="mb-3">
                            <strong>Selected User:</strong><br />
                            {selectedPendingUser.name || "No name"}<br />
                            <span className="text-muted">
                              {selectedPendingUser.email || selectedPendingUser.username}
                            </span>
                          </div>

                          <Form.Group className="mb-3">
                            <Form.Label>Assign Group</Form.Label>
                            <Form.Select
                              value={selectedRole}
                              onChange={(e) => setSelectedRole(e.target.value)}
                            >
                              <option value="Admin">Admin</option>
                              <option value="Driver">Driver</option>
                              <option value="Sponsor">Sponsor</option>
                            </Form.Select>
                          </Form.Group>

                          <div className="d-flex justify-content-center gap-4">
                            <Button
                              style={{ width: "160px", height: "50px" }}
                              onClick={handleAssignRole}
                              disabled={assigningRole}
                            >
                              {assigningRole ? "Assigning..." : "Assign Role"}
                            </Button>
                            <Button
                              style={{ width: "160px", height: "50px" }}
                              variant="outline-secondary"
                              onClick={handleDismissUnassignedUser}
                            >
                              Remove From List
                            </Button>
                          </div>
                        </>
                      )}
                    </>
                  )}

                  <Button
                    style={{ width: "160px", height: "50px" }}
                    variant="outline-secondary"
                    className="mt-3"
                    onClick={loadUnassignedUsers}
                    disabled={loadingPendingUsers}
                  >
                    Refresh
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Tab>

          <Tab eventKey="audit" title={t('admin.logsReports')}>
            <Row>
              <Col md={4}>
                <Card>
                  <Card.Body>
                    <Card.Title>{t('admin.sponsoredUsers')}</Card.Title>
                    <ListGroup>
                      {SponsoredUsers.map((c) => (
                        <ListGroup.Item
                          key={c.id}
                          action
                          active={c.id === selectedSponsUserId}
                          onClick={() => {
                            setSelectedSponsUserId(c.id);
                            setSelectedDriverId(null);
                          }}
                        >
                          {c.name}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={8}>
                <Card>
                  <Card.Body>
                    <Card.Title>
                      {t('admin.logs')} {selectedSponsUser ? `(${selectedSponsUser.name})` : ""}
                    </Card.Title>

                    {!SponsUserLogs.length ? (
                      <div className="text-muted mt-3">{t('admin.noAdjustmentsLogged')}</div>
                    ) : (
                      <ListGroup>
                        {SponsUserLogs.map((log, index) => (
                          <ListGroupItem key={index}>
                            <div>
                              <strong>{log.driver}</strong>
                            </div>
                            <div>
                              {t('admin.change')}:{" "}
                              <span className={log.change >= 0 ? "text-success" : "text-danger"}>
                                {log.change >= 0 ? `+${log.change}` : log.change}
                              </span>
                            </div>
                            <div>{t('admin.reason')}: {log.reason}</div>
                            <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                              {log.time}
                            </div>
                          </ListGroupItem>
                        ))}
                      </ListGroup>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>
        </Tabs>
      </div>
    </Container>
  );
}

export default AdminPage;