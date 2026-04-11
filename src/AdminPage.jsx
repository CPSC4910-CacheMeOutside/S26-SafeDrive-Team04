import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from './LanguageContext';
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Form from "react-bootstrap/Form"
import Tabs from "react-bootstrap/Tabs"
import Tab from"react-bootstrap/Tab"
import Alert from "react-bootstrap/Alert"
import { ListGroupItem } from 'react-bootstrap';
import { fetchUnassignedUsers, assignUserGroup } from './adminAssignRoles-api';
import { fetchDriverUsers, fetchSponsorUsers } from './adminUpdateDriverInfo-api';
import { generateClient } from 'aws-amplify/data';

const client = generateClient();
const DEFAULT_RATIO = 0.10;

function AdminPage(){

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
  const [loadingSponsors, setLoadingSponsors] = useState(false);
  const [sponsorRatioInput, setSponsorRatioInput] = useState(DEFAULT_RATIO.toString());
  const [sponsorRatioError, setSponsorRatioError] = useState("");
  const [sponsorRatioSuccess, setSponsorRatioSuccess] = useState("");
  const [savingRatio, setSavingRatio] = useState(false);

  const selectedDriverUser = useMemo(
    () => driverUsers.find((u) => u.username === selectedDriverUsername) ?? null,
    [driverUsers, selectedDriverUsername]
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
      setLoadingSponsors(true);
      const data = await fetchSponsorUsers();
      const users = Array.isArray(data) ? data : [];
      setSponsorUsers(users);
      const first = users[0]?.username ?? "";
      setSelectedSponsorUsername(first);
      if (first) await loadSponsorRatio(first);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingSponsors(false);
    }
  };

  const loadSponsorRatio = async (username) => {
    try {
      const result = await client.models.Sponsor.get({ sponsorId: username });
      const ratio = result?.data?.pointToDollarRatio ?? DEFAULT_RATIO;
      setSponsorRatioInput(ratio.toString());
      setSponsorRatioError("");
      setSponsorRatioSuccess("");
    } catch (error) {
      console.error(error);
      setSponsorRatioInput(DEFAULT_RATIO.toString());
    }
  };

  const handleSponsorSelect = async (username) => {
    setSelectedSponsorUsername(username);
    await loadSponsorRatio(username);
  };

  const handleSaveRatio = async () => {
    const num = parseFloat(sponsorRatioInput);
    if (isNaN(num) || num < 0.001 || num > 1.0) {
      setSponsorRatioError("Ratio must be between 0.001 and 1.0");
      return;
    }
    try {
      setSavingRatio(true);
      setSponsorRatioError("");
      const existing = await client.models.Sponsor.get({ sponsorId: selectedSponsorUsername });
      if (existing?.data) {
        await client.models.Sponsor.update({ sponsorId: selectedSponsorUsername, pointToDollarRatio: num });
      } else {
        await client.models.Sponsor.create({ sponsorId: selectedSponsorUsername, pointToDollarRatio: num });
      }
      setSponsorRatioSuccess("Ratio saved successfully!");
      setTimeout(() => setSponsorRatioSuccess(""), 3000);
    } catch (error) {
      console.error(error);
      setSponsorRatioError("Failed to save ratio.");
    } finally {
      setSavingRatio(false);
    }
  };

  const selectedPendingUser = useMemo(() => unassignedUsers.find((u) => u.username === selectedPendingUsername) ?? null, [unassignedUsers, selectedPendingUsername]);
  
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

  useEffect(() => {loadDriverUsers(); loadUnassignedUsers(); loadSponsorUsers();}, []);

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
    } catch (error) {
      console.error(error);
      setRoleCardError("Failed to assign role.");
    } finally {
      setAssigningRole(false);
    }
  };

  const handleDismissUnassignedUser = () => {
    if (!selectedPendingUser) return;

    const updatedUsers = unassignedUsers.filter((u) => u.username !== selectedPendingUser.username);

    setUnassignedUsers(updatedUsers);
    setSelectedPendingUsername(updatedUsers[0]?.username ?? "");
    setRoleCardMessage(`${selectedPendingUser.name || selectedPendingUser.username} removed from the list.`);
    setRoleCardError("");
  };

  const { t } = useLanguage();

  const [SponsoredUsers, setSponsUser] = useState([
    {id: "SPUser1", name: "SPUser1", 
      drivers: [
        {id: 5, name: "Jerry Reed", points: 300},
        {id: 4, name: "Burt Reynolds", points: 330}
     ],
      logs: [],
    },

    {id: "SPUser2", name: "SPUser2",
      drivers: [
        {id: 1, name: "Bo Darvilel", points: 200},
        {id: 2, name: "Cledus Snow", points: 156},
        {id: 3, name: "Hot-Pants Hillard", points: 186}
      ],
      logs: [],
    },

    {id: "SPUser3", name: "SPUser3", 
      drivers: [
        {id: 6, name: "Johnny Cash", points: 400 },
        {id: 7, name: "Willie Nelson", points: 450},
        {id: 8, name: "Waylon Jennings", points: 500},
        {id: 9, name: "Kris Kristofferson", points: 400}
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
    if(selectedDriverId == null) return SponsUserDrivers[0].id;
    const driverLoc = SponsUserDrivers.some((d) => d.id === selectedDriverId);
    return driverLoc ? selectedDriverId : SponsUserDrivers[0].id;

  }, [SponsUserDrivers, selectedDriverId]);

  const selectedDriver = useMemo(
    () => SponsUserDrivers.find((d) => d.id === validDriver) ?? null,
    [SponsUserDrivers, validDriver]
  );

  const sortedDrivers = useMemo(() => {
    const copy = [...SponsUserDrivers];
    copy.sort((a,b) => {
      if (sortMode === "points") return b.points - a.points;
      if (sortMode === "id") return a.id - b.id;
      return 0;
    });
    return copy;
  }, [SponsUserDrivers, sortMode]);
  
  
  const pointAdjust = (value) => {
    if(!selectedSponsUser || !selectedDriver) return;
    const timestamp = new Date().toLocaleString();
    const reason = description?.trim() ? description.trim() : "No Reason Provided"
    setSponsUser(prev =>
      prev.map((SponsUser) => {
        if(SponsUser.id !== selectedSponsUserId) return SponsUser;

        const updatedDrivers = SponsUser.drivers.map((d) =>
          d.id === selectedDriver.id ? { ...d, points: d.points + value} : d
        );
        const newLog = {
          driverId: selectedDriver.id,
          driver: selectedDriver.name,
          change: value,
          reason,
          time: timestamp,
        };

        return{
          ...SponsUser,
          drivers: updatedDrivers,
          logs: [newLog, ...SponsUser.logs],
        };
      })
    );
    setDescription("");
  };
    /*setLogs(prev => [
      {
        driver: selectedDriver.name,
        change: value,
        reason: description || "No Reason Provided",
        time: timestamp
      },
      ...prev
    ]);
    setDescription("");
  };
  */
  const navigate = useNavigate();

  const handleAdminAccountTakeover = () => {
    if (!selectedDriver) return;
    navigate(`/admin/drivers/${selectedDriver.id}/edit`);
  };

  return(
    <Container className="mt-4">
      <div style={{ position: "relative", minHeight: "100vh", padding: "40px" }}>
        <h1><strong>{t('admin.title')}</strong></h1>

        <Tabs defaultActiveKey="manage" className="mb-4">
          <Tab eventKey="manage" title={t('admin.manageDrivers')}>
            <Row>
              {/* <Col md={3}>
                <Card>
                  <Card.Body>
                    <Card.Title>{t('admin.sponsoredUsers')}</Card.Title>
                    <ListGroup>
                      {SponsoredUsers.map((c) => (
                        <ListGroupItem
                          key={c.id}
                          action
                          active={c.id === selectedSponsUserId}
                          onClick={() => {
                            setSelectedSponsUserId(c.id);
                            setSelectedDriverId(null);
                          }}
                        >
                        {c.name}
                        </ListGroupItem>
                      ))}
                    </ListGroup>
                  </Card.Body>
                </Card>
              </Col> */}

              <Col md={4}>
                <Card>
                  <Card.Body>
                    <Card.Title>Drivers</Card.Title>
                      {loadingDriverUsers ? (<div className="text-muted">Loading drivers...</div>) : !driverUsers.length ? (<div className="text-muted">No drivers found.</div>) : (<>
                      <ListGroup className="mb-3">
                        {driverUsers.map((user) => (
                          <ListGroupItem key={user.username} action active={user.username === selectedDriverUsername} onClick={() => setSelectedDriverUsername(user.username)}>
                            <div className="fw-semibold">{user.name || user.preferred_username || user.username}</div>
                            <div className="text-muted" style={{ fontSize: "0.9rem" }}>{user.email || user.username}</div>
                          </ListGroupItem>
                        ))}
                      </ListGroup>
                      <Button style={{ width: "160px", height: "50px" }} variant="outline-secondary" onClick={loadDriverUsers} disabled={loadingDriverUsers}>Refresh</Button>
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
                        {t('admin.driver')}: <strong>{selectedDriver.name}</strong>
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
                        ) : (<>
                          <p className="mb-3">Manage account information for{" "}<strong>{selectedDriverUser.name || selectedDriverUser.preferred_username || selectedDriverUser.username}</strong>.</p>
                          <Button style={{ width: "160px", height: "50px" }} variant="secondary" onClick={() => navigate(`/admin/drivers/${selectedDriverUser.username}/edit`)}>Edit Account</Button>
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
                      {roleCardError && (<div className="alert alert-danger py-2">{roleCardError}</div>)}
                      {roleCardMessage && (<div className="alert alert-success py-2">{roleCardMessage}</div>)}
                      {loadingPendingUsers ? (<div className="text-muted">Loading unassigned users...</div>) : 
                        !unassignedUsers.length ? (<div className="text-muted">No unassigned users found.</div>) : 
                      (
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
                                <Button style={{ width: "160px", height: "50px" }} onClick={handleAssignRole} disabled={assigningRole}>{assigningRole ? "Assigning..." : "Assign Role"}</Button>
                                <Button style={{ width: "160px", height: "50px" }} variant="outline-secondary" onClick={handleDismissUnassignedUser}>Remove From List</Button>
                              </div>
                            </>
                          )}
                        </>
                      )}
                      <Button style={{ width: "160px", height: "50px" }} variant="outline-secondary" className="mt-3" onClick={loadUnassignedUsers} disabled={loadingPendingUsers}>Refresh</Button>
                  </Card.Body>
                </Card>
              </Col>
          </Tab>

          <Tab eventKey="sponsors" title="Manage Sponsors">
            <Row>
              <Col md={4}>
                <Card>
                  <Card.Body>
                    <Card.Title>Sponsors</Card.Title>
                    {loadingSponsors ? (
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
                              onClick={() => handleSponsorSelect(user.username)}
                            >
                              <div className="fw-semibold">{user.name || user.preferred_username || user.username}</div>
                              <div className="text-muted" style={{ fontSize: "0.9rem" }}>{user.email || user.username}</div>
                            </ListGroupItem>
                          ))}
                        </ListGroup>
                        <Button style={{ width: "160px", height: "50px" }} variant="outline-secondary" onClick={loadSponsorUsers} disabled={loadingSponsors}>Refresh</Button>
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              <Col md={5}>
                <Card>
                  <Card.Body>
                    <Card.Title>Point to Dollar Conversion Ratio</Card.Title>
                    {!selectedSponsorUsername ? (
                      <div className="text-muted">Select a sponsor to manage their ratio.</div>
                    ) : (
                      <>
                        <p style={{ fontSize: 14, opacity: 0.7 }}>
                          Set how many dollars each point is worth for this sponsor's drivers.
                        </p>
                        <Form.Group className="mb-3">
                          <Form.Label>Dollars per Point</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.001"
                            min="0.001"
                            max="1.0"
                            value={sponsorRatioInput}
                            onChange={(e) => {
                              setSponsorRatioInput(e.target.value);
                              setSponsorRatioError("");
                              setSponsorRatioSuccess("");
                            }}
                            isInvalid={!!sponsorRatioError}
                          />
                          <Form.Text className="text-muted">
                            Enter value between 0.001 and 1.0 (e.g., 0.10 means 10 points = $1)
                          </Form.Text>
                          {sponsorRatioError && (
                            <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                              {sponsorRatioError}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>

                        {sponsorRatioSuccess && <Alert variant="success">{sponsorRatioSuccess}</Alert>}

                        <div className="mb-3" style={{ padding: 10, backgroundColor: '#f8f9fa', borderRadius: 5 }}>
                          <strong>Preview:</strong>
                          <ul style={{ marginTop: 10, marginBottom: 0 }}>
                            <li>100 points = ${(100 * (parseFloat(sponsorRatioInput) || DEFAULT_RATIO)).toFixed(2)}</li>
                            <li>1000 points = ${(1000 * (parseFloat(sponsorRatioInput) || DEFAULT_RATIO)).toFixed(2)}</li>
                          </ul>
                        </div>

                        <div className="d-flex gap-2">
                          <Button variant="primary" onClick={handleSaveRatio} disabled={savingRatio || !!sponsorRatioError}>
                            {savingRatio ? "Saving..." : "Save Changes"}
                          </Button>
                          <Button variant="secondary" onClick={() => { setSponsorRatioInput(DEFAULT_RATIO.toString()); setSponsorRatioError(""); setSponsorRatioSuccess(""); }}>
                            Reset to Default
                          </Button>
                        </div>
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
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
                  {t('admin.logs')} {selectedSponsUser ? `(${selectedSponsUser.name})` :""}
                  </Card.Title>
                  {!SponsUserLogs.length ? (
                    <div className="text-muted mt-3">{t('admin.noAdjustmentsLogged')}</div>
                ) : (
                  <ListGroup>
                    {SponsUserLogs.map((log,index) => (
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
                          <div className="text-muted" style={{ fontSize: "0.9rem"}}>
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