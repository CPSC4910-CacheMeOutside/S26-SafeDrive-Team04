import { use, useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import useAmplifyAuth from './UseAmplifyAuth';
import { updateUserAttributes, fetchUserAttributes } from 'aws-amplify/auth';
import StarRating from "./StarRating";
import { Tab, ListGroup, Row, Col, Modal, Stack, Carousel, ButtonGroup,
    Button, Image, Card, ListGroupItem, Form} from 'react-bootstrap';
import { useLanguage } from './LanguageContext';

export default function CatalogBuilder(sponsorId) {

    const { t } = useLanguage();

    // Client used to add products to the backend catalog
    const client = generateClient();

    const auth = useAmplifyAuth();
    // The sponsor's data
    const [sponsoredUser, setSponsoredUser] = useState(null);
    // Modal to display filtering options
    const[showFilter, setShowFilter] = useState(false);
    const openFilter = () => setShowFilter(true);
    const closeFilter = () => setShowFilter(false);
    // The list of products from the table to show
    const [catalog, updateCatalog] = useState([]);
    // Filters to curate the products shown on screen
    const [pName, updatePName] = useState('');
    const [minPrice, updateMinPrice] = useState(null);
    const [maxPrice, updateMaxPrice] = useState(null);
    const [category, updateCategory] = useState('');
    const [showInCatalog, setShowInCatalog] = useState(false);
    // Controls for traversing the storefront
    const [perPage, updatePerPage] = useState(10);
    const [storePages, updateStorePages] = useState([]); // A stack containing nextTokens
    
    // Load in the page. Contact the store api first and load the sponsor's data
    useEffect(() => {        

        async function getAmpData(sId) {
            const { data: sponsor, errors } = await client.models.Sponsor.get({
                sponsorId: sId
            });

            if (errors) {
                console.log(`Error: Failed to retrieve sponsor id:${sId} from Amplify Data: `, errors);
                return;
            } else if (sponsor === null) {
                console.log(`Error: No sponsor of id:${sId} found in database`);
                return;
            }

            console.log(`Sponsor Data Retrieved from Database: `, sponsor)
            return sponsor;
        }

        async function getCog() {
            try {
                const cogAttr = await fetchUserAttributes(); 
                console.log(`Sponsor Data Retrieved from Cognito: `, cogAttr);
                return cogAttr;
            } catch(err) {
                console.log(`Error: Failed to retrive sponsor id:${sponsorId} from Cognito: `, err);
                return;
            }
        }

        async function loadSponsorData() {
            // Confirm user is logged in and is sponsor
            if (auth.isLoading) {
                console.log("Error: Aborting user load. Auth is still loading");
                return;
            }
            if (!auth.isAuthenticated) {
                console.log("Error: Aborting user load. User is not authenticated");
                return;
            }
            if (!auth.groups?.includes("Sponsor")) {
                console.log("Error: Aborting user load. User is not a sponsor");
                return;
            };

            // Get the sponsored user's data
            const cogData = await getCog();
            const dbData = await getAmpData(cogData.sub);

            // Populate the sponsor data into the state
            const userData = {
                id: cogData.sponsorId,
                drivers: await dbData.drivers()
            }

            setSponsoredUser(userData)
        }

        loadSponsorData();
        console.log("Sponsor has been update to the following object: ", sponsoredUser);
        loadProducts();
    }, [auth.isLoading, auth.isAuthenticated, auth.groups]);

    // Add the product to the sponsor's catalog
    async function addProduct(product) {

        // Create the catalog assignment
        for (const dr of sponsoredUser.drivers) {
            const { data: assignment, aErrors } = await client.models.CatalogProduct.create({
                pId: product.pId,
                sponsorId: sponsoredUser.sponsorId,
                driverId: dr.driverId
            });

            if (aErrors) {
                console.log(`Error: Could not assign product:${product.pId} to driver:${dr.driverId}: "`, aErrors);
                return;
            } else if (assignment === null) {
                console.log(`Error: Could not assign product:${product.pId} to driver:${dr.driverId}: Created null"`);
                return;
            }
        };
        console.log(`Added product:${dbProduct.pId} to sponsor:${sponsoredUser.sponsorId} catalog`);
    }

    // Remove an item from the catalog
    async function removeProduct(product) {
        for (const dr of sponsoredUser.drivers) {
            const { data: deletedAssignment, aErrors } = await client.models.CatalogProduct.delete({
                pId: product.pId,
                sponsorId: sponsoredUser.sponsorId,
                driverId: dr.driverId
            });

            if (aErrors) {
                console.log("Error: Could not delete assignment: ", aErrors);
                return;
            } else if (deletedAssignment === null) {
                console.log("Error: Could not delete assignment: attempted to delete null");
                return;
            }
            
        };
        console.log(`removed product:${product.pId} from sponsor:${sponsoredUser.sponsorId} catalog`);
    }

    // Contact the external store API and retrieve all product information
    async function loadProducts() {
        let lpFilter = {};
        let lpQuery = {
            limit: perPage
        };
        // Set price range filters if present
        if (minPrice !== null && maxPrice !== null) {
            lpFilter.price = { gt: minPrice, lt: maxPrice }
        } else if (minPrice !== null) {
            lpFilter.price = { gt: minPrice }
        } else if (maxPrice !== null) {
            lpFilter.price = { lt: maxPrice }
        }
        // Set category filter if present
        if (category !== null) {
            lpFilter.category = { eq: category }
        }
        // Set name filter if present 
        if (pName !== null) {
            lpFilter.title = { contains: pName }
        }
        // Apply the filter if any of the above filters were set
        if (lpFilter != {}) {
            lpQuery.filter = lpFilter
            console.log("Filters have been found. Set the following filters: " + JSON.stringify(lpFilter))
        }

        // Get the products from the table
        try {
            console.log("Attempting to retrieve available products from backend...")
            const {data: rawStoreFront, errors: sfErrors} = await client.models.Product.list(lpQuery);

            if (sfErrors) {
                throw Error("Error: Failed to retrieve products from backend " + JSON.stringify(sfErrors))
            } 

            let storeFront = rawStoreFront.map( tp => ({
                pId : tp.pId,
                title: tp.title,
                imgs: JSON.parse(tp.imgs),
                synop: tp.synop,
                category: tp.category,
                price: tp.price,
                available: tp.available
            }))

            console.log("Updated displayed products: ", storeFront)
            updateCatalog(storeFront)
        
        } catch (err) {
            console.log(err);
            updateCatalog([])
        }
    }
    
    function FilterModal() {
        const [pmin, setMin] = useState(minPrice);
        const [pmax, setMax] = useState(maxPrice);
        const [pcategory, setCategory] = useState(category);

        useEffect(() => {
            if (showFilter) {
                setMin(minPrice);
                setMax(maxPrice);
                setCategory(category);
            }
        }, [showFilter]);

        function clearFilter() {
            // Update local states
            setMin(null);
            setMax(null);
            setCategory('')
            // Update global states
            updatePName(null);
            updateMinPrice(null);
            updateMaxPrice(null);
            updateCategory('');
        }

        function applyLocalFilter() {
            updateMaxPrice(pmax);
            updateMinPrice(pmin);
            updateCategory(pcategory);
        }

        return (
            <Modal show={showFilter} onHide={closeFilter}>
                <Modal.Header>
                    <Modal.Title>{t('catalog.filterTitle')}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                {/* The filter form */}
                    <Form>
                        <Form.Group controlId='productCategory'>
                            <Form.Label>{t('catalog.category')}</Form.Label>
                            <Form.Select onChange={e => setCategory(String(e.target.value))}
                                defaultValue={category}>
                                <option value="">{t('catalog.all')}</option>
                                <option value="clothes">{t('catalog.clothing')}</option>
                                <option value="furniture">{t('catalog.furniture')}</option>
                                <option value="shoes">{t('catalog.shoes')}</option>
                                <option value="technology">{t('catalog.technology')}</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group controlId='priceRange'>
                            <Form.Label>{t('catalog.priceRange')}</Form.Label>
                            <Form.Text>{t('catalog.from')}</Form.Text>
                            <Form.Control 
                                onChange={e => setMin(Number(e.target.value))}
                                defaultValue={minPrice}
                                type='text' 
                                placeholder='0 - ...'/>
                            <Form.Text>{t('catalog.to')}</Form.Text>
                            <Form.Control
                                onChange={e => setMax(Number(e.target.value))}
                                defaultValue={maxPrice}
                                type='text' 
                                placeholder='0 - ...'/>
                        </Form.Group>
                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowFilter(false)} >{t('catalog.cancel')}</Button>
                    <Button variant="secondary" onClick={() => {
                        clearFilter();
                        loadProducts();
                        setShowFilter(false);
                        }} >{t('catalog.clear')}</Button>
                    <Button variant="primary" onClick={() => {
                        applyLocalFilter();
                        loadProducts();
                        setShowFilter(false);
                    }}>{t('catalog.apply')}</Button>
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
                                <h3><strong>{t('catalog.price')}</strong> {product.price} PTs</h3>
                                <Stack direction='horizontal' gap={1}>
                                    <div><p><strong>{t('catalog.rating')}</strong></p></div>
                                    <div><StarRating itemKey={String(product.pId)} /></div>
                                </Stack>
                                <p><strong>{t('catalog.description')} </strong>{product.desc}</p>
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

    function UpdateCatalogButton({product}) {

        useEffect(() => {
            
        })

        if (product.inCatalog) {
            return (<span onClick={ () => {removeProduct(product.pId);
            }} className="btn btn-danger">{t('catalog.remove')}</span>);
        } else {
            return (<span onClick={ () => {addProduct(product.pId);
            }} className="btn btn-primary">{t('catalog.addToCatalog')}</span>);
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
                                onChange={e => { updatePName(e.target.value); loadProducts() }}
                                defaultValue={''}
                                type='text'
                                placeholder={t('catalog.searchPlaceholder')}
                                style={{ width: '18rem' }}/>
                        </Col>
                        <Col>
                            <Form.Select 
                                onChange={e => { applyPerPage(e.target.value); loadProducts(); }}
                                defaultValue={10}
                                style={{ width: '5rem' }}>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </Form.Select>
                        </Col>
                        {/* <Col>
                            <Button variant='primary' onClick={() => loadProducts()}>{t('catalog.search')}</Button>
                        </Col> */}
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
                                    <ListGroup.Item key={'noSearch'} likeid={'noSearch'} className="text-muted mt-3">{t('catalog.noItemsMatch')}</ListGroup.Item>
                                )}
                            </ListGroup>
                        </Card>
                    </Col>
                    <Col sm={6}>
                        <Tab.Content style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            <Tab.Pane eventKey={"defaultChoice"}>
                                <Card>
                                    <Card.Title>{t('catalog.welcome')}</Card.Title>
                                    <Card.Text>{t('catalog.clickToView')}</Card.Text>
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
                                    <h1>{t('catalog.noItemsMatch')}</h1>
                                </Card>
                            )}
                        </Tab.Content>
                    </Col>
                </Row>
                
                
            </Tab.Container>
        </div>
    );
}