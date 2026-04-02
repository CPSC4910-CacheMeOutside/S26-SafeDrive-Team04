import { use, useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import { getProducts, PalatziQueryStruct } from './catalog/store-api';
import StarRating from "./StarRating";
import { Tab, ListGroup, Row, Col, Modal, Stack, Carousel, ButtonGroup,
    Button, Image, Card, ListGroupItem, Form} from 'react-bootstrap';
import { useLanguage } from './LanguageContext';

const testSponsorId = 7;

export default function CatalogBuilder(sponsorId) {

    const { t } = useLanguage();

    // Client used to add products to the backend catalog
    const client = generateClient();
    // The sponsor's data
    const [sponsoredUser, setSponsoredUser] = useState(NULL);

    // Modal to display filtering options
    const[showFilter, setShowFilter] = useState(false);
    const openFilter = () => setShowFilter(true);
    const closeFilter = () => setShowFilter(false);

    // State trackers for various search queries
    const [catalog, updateCatalog] = useState([]);
    const [filter, updateFilter] = useState(new PalatziQueryStruct());
    const [pName, updatePName] = useState('');
    const [perPage, updatePerPage] = useState(10);
    
    // Load in the page. Contact the store api first and load the sponsor's data
    useEffect(() => {

        async function getAmpData() {
            const { data: sponsor, errors } = await client.models.Sponsor.get({
                sponsorId: sponsorId
            });

            if (errors) {
                console.log(`Error: Failed to retrieve sponsor id:${sponsorId} from Amplify Data: `, err);
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
            if (auth.isLoading) return;
            if (!auth.isAuthenticated) return;
            if (auth.groups != "Sponsor") return;

            // Get the sponsored user's data
            const cogData = await getCog();
            const dbData = await getAmpData();

            // Populate the sponsor data into the 
            setSponsoredUser({
                first: str.split(cogData.name)[0],
                last: str.split(cogData.name)[1]
            })
        }

        loadSponsorData();
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
    async function addProduct(prodId) {
        
    }

    // Remove an item from the catalog
    async function removeProduct(prodId) {
        
    }

    // Contact the external store API and retrieve all product information
    async function loadProducts() {
        try {
            let refinedCatalog = await getProducts(filter);
            
            updateCatalog(refinedCatalog)
        
        } catch (err) {
            console.log(err);
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
                    <Modal.Title>{t('catalog.filterTitle')}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                {/* The filter form */}
                    <Form>
                        <Form.Group controlId='productCategory'>
                            <Form.Label>{t('catalog.category')}</Form.Label>
                            <Form.Select onChange={e => setCategory(String(e.target.value))}
                                defaultValue={filter.categorySlug}>
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
                                defaultValue={filter.price_min}
                                type='text' 
                                placeholder='0 - ...'/>
                            <Form.Text>{t('catalog.to')}</Form.Text>
                            <Form.Control
                                onChange={e => setMax(Number(e.target.value))}
                                defaultValue={filter.price_max}
                                type='text' 
                                placeholder='0 - ...'/>
                        </Form.Group>
                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowFilter(false)} >{t('catalog.cancel')}</Button>
                    <Button variant="secondary" onClick={() => {
                        clearFilter();
                        setShowFilter(false);
                        }} >{t('catalog.clear')}</Button>
                    <Button variant="primary" onClick={() => {
                        applyExtraFilter();
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
                                onChange={e => updatePName(e.target.value)}
                                defaultValue={''}
                                type='text'
                                placeholder={t('catalog.searchPlaceholder')}
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
                            <Button variant='primary' onClick={() => applyPName()}>{t('catalog.search')}</Button>
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
                                    <ListGroup.Item key={'noSearch'} likeid={'noSearch'} className="text-muted mt-3">{t('catalog.noItemsMatch')}</ListGroup.Item>
                                )}
                            </ListGroup>
                            <ButtonGroup className="sm">
                                <Form>
                                    <Form.Group className="mb-3">
                                        <Form.Label>{t('catalog.page')}</Form.Label>
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