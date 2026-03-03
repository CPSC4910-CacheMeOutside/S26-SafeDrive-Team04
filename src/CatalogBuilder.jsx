import { useEffect, useState } from 'react';
import StarRating from "./StarRating";
import { Tab, ListGroup, Row, Col, Modal, Stack, Carousel,
    Button, Image, Card, ListGroupItem, Form} from 'react-bootstrap';

export default function CatalogBuilder({view}) {

    // Load in the page. Contact the store api first
    useEffect(() => {
        getProducts();
    }, []);

    // Modal to display filtering options
    const[showFilter, setShowFilter] = useState(false);
    const openFilter = () => setShowFilter(true);
    const closeFilter = () => setShowFilter(false);

    // State trackers for various search queries
    const [catalog, updateCatalog] = useState([]);
    const [catalogLimit, setCatalogLimit] = useState(10);
    const [catalogOffset, setCatalogOffset] = useState(0);
    const [queryByName, setQueryByName] = useState('');
    const [queryMinPrice, setQueryMinPrice] = useState(0);
    const [queryMaxPrice, setQueryMaxPrice] = useState(Number.MAX_SAFE_INTEGER);

    // Contact the external store API
    async function getProducts() {
        try {
            const productRequest = await fetch(`https://api.escuelajs.co/api/v1/products?offset=${catalogOffset}&limit=${catalogLimit}`);
            const productData = await productRequest.json();
            console.log(productData);
            let refinedCatalog = productData.map(rawProduct => (
                {
                    pId: rawProduct.id,
                    title: rawProduct.title,
                    imgs: rawProduct.images,
                    synop: rawProduct.slug,
                    desc: rawProduct.description,
                    catagory: rawProduct.category.name,
                    price: rawProduct.price,
                    available: true
                }
            ));
            updateCatalog(refinedCatalog)
        
        } catch (err) {
            console.log(err);
            updateCatalog([])
        }
    }
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
                    <Card style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <Col>
                            <Row>
                                <Carousel className="bg-secondary">
                                    {product.imgs.map(img => 
                                        (
                                            <Carousel.Item>
                                                <Image width={300} src={img} fluid/>
                                            </Carousel.Item>
                                        )
                                    )}
                                </Carousel>
                            
                            </Row>
                            <Row>
                                <h1>{product.title}</h1>
                            </Row>
                            <Row>
                                <Col>
                                    <h3><strong>Price:</strong> {product.price} PTs</h3>
                                    <Stack direction='horizontal' gap={1}>
                                        <div><p><strong>Rating:</strong></p></div>
                                        <div><StarRating itemKey={String(product.pId)} /></div>
                                    </Stack>
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
                        <Image src={product.imgs[0]} fluid />
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
                <h1 className="mb-0">Your Catalog</h1>
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
                                        <CatalogItemList key={item.pId} product={item} likeid={item.pId}></CatalogItemList>
                                    )
                                )}
                                {/* Display nothing if the filter doesn't retrieve anything */}
                                {filtered.length === 0 && (
                                    <ListGroup.Item key={'noSearch'} likeid={'noSearch'} className="text-muted mt-3">No items match your search.</ListGroup.Item>
                                )}
                            </ListGroup>
                        </Card>
                    </Col>
                    <Col sm={6}>
                        <Tab.Content>
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