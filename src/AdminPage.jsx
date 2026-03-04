import { useAuth } from 'react-oidc-context';
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Form from "react-bootstrap/Form"
import Tabs from "react-bootstrap/Tabs"
import Tab from"react-bootstrap/Tab"
import { CardBody, ListGroupItem } from 'react-bootstrap';

function AdminPage(){
  
  const [companies, setCompany] = useState([
    {id: "EBD", name: "East Bound and Down", 
      drivers: [
        {id: 5, name: "Jerry Reed", points: 300},
        {id: 4, name: "Burt Reynolds", points: 330}
     ],
      logs: [],
    },

    {id: "SmkBdt", name: "Smokey and the Bandit",
      drivers: [
        {id: 1, name: "Bo Darvilel", points: 200},
        {id: 2, name: "Cledus Snow", points: 156},
        {id: 3, name: "Hot-Pants Hillard", points: 186}
      ],
      logs: [],
    },

    {id: "HwyMn", name: "Highway Men", 
      drivers: [
        {id: 6, name: "Johnny Cash", points: 400 },
        {id: 7, name: "Willie Nelson", points: 450},
        {id: 8, name: "Waylon Jennings", points: 500},
        {id: 9, name: "Kris Kristofferson", points: 400}
      ],
      logs: [],
    },
  ]);

  const [selectedCompanyId, setSelectedCompanyId] = useState(companies[0]?.id ?? "");


  /*const [drivers, setDrivers] = useState([
    { id: 1, name: "Bo Darvilel", points: 200 },
    { id: 2, name: "Cledus Snow", points: 156 },
    { id: 3, name: "Hot-Pants Hillard", points: 186 },
    { id: 4, name: "Burt Reynolds", points: 330 },
    { id: 5, name: "Jerry Reed", points: 300 }
  ]);
*/
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [amount, setAmount] = useState(10);
  const [sortMode, setSortMode] = useState("id");
  const [description, setDescription] = useState("");
 
  const selectedCompany = useMemo(
    () => companies.find((c) => c.id === selectedCompanyId),
    [companies, selectedCompanyId]

  );

  const companyDrivers = selectedCompany?.drivers ?? [];
  const companyLogs = selectedCompany?.logs ?? [];
 
  const validDriver = useMemo(() => {
    if (!companyDrivers.length) return null;
    if(selectedDriverId == null) return companyDrivers[0].id;
    const driverLoc = companyDrivers.some((d) => d.id === selectedDriverId);
    return driverLoc ? selectedDriverId : companyDrivers[0].id;

  }, [companyDrivers, selectedDriverId]);

  const selectedDriver = useMemo(
    () => companyDrivers.find((d) => d.id === validDriver) ?? null,
    [companyDrivers, validDriver]
  );

  const sortedDrivers = useMemo(() => {
    const copy = [...companyDrivers];
    copy.sort((a,b) => {
      if (sortMode === "points") return b.points - a.points;
      if (sortMode === "id") return a.id - b.id;
      return 0;
    });
    return copy;
  }, [companyDrivers, sortMode]);
  
  
  const pointAdjust = (value) => {
    if(!selectedCompany || !selectedDriver) return;
    const timestamp = new Date().toLocaleString();
    const reason = description?.trim() ? description.trim() : "No Reason Provided"
    setCompany(prev =>
      prev.map((company) => {
        if(company.id !== selectedCompanyId) return company;

        const updatedDrivers = company.drivers.map((d) =>
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
          ...company,
          drivers: updatedDrivers,
          logs: [newLog, ...company.logs],
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

  return(
    <Container className="mt-4">
      <div style={{ position: "relative", minHeight: "100vh", padding: "40px" }}>
        <h1><strong>Admin Dashboard</strong></h1>

        <Tabs defaultActiveKey="manage" className="mb-4">
          <Tab eventKey="manage" title="Manage Drivers">
            <Row>
              <Col md={3}>
                <Card>
                  <Card.Body>
                    <Card.Title>Companies</Card.Title>
                    <ListGroup>
                      {companies.map((c) => (
                        <ListGroupItem
                          key={c.id}
                          action
                          active={c.id === selectedCompanyId}
                          onClick={() => {
                            setSelectedCompanyId(c.id);
                            setSelectedDriverId(null);
                          }}
                        >
                        {c.name}
                        </ListGroupItem>
                      ))}
                    </ListGroup>
                  </Card.Body>
                </Card>
              </Col>

          <Col md={4}>
            <Card>
              <Card.Body>
                <Card.Title>
                  Drivers{" "}
                  {selectedCompany ? (
                    <span className='text-muted'>({selectedCompany.name})</span>
                  ) : null}
                  </Card.Title>
                    <div className="mb-3 d-flex gap-2">
                      <Button
                        size="sm"
                        variant={sortMode === "points" ? "primary" : "outline-primary"}
                        onClick={() => setSortMode("points")}
                      >
                        Sort by Points
                      </Button>

                      <Button
                        size="sm"
                        variant={sortMode === "id" ? "primary" : "outline-primary"}
                        onClick={() => setSortMode("id")}
                      >
                        Sort by ID
                      </Button>
                    </div>
                    <ListGroup>
                      {sortedDrivers.map(driver => (

                        <ListGroup.Item
                          key={driver.id}
                          action
                          active={driver.id === validDriver}
                          onClick={() => setSelectedDriverId(driver.id)}
                        >
                          <div className="d-flex justify-content-between">
                            <span>{driver.name}</span>
                            <span className="text-muted">{driver.points}</span>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>

                    {!companyDrivers.length && (
                      <div className="text-muted mt-3">
                        No Drivers Assigned to this Company Yet
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              <Col md={5}>
                <Card>
                  <Card.Body>
                    <Card.Title>Adjust Points</Card.Title>

                    {!selectedDriver ? (
                      <div className="text-muted">Select a driver to adjust points.</div>
                    ) : (
                      <>
                      <p>
                        Company: <strong>{selectedCompany?.name}</strong>
                        <br />
                        Driver: <strong>{selectedDriver.name}</strong>
                        <br />
                        Current Points: <strong>{selectedDriver.points}</strong>
                      </p>

                    <Form.Group className="mb-3">
                      <Form.Label>Amount</Form.Label>
                      <Form.Control
                        type="number"
                        value={amount}
                        min={1}
                        onChange={(e) => setAmount(Number(e.target.value))}
                      />
                    </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label> Reason for Adjustment</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Description for Point Change"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                      />
                    </Form.Group>
                    <div className="d-flex gap-2">
                      <Button variant="success" onClick={() => pointAdjust(amount)}>
                        + Add Points
                      </Button>
                      <Button variant="danger" onClick={() => pointAdjust(-amount)}>
                        - Subtract Points
                      </Button>
                    </div>
                  </>
                  )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>
          <Tab eventKey="audit" title="Logs/Reports">
            <Card>
              <Card.Body>
                <Card.Title>Companies</Card.Title>
                <ListGroup>
                  {companies.map((c) => (
                    <ListGroup.Item
                      key={c.id}
                      action
                      active={c.id === selectedCompanyId}
                      onClick={() => {
                        setSelectedCompanyId(c.id);
                        setSelectedDriverId(null);
                      }}
                    >
                    {c.name}

                    </ListGroup.Item>
                  ))}
                </ListGroup>
                {!companyLogs.length && (
                  <div className="text-muted mt-3"> No adjustments logged yet.</div>
                )}
              </Card.Body>
          </Card>
    </Tab>
  </Tabs>
 </div>
</Container>
  );  
}

export default AdminPage;