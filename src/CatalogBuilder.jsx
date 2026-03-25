import { use, useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import { getProducts, PalatziQueryStruct } from './catalog/store-api';
import StarRating from "./StarRating";
import { Tab, ListGroup, Row, Col, Modal, Stack, Carousel, ButtonGroup,
    Button, Image, Card, ListGroupItem, Form} from 'react-bootstrap';

export default function CatalogBuilder(sponsorId) {

    // Client used to add products to the backend catalog
    const client = generateClient();

    // The current user's data, including driver assignments
    const [activeUser, switchActiveUser] = useState(null);

    // Modal to display filtering options
    const[showFilter, setShowFilter] = useState(false);
    const openFilter = () => setShowFilter(true);
    const closeFilter = () => setShowFilter(false);

    // State trackers for various search queries
    const [catalog, updateCatalog] = useState([]);
    const [filter, updateFilter] = useState(new PalatziQueryStruct());
    const [pName, updatePName] = useState('');
    const [perPage, updatePerPage] = useState(10);
    
    // Load in the page. Load the sponsor's user data, then contact store api
    useEffect(() => {

        // Retrieve the sponsor's pool of assigned drivers
        console.log("Retrieving sponsor user data...")
        const { Sponsor: SponsoredUser, SErrors} = client.models.Sponsor.get({
            sponsorId: sponsorId
        })

        if (SErrors) {
            console.log(`Failure: Could not retireve sponsor of ID ${sponsorId}: `, SErrors);
            return;
        } else if (SponsoredUser === null) {
            console.log(`Failure: Sponsor of ID ${sponsorId} does not exist`);
            return;
        }
        
        switchActiveUser(SponsoredUser);
        console.log("Retrieved sponsor user data: ", SponsoredUser)

        loadProducts();
        console.log("Filters have been updated to: ", filter);
    }, [filter]);

    // Applies the staged title change
    function applyPName () {
        updateFilter(filter.update({
            title: String(pName),
            offset: 0
        }));
    }

    // Applies the staged per page change
    function applyPerPage (newLimit) {
        updateFilter(filter.update({
            limit: Number(newLimit),
            offset: 0
        }));
    }

    // Applies the staged page selection
    function applyOffset(newOffset) {
        updateFilter(filter.update({
            offset: Number(newOffset)
        }))
    }

    // Applies all staged filters
    function applyAllFilter() {
        updateFilter(filter.update({
            title: String(pName),
            limit: Number(perPage),
            offset: 0,
        }))
    }

    // Add the product to the sponsor's catalog
    async function addProduct(product) {
        // Check if product in database
        console.log("Checking database for product: ", product)
        const {productData: dbProduct, dbErrors} = await client.models.Product.get({
            pId: product.pId
        });

        if (dbErrors) {
            console.log("Failure: Couldn't find product in database: ", dbErrors);
            return;
        }

        // If not add product to database
        if (dbProduct === null) {
            console.log("product wasn't found in databse. Adding it now...")
            const {dbData: addedProduct, errors} = await client.models.Product.create({
                pId: product.pId,
                title: product.title,
                imgs: product.imgs,
                synop: product.synop,
                category: product.category,
                price: product.price,
                available: true
            });

            if (errors) {
                console.log("Failure: Couldn't add product to database: ", errors);
                return;
            }
        }

        // Add the product to the sponsor's catalog. Create CatalogProduct instances for each
        console.log(`Adding product id${product.pId} to catalog of sponsor id:${sponsorId}`)
        await activeUser.drivers.forEach(driver => {
            console.log("Adding for driver id:", driver.driverId)
            const {driverCatalog: addedToCatalog, dErrors} = client.models.CatalogProduct.create({
                driverId: driver.driverId,
                sponsorId: sponsorId,
                pId: product.pId
            })

            if (dErrors) {
                console.log(`Failure: Couldn't add product id:${product.pId} to sponsor id:${sponsorId}: `, dErrors);
                return;
            } else if (addedToCatalog === null) {
                console.log(`Failure: Couldn't add product id:${product.pId} to sponsor id:${sponsorId}: The ProductCatalog
                model was created as null`);
                return;
            }
        });
    }

    // Remove an item from the catalog
    async function removeProduct(product) {
        console.log(`Removing product id:${product.pId} from sponsor's id:${sponsorId} catalog`)
        await activeUser.drivers.forEach(driver => {
            console.log()
            const {driverCatalog: removedFromCatalog, dErrors} = client.models.CatalogProduct.delete({
                driverId: driver.driverId,
                sponsorId: sponsorId,
                pId: product.pId
            });

            if (dErrors) {
                console.log(`Failure: Couldn't remove product id:${product.pId} from catalog of sponsor id:${sponsorId}: `, dErrors);
                return;
            } else if (removedFromCatalog === null) {
                console.log(`Failure: Couldn't add product id:${product.pId} to sponsor id:${sponsorId}: You cannot remove
                an item that is null`);
                return;
            }
        });
    }

    // Contact the external store API and retrieve all product information
    async function loadProducts() {
        try {
            let refinedCatalog = await getProducts(filter);
            updateCatalog(refinedCatalog)
        
        } catch (err) {
            console.log("Failure: Could not load products: ", err);
            updateCatalog([])
        }
    }
    
    function FilterModal() {
        const [min, setMin] = useState(filter.price_min);
        const [max, setMax] = useState(filter.price_max);
        const [category, setCategory] = useState(filter.categorySlug);

        useEffect(() => {
            if (showFilter) {
                setMin(filter.price_min);
                setMax(filter.price_max);
                setCategory(filter.categorySlug);
            }
        }, [showFilter]);

        function clearFilter() {
            setMin(0);
            setMax(Number.MAX_SAFE_INTEGER);
            setCategory('')
            updateFilter(new PalatziQueryStruct())
        }

        function applyExtraFilter() {
            updateFilter(filter.update({
                title: String(pName),
                limit: Number(perPage),
                offset: 0,
                price_min: min,
                price_max: max,
                categorySlug: category
            }))
        }

        return (
            <Modal show={showFilter} onHide={closeFilter}>
                <Modal.Header>
                    <Modal.Title>Filter</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                {/* The filter form */}
                    <Form>
                        <Form.Group controlId='productCategory'>
                            <Form.Label>Category</Form.Label>
                            <Form.Select onChange={e => setCategory(String(e.target.value))}
                                defaultValue={filter.categorySlug}>
                                <option value="">All</option>
                                <option value="clothes">Clothing</option>
                                <option value="furniture">Furniture</option>
                                <option value="shoes">Shoes</option>
                                <option value="technology">Technology</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group controlId='priceRange'>
                            <Form.Label>Price Range</Form.Label>
                            <Form.Text>From</Form.Text>
                            <Form.Control 
                                onChange={e => setMin(Number(e.target.value))}
                                defaultValue={filter.price_min}
                                type='text' 
                                placeholder='0 - ...'/>
                            <Form.Text>To</Form.Text>
                            <Form.Control
                                onChange={e => setMax(Number(e.target.value))}
                                defaultValue={filter.price_max}
                                type='text' 
                                placeholder='0 - ...'/>
                        </Form.Group>
                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowFilter(false)} >Cancel</Button>
                    <Button variant="secondary" onClick={() => {
                        clearFilter();
                        setShowFilter(false);
                        }} >Clear</Button>
                    <Button variant="primary" onClick={() => {
                        applyExtraFilter();
                        setShowFilter(false);
                    }}>Apply</Button>
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
                                {product.imgs.map((img, idk) => 
                                    (
                                        <Carousel.Item key={idk}>
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
                                <UpdateCatalogButton product={product}/>
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
                        <h4>${product.price}</h4>
                        <p>{product.synop}</p>
                        <UpdateCatalogButton product={product}/>
                    </Col>
                </Row>
            </ListGroup.Item>
        );
    }

    async function UpdateCatalogButton({product}) {
        const { data: rProduct, errors } = await client.models.CatalogProduct.list({
            pId: product.pId,
            sponsorId: sponsorId
        }) 

        if (errors) {
            console.log(`Failure: The update catalog button on product ${product.pId} could not 
            verify if the product was in the catalog: `, errors)
        }

        const [inCatalog, updateInCatalog] = useState(rProduct.length > 0);

        if (inCatalog) {
            return (<span onClick={ () => {
                removeProduct(product);
                updateInCatalog(false);
                
            }} className="btn btn-danger">Remove</span>);
        } else {
            return (<span onClick={ () => {
                addProduct(product); 
                updateInCatalog(true);
            }} className="btn btn-primary">Add To Catalog</span>);
        }
    } 

    /* The main Catalog Page */
    return (
        <div style={{ marginTop: '30px' }}>
            <FilterModal/>
            {/* Changed the header row so the search bar is in there */}
            <Stack direction='horizontal' >
                <Col>
                    <Form className="d-flex gap-2 align-items-end">
                        <Col>
                            <Form.Control
                                onChange={e => updatePName(e.target.value)}
                                defaultValue={''}
                                type='text' 
                                placeholder='Search by name...'
                                style={{ width: '18rem' }}/>
                        </Col>
                        <Col>
                            <Form.Select 
                                onChange={e => applyPerPage(e.target.value)}
                                defaultValue={10}
                                style={{ width: '5rem' }}>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </Form.Select>
                        </Col>
                        <Col>
                            <Button variant='primary' onClick={() => applyPName()}>Search</Button>
                        </Col>
                    </Form>
                </Col>
                <Col>
                    <Button variant='secondary' onClick={openFilter}>
                        <Image style={{height:'25px', width:'25px'}} src='filterIco.png' fluid/>
                    </Button>
                </Col>
            </Stack>
            <Tab.Container id="driver-catalog" defaultActiveKey={"defaultChoice"}>
                <Row>
                    <Col sm={5} className='pe-3'>
                        <Card>
                            <ListGroup style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                                <ListGroupItem hidden={true} action eventKey={'defaultChoice'}>Default</ListGroupItem>
                                {/* make is so only the items matching the search are shown */}
                                {catalog.map((item, idx) =>
                                    (
                                        <CatalogItemList key={item.pId} product={item} likeid={item.pId}></CatalogItemList>
                                    )
                                )}
                                {/* Display nothing if the filter doesn't retrieve anything */}
                                {catalog.length === 0 && (
                                    <ListGroup.Item key={'noSearch'} likeid={'noSearch'} className="text-muted mt-3">No items match your search.</ListGroup.Item>
                                )}
                            </ListGroup>
                            <ButtonGroup className="sm">
                                <Form>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Page:</Form.Label>
                                        <Form.Control type="text" onChange={(e) => {applyOffset(e.target.value)}} value={filter.offset}/>
                                    </Form.Group>
                                </Form>
                                <Button onClick={() => { 
                                    if (filter.offset > 0) {
                                        applyOffset(filter.offset-1);
                                    }
                                }}><Image style={{height:'25px', width:'25px'}} src='leftArrowIco.png' fluid/></Button>
                                <Button onClick={() => {
                                    if (catalog.length === filter.limit) {
                                        applyOffset(filter.offset+1);
                                    }
                                }}><Image style={{height:'25px', width:'25px'}} src='rightArrowIco.png' fluid/></Button>
                            </ButtonGroup>
                        </Card>
                    </Col>
                    <Col sm={6}>
                        <Tab.Content style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            <Tab.Pane eventKey={"defaultChoice"}> 
                                <Card>
                                    <Card.Title> Welcome </Card.Title>
                                    <Card.Text> Click an item to view it.</Card.Text>
                                </Card>
                            </Tab.Pane>
                            {
                                catalog.map((item, idx) =>
                                (
                                    <CatalogItemPane product={item} key={item.pId} likeId={item.pId}></CatalogItemPane>
                                )
                            )}
                            {catalog.length === 0 && (
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