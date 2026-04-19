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
import { ListGroupItem } from 'react-bootstrap';
import { fetchUnassignedUsers, assignUserGroup } from './adminAssignRoles-api';
import { fetchDriverUsers } from './adminUpdateDriverInfo-api';

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
      setDriverUsersError(t('admin.failedToLoadDrivers'));
    } finally {
      setLoadingDriverUsers(false);
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
      setRoleCardError(t('admin.failedToLoadUnassignedUsers'));
    } finally {
      setLoadingPendingUsers(false);
    }
  };

  useEffect(() => {loadDriverUsers(); loadUnassignedUsers();}, []);

  const handleAssignRole = async () => {
    if (!selectedPendingUser) return;

    try {
      setAssigningRole(true);
      setRoleCardError("");
      setRoleCardMessage("");

      await assignUserGroup(selectedPendingUser.username, selectedRole);

      setRoleCardMessage(
        `${selectedPendingUser.name || selectedPendingUser.username} ${t('admin.assignedTo')} ${selectedRole}.`
      );

      const updatedUsers = unassignedUsers.filter(
        (u) => u.username !== selectedPendingUser.username
      );
      setUnassignedUsers(updatedUsers);
      setSelectedPendingUsername(updatedUsers[0]?.username ?? "");
    } catch (error) {
      console.error(error);
      setRoleCardError(t('admin.failedToAssignRole'));
    } finally {
      setAssigningRole(false);
    }
  };

  const handleDismissUnassignedUser = () => {
    if (!selectedPendingUser) return;

    const updatedUsers = unassignedUsers.filter((u) => u.username !== selectedPendingUser.username);

    setUnassignedUsers(updatedUsers);
    setSelectedPendingUsername(updatedUsers[0]?.username ?? "");
    setRoleCardMessage(`${selectedPendingUser.name || selectedPendingUser.username} ${t('admin.removedFromList')}`);
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
                    <Card.Title>{t('admin.driversTitle')}</Card.Title>
                      {loadingDriverUsers ? (<div className="text-muted">{t('admin.loadingDrivers')}</div>) : !driverUsers.length ? (<div className="text-muted">{t('admin.noDriversFound')}</div>) : (<>
                      <ListGroup className="mb-3">
                        {driverUsers.map((user) => (
                          <ListGroupItem key={user.username} action active={user.username === selectedDriverUsername} onClick={() => setSelectedDriverUsername(user.username)}>
                            <div className="fw-semibold">{user.name || user.preferred_username || user.username}</div>
                            <div className="text-muted" style={{ fontSize: "0.9rem" }}>{user.email || user.username}</div>
                          </ListGroupItem>
                        ))}
                      </ListGroup>
                      <Button style={{ width: "160px", height: "50px" }} variant="outline-secondary" onClick={loadDriverUsers} disabled={loadingDriverUsers}>{t('admin.refresh')}</Button>
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
                    <Card.Title>{t('admin.editDriverAccount')}</Card.Title>
                      {!selectedDriverUser ? (
                        <div className="text-muted">{t('admin.selectDriverToManageAccount')}</div>
                        ) : (<>
                          <p className="mb-3">{t('admin.manageAccountInfoFor')}{" "}<strong>{selectedDriverUser.name || selectedDriverUser.preferred_username || selectedDriverUser.username}</strong>.</p>
                          <Button style={{ width: "160px", height: "50px" }} variant="secondary" onClick={() => navigate(`/admin/drivers/${selectedDriverUser.username}/edit`)}>{t('admin.editAccount')}</Button>
                        </>
                      )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>

          <Tab eventKey="pendingUsers" title={t('admin.pendingUsers')}>
            <Col md={5}>
                <Card className="mb-4">
                  <Card.Body>
                    <Card.Title>{t('admin.assignRole')}</Card.Title>
                      {roleCardError && (<div className="alert alert-danger py-2">{roleCardError}</div>)}
                      {roleCardMessage && (<div className="alert alert-success py-2">{roleCardMessage}</div>)}
                      {loadingPendingUsers ? (<div className="text-muted">{t('admin.loadingUnassignedUsers')}</div>) :
                        !unassignedUsers.length ? (<div className="text-muted">{t('admin.noUnassignedUsersFound')}</div>) : 
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
                                <strong>{t('admin.selectedUser')}</strong><br />
                                {selectedPendingUser.name || t('admin.noName')}<br />
                                <span className="text-muted">
                                  {selectedPendingUser.email || selectedPendingUser.username}
                                </span>
                              </div>

                              <Form.Group className="mb-3">
                                <Form.Label>{t('admin.assignGroup')}</Form.Label>
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
                                <Button style={{ width: "160px", height: "50px" }} onClick={handleAssignRole} disabled={assigningRole}>{assigningRole ? t('admin.assigning') : t('admin.assignRole')}</Button>
                                <Button style={{ width: "160px", height: "50px" }} variant="outline-secondary" onClick={handleDismissUnassignedUser}>{t('admin.removeFromList')}</Button>
                              </div>
                            </>
                          )}
                        </>
                      )}
                      <Button style={{ width: "160px", height: "50px" }} variant="outline-secondary" className="mt-3" onClick={loadUnassignedUsers} disabled={loadingPendingUsers}>{t('admin.refresh')}</Button>
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