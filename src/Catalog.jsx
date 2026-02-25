import { useState } from 'react';
import { Tab, ListGroup, Row, Col, Modal,
    Button, Image, Card, ListGroupItem, Form} from 'react-bootstrap';

/* Here to test the catalog. Future versions will pull items from store API and backend */
const catalog = [
    {
        pId: 100,
        title: "iPhone 6",
        img: "productIco.png",
        synop: "The latest smartphone from apple.",
        desc: "Speakerphone, Accelerometer, Camera, Front Camera, 3D Depth Camera, Bluetooth Enabled, Digital Compass, Fingerprint Sensor, GPS, MMS (Multimedia Messaging), Motion & Gesture Control, OLED Display, Pressure Sensor, Retina Display, Streaming Video, Wi-Fi Capable",
        price: 1000,
        available: true
    },
    {
        pId: 101,
        title: "Bluetooth Speaker",
        synop: "A durable Bluetooh speaker with imersive sound.",
        img: "productIco.png",
        desc: "Take big JBL Pro sound wherever you go. The bold, colorful JBL Go 4 ultra-portable Bluetooth speaker fits in the palm of your hand, delivering clear, loud JBL Pro Sound with rich, punchy bass. Its newly redesigned integrated loop makes it easy to bring anywhere, and the variety of colorways means you can choose one that fits your vibe. Plus it's waterproof and dustproof, so it loves to go outside. And up to 7 hours of playtime means it will keep the good times rolling throughout a fun day trip or an evening chilling under the stars. Pair two Go 4's for stereo sound, or wirelessly connect multiple JBL Auracast-enabled speakers for even bigger sound. Crank it up and let your music take you anywhere.",
        price: 100,
        available: true
    },
    {
        pId: 102,
        title: "Logitech M220 Silent Wireless Mouse",
        img: "productIco.png",
        synop: "A wireless mouse offering lightning fast polling rate.",
        desc: "With the same click feel and 90% noise reduction* compared to classic mice, Logitech Silent Wireless Mouse offers a quiet experience for yourself and those around you. It has a long-lasting 18-month battery life with auto-sleep and a powerful 10-meter wireless range with 128-bit encryption between the mouse and the receiver. Plus, its small size is perfect to toss in a bag and go. Just plug the tiny USB receiver and it works with Windows®, Mac®, Chrome OS™ or Linux®. Finally, the Logitech® Advanced Optical Tracking is designed for smooth and precise moves on almost any surface.",
        price: 30,
        available: true
    },
    {
        pId: 103,
        title: "Labubu Doll",
        img: "productIco.png",
        synop: "Goofy ahh doll thing. I dunno.",
        desc: "Name: Vinyl Plush Pendant Blind Box Category: Labubu The Monsters Series: Big Into Energy Type: Plush Figure Size: 6 Inch Manufacturer: Pop Mart Description: The blind box contains a random figure from a specific series. Each blind box only contains one figure. No one, including us, knows what's inside. Blind boxes are fully random and we cannot accept requests for specific items. There chances of getting the secret edition are usually 1/72. These figures are the perfect gift for any occasion, be it Children's Day, Christmas, Halloween, Thanksgiving, or New Years. A piece of art expressing deep feelings and complicated emotions, it's also a wonderful home decor gift for your family or friends. Standing 6.69 inches in height, each figure is crafted from premium materials including durable PVC plastic, ABS, and paper. Finished with non-toxic, odorless paint, our toys meet rigorous safety standards to ensure a safety for customers. . Safety Warning: This product may contain sharp points, small parts that are choking hazards, and other elements that are not suitable for children under 3 years of age. We receive both US and Canadian Cases. You will get either English, bilingual or trilingual carded figures based on availability. Please understand this before ordering.",
        price: 9999999,
        available: false
    }
]

export default function Catalog({view}) {

    /* Modal to display filtering options*/

    const[showFilter, setShowFilter] = useState(false);
    const openFilter = () => setShowFilter(true);
    const closeFilter = () => setShowFilter(false);

    // State trackers for various search queries

    const [queryByName, setQueryByName] = useState('');
    const [queryMinPrice, setQueryMinPrice] = useState(0);
    const [queryMaxPrice, setQueryMaxPrice] = useState(Number.MAX_SAFE_INTEGER);

    // Filter catalog items whenever the query changes
    // The search looks at the title of the item but also he description.
    const filtered = catalog.filter(item =>
        (item.title.toLowerCase().includes(queryByName.toLowerCase()) ||
        item.desc.toLowerCase().includes(queryByName.toLowerCase())) &&
        (item.price >= queryMinPrice && item.price <= queryMaxPrice)
    );
    
    function applyFilter(name, min, max) {
        setQueryByName(name);
        setQueryMinPrice(min);
        setQueryMaxPrice(max);
        closeFilter();
    }

    function FilterModal() {
        const [name, setName] = useState('');
        const [min, setMin] = useState(0);
        const [max, setMax] = useState(Number.MAX_SAFE_INTEGER);

        function clearFilter() {
            setName('');
            setMin(0);
            setMax(Number.MAX_SAFE_INTEGER);
            setQueryByName('');
            setQueryMinPrice(0);
            setQueryMaxPrice(Number.MAX_SAFE_INTEGER);
        }

        return (
            <Modal show={showFilter} onHide={closeFilter}>
                <Modal.Header>
                    <Modal.Title>Filter</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                {/* The filter form */}
                    <Form>
                        <Form.Group controlId='productName'>
                            <Form.Label>Product Name</Form.Label>
                            <Form.Control 
                                onChange={e => setName(String(e.target.value))}
                                defaultValue={name}
                                type='text'
                                placeholder='Search items by name and description'/>
                        </Form.Group>
                        <Form.Group controlId='priceRange'>
                            <Form.Label>Price Range</Form.Label>
                            <Form.Text>From</Form.Text>
                            <Form.Control 
                                onChange={e => setMin(Number(e.target.value))}
                                defaultValue={min}
                                type='text' 
                                placeholder='0 - ...'/>
                            <Form.Text>To</Form.Text>
                            <Form.Control
                                onChange={e => setMax(Number(e.target.value))}
                                defaultValue={max}
                                type='text' 
                                placeholder='0 - ...'/>
                        </Form.Group>
                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowFilter(false)} >Cancel</Button>
                    <Button variant="secondary" onClick={() => clearFilter()} >Clear</Button>
                    <Button variant="primary" onClick={() => applyFilter(name, min, max)}>Apply</Button>
                </Modal.Footer>
            </Modal>
        );
    }

    /* The fully detailed view of each catalog item */
    function CatalogItemPane({product}) {
        return (
                <Tab.Pane eventKey={product.pId} >
                    <Card>
                        <Col>
                            <Row>
                                {/* Maybe replace with a carousel */}
                                <Image src={product.img}/>
                            </Row>
                            <Row>
                                <h1>{product.title}</h1>
                            </Row>
                            <Row>
                                <Col>
                                    <h3><strong>Price:</strong> {product.price} PTs</h3>
                                    <p><strong>Description: </strong>{product.desc}</p>
                                    {( product.available === true
                                        ? ( <Button variant='primary'>Request</Button> )
                                        : ( <p>Unavailable!</p>)
                                    )}
                                </Col>
                            </Row>
                        </Col>
                    </Card>
                </Tab.Pane>
        );
    }

    /* The container for each item in the list*/
    function CatalogItemList({product}) {
        return (
            <ListGroup.Item action eventKey={product.pId}>
                <Row>
                    <h2>{product.title}</h2>
                </Row>
                <Row>
                    <Col>
                        <Image src={product.img} fluid />
                    </Col>
                    <Col>
                        <h4>{product.price} PTs</h4>
                        <p>{product.synop}</p>
                        {( product.available === true
                            ? ( <span className="btn btn-primary">Request</span> )
                            : ( <p>Unavailable!</p>)
                        )}
                    </Col>
                </Row>
            </ListGroup.Item>
        );
    }

    /* The main Catalog Page */
    return (
        <div style={{ marginTop: '30px' }}>
            <FilterModal/>
            {/* Changed the header row so the search bar is in there */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="mb-0">Sponsor Catalog</h1>
                {/* The search updates on every keypress */}
                <Button variant='secondary' onClick={openFilter}>
                    <Image style={{height:'25px', width:'25px'}} src='filterIco.png' fluid/>
                </Button>
            </div>
            <Tab.Container id="driver-catalog" defaultActiveKey={"defaultChoice"}>
                <Row>
                    <Col sm={5} className='pe-3'>
                        <Card>
                            <ListGroup style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                <ListGroupItem hidden={true} action eventKey={'defaultChoice'}>Default</ListGroupItem>
                                {/* make is so only the items matching the search are shown */}
                                {filtered.map((item, idx) =>
                                    (
                                        <CatalogItemList key={item.pId} product={item} likeId={item.pId}></CatalogItemList>
                                    )
                                )}
                                {/* Display nothing if the filter doesn't retrieve anything */}
                                {filtered.length === 0 && (
                                    <ListGroup.Item key={'noSearch'} likeId={'noSearch'} className="text-muted mt-3">No items match your search.</ListGroup.Item>
                                )}
                            </ListGroup>
                        </Card>
                    </Col>
                    <Col sm={6}>
                        <Tab.Content style={{ maxHeight: '500px', overflowY: 'auto' }}>
                            <Tab.Pane eventKey={"defaultChoice"}> 
                                <Card>
                                    <Card.Title> Welcome </Card.Title>
                                    <Card.Text> Click an item to view it.</Card.Text>
                                </Card>
                            </Tab.Pane>
                            {
                                filtered.map((item, idx) =>
                                (
                                    <CatalogItemPane product={item} key={item.pId} likeId={item.pId}></CatalogItemPane>
                                )
                            )}
                            {filtered.length === 0 && (
                                <Card>
                                    <h1>No items match your search</h1>
                                </Card>
                            )}
                        </Tab.Content>
                    </Col>
                </Row>
                
                
            </Tab.Container>
        </div>
    );
}