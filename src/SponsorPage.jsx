import { useNavigate } from "react-router-dom";
import { generateClient } from 'aws-amplify/data';
import { useEffect, useState } from "react";
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

const client = generateClient();


function SponsorPage() {
    const navigate = useNavigate;
    const auth = useAuth();
    const { t } = useLanguage();

    const [drivers, setDrivers] = useState([]);
    const [selectedId, setSelectedId] = useState("");
    const [amount, setAmount] = useState(10);
    const [sortMode, setSortMode] = useState("id");
    const [description, setDescription] = useState("");
    const [logs, setLogs] = useState([]);
    const [driverSearch, setDriverSearch] = useState("");
    const [logSearch, setLogSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const sponsorId = "sponsor-1";

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            const driverResult = await client.models.Driver.list();
            const txResult = await client.models.SponsorTransaction.list();

            if (driverResult.errors){
                console.error("Driver load error:", driverResult.errors);
            }

            if(txResult.errors){
                console.error("Transaction load error:", txResult.errors);
            }

            const loadedDrivers = (driverResult.data || [])
                .filter(driver => !driver.sponsorId || driver.sponsorId === sponsorId)
                .map(driver => ({
                    id: driver.driverId,
                    name: `${driver.firstName} ${driver.lastName}`,
                    points: driver.points ?? 0,
                    raw: driver
                }));

            const loadedLogs = (txResult.data || [])
                .filter(log => !log.sponsorId || log.sponsorId === sponsorId)
                .map(log => ({
                    id: log.transactionId,
                    driverId: log.driverId,
                    change: log.amount,
                    reason: log.reason || "No Reason Provided",
                    time: log.note || "No Timestamp",
                    balanceAfter: log.balanceAfter
                }));

            setDrivers(loadedDrivers);
            setLogs(loadedLogs);

            if (loadedDrivers.length > 0 && !selectedId){
                setSelectedId(loadedDrivers[0].id);
            }
        } catch(err){
            console.error("ERROR LOADING", err);
        } finally{
            setLoading(false);
        }
    };

    const selectedDriver = drivers.find(d => d.id === selectedId);

    const pointAdjust = async (value) => {
        if(!selectedDriver) return;


        const delta = Number(value);
        if(!Number.isFinite(delta)) return;

        const newPoints = selectedDriver.points + delta;
        if(newPoints < 0){
            alert(t('sponsor.cannotGoNegative'));
            return;
        }
        
        const timestamp = new Date().toLocaleString();
        const reasonText = description.trim() || "No Reason Provided";


        try{
            const updateResult = await client.models.Driver.update({
                driverId: selectedDriver.id,

                /* TODO: Points are no longer part of the driver, but rather stored in a 
                seperate schema called DriverSponsor whose primary key is a combination 
                of the driver's id and the sponsor's id. 

                Please modify this to reflect the new schema. 
                */ 
                points: newPoints
            });

            if(updateResult.errors){
                console.error("Driver update error", updateResult.errors)
                alert(t('sponsor.updateFailed'));
                return
            }

            // TODO: SponsorTransaction model slated for decreciation.
            const txResult = await client.models.SponsorTransaction.create({
                transactionId: crypto.randomUUID(),
                sponsorId: sponsorId,
                driverId: selectedDriver.id,
                amount: delta,
                type: delta > 0 ? "ADD" : "DEDUCT",
                reason: reasonText,
                note: timestamp,
                balanceAfter: newPoints
            });

            if(txResult.errors){
                console.error("Transaction create error:", txResult.errors);
                alert(t('sponsor.logFailed'))
            }

            setDescription("");
            await loadData();
        } catch(err){
            console.error("Point adj err", err);
            alert(t('sponsor.somethingWentWrong'));
        }
    };

    const sortedDrivers = [...drivers].sort((a,b) => {
        if (sortMode === "points") return b.points - a.points;
        if (sortMode === "id") return a.id - b.id;
        return 0;
    });

    const filteredDrivers = sortedDrivers.filter((d) => {
        const q = driverSearch.trim().toLowerCase();
        if(!q) return true;

        return(
            d.name.toLowerCase().includes(q) || String(d.id).includes(q)
        );
    });

    const filteredLogs = logs.filter((log) => {
        const q = logSearch.trim().toLowerCase();
        if(!q) return true;

        return(
            log.reason.toLowerCase().includes(q) ||
            String(log.change).includes(q) ||
            String(log.time).toLowerCase().includes(q)
        );
    });
    


    if(loading){
        return(
            <Container className="mt-4">
                <h3>{t('sponsor.loading')}</h3>
            </Container>
        );
    }
    return (
        <Container className="mt-4">
            <div style={{ position: "relative", minHeight: "100vh", padding: "40px" }}>
                <h1><strong>{t('sponsor.title')}</strong></h1>

                <Tabs defaultActiveKey="manage" className="mb-4">
                    <Tab eventKey="manage" title={t('sponsor.manageDrivers')}>
                        <Row>
                            <Col md={4}>
                                <Card>
                                    <Card.Body>
                                        <Card.Title>{t('sponsor.drivers')}</Card.Title>

                                        <div className="mb-4 d-flex gap-2">
                                            <Button
                                                size="sm"
                                                variant={sortMode === "points" ? "primary" : "outline-primary"}
                                                onClick={() => setSortMode("points")}
                                            >
                                                {t('sponsor.sortByPoints')}
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant={sortMode === "id" ? "primary" : "outline-primary"}
                                                onClick={() => setSortMode("id")}
                                            >
                                                {t('sponsor.sortById')}
                                            </Button>
                                        </div>

                                        <Form.Group className="mb-3">
                                            <Form.Control
                                                type="text"
                                                placeholder={t('sponsor.searchDriversPlaceholder')}
                                                value={driverSearch}
                                                onChange={(e) => setDriverSearch(e.target.value)}
                                            />
                                        </Form.Group>

                                        <ListGroup>
                                            {filteredDrivers.map(driver => (
                                                <ListGroup.Item
                                                    key={driver.id}
                                                    action
                                                    active={driver.id === selectedId}
                                                    onClick={() => setSelectedId(driver.id)}
                                                >
                                                    <div className="d-flex justify-content-between">
                                                        <span>{driver.name}</span>
                                                        <span className="text-muted">{driver.points}</span>
                                                    </div>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={8}>
                                <Card>
                                    <Card.Body>
                                        <Card.Title>{t('sponsor.adjustPoints')}</Card.Title>

                                        {selectedDriver ? (
                                            <>
                                                <p>
                                                    {t('sponsor.driverLabel')}: <strong>{selectedDriver.name}</strong><br />
                                                    {t('sponsor.currentPoints')}: <strong>{selectedDriver.points}</strong>
                                                </p>

                                                <Form.Group className="mb-3">
                                                    <Form.Label>{t('sponsor.amount')}</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        value={amount}
                                                        min={1}
                                                        onChange={(e) => setAmount(Number(e.target.value))}
                                                    />
                                                </Form.Group>

                                                <div className="d-flex gap-2 mb-3">
                                                    <Button variant="success" onClick={() => pointAdjust(amount)}>
                                                        {t('sponsor.addPoints')}
                                                    </Button>
                                                    <Button variant="danger" onClick={() => pointAdjust(-amount)}>
                                                        {t('sponsor.subtractPoints')}
                                                    </Button>
                                                </div>

                                                <Form.Group className="mb-3">
                                                    <Form.Label>{t('sponsor.reasonForAdjustment')}</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder={t('sponsor.descriptionPlaceholder')}
                                                        value={description}
                                                        onChange={(e) => setDescription(e.target.value)}
                                                    />
                                                </Form.Group>
                                            </>
                                        ) : (
                                            <p>{t('sponsor.noDriverSelected')}</p>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Tab>

                    <Tab eventKey="audit" title={t('sponsor.logsReports')}>
                        <Card>
                            <Card.Body>
                                <Card.Title>{t('sponsor.adjustmentHistory')}</Card.Title>

                                <Form.Group className="mb-3">
                                    <Form.Control
                                        type="text"
                                        placeholder={t('sponsor.searchTransactionPlaceholder')}
                                        value={logSearch}
                                        onChange={(e) => setLogSearch(e.target.value)}
                                    />
                                </Form.Group>

                                <ListGroup>
                                    {filteredLogs.map((log) => {
                                        const driverName =
                                            drivers.find(d => d.id === log.driverId)?.name || log.driverId;

                                        return (
                                            <ListGroup.Item key={log.id}>
                                                <strong>{driverName}</strong>{" "}
                                                {log.change > 0 ? t('sponsor.gained') : t('sponsor.lost')}{" "}
                                                <strong>{Math.abs(log.change)}</strong> {t('sponsor.points')}
                                                <br />
                                                <small>
                                                    {t('sponsor.reasonLabel')}: {log.reason} | {log.time}
                                                    {log.balanceAfter !== undefined && (
                                                        <> | {t('sponsor.balanceAfter')}: {log.balanceAfter}</>
                                                    )}
                                                </small>
                                            </ListGroup.Item>
                                        );
                                    })}
                                </ListGroup>
                            </Card.Body>
                        </Card>
                    </Tab>

                    <Tab eventKey="settings" title={t('sponsor.settings')}>
                        <Card>
                            <Card.Body>{t('sponsor.settingsComingSoon')}</Card.Body>
                        </Card>
                    </Tab>
                </Tabs>
            </div>
        </Container>
    );
}
export default SponsorPage;
