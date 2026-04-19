import { useState, useEffect } from "react";
// Import the front-end star rating widget for catalog items
import StarRating from "./StarRating";
import { useLanguage } from './LanguageContext';
import { generateClient } from 'aws-amplify/data';
import { updateUserAttributes, fetchUserAttributes } from 'aws-amplify/auth';
import { AmplifyError } from "@aws-amplify/core/internals/utils";
import useAmplifyAuth from "./UseAmplifyAuth";

import { Container, Row, Col, Card, Tab, Tabs, Button, Modal, Carousel} from "react-bootstrap";

export default function SponsorCatalog() {

    // Page State Trackers
    const [isLoading, setIsLoading] = useState(true);
    // Clients
    const client = generateClient();
    const auth = useAmplifyAuth();
    // User Centric Data
    const [userData, updateUserData] = useState(null);
    const [pointTotals, updatePointTotals] = useState(null);
    const [ptToDollarRatios, updatePtToDollarRatios] = useState(null);
    const [sponsors, updateSponsors] = useState(null);
    const [catalogs, updateCatalogs] = useState(null);
    const [cart, updateCart] = useState(null);
    const [wishlist, updateWishlist] = useState(null);
    // Modal States
    const [show, setShow] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const handleClose = () => {
        setShow(false);
        setSelectedProduct(null);
    };

    const handleShow = (product) => {
        setSelectedProduct(product);
        setShow(true);
    };

    // Buisness Logic
    useEffect(() => {

        async function getCogUserData() {
            try {
                const cogAttr = await fetchUserAttributes(); 
                console.log(`Sponsor Data Retrieved from Cognito: `, cogAttr);
                return {
                    id: cogAttr.sub,
                    name: cogAttr.name
                };
            } catch(err) {
                console.log(`Error: Failed to retrive sponsor from Cognito: `, err);
                return;
            }
        }
        
        async function getAmpUserData(id) {
            const {data, errors} = await client.models.Driver.get({
                driverId: id
            })

            if (errors) {
                console.log(`Error: Could not obtain driver id:${id} from Driver table:`, errors);
                return;
            } else if (data === null) {
                console.log(`Error: Could not obtain driver id:${id} from Driver table: No driver by that id was found`);
                return;
            }
            console.log("Retried from Amplify Data: ", data);
            return data;
        }

        async function populateRatios(sponsors) {
            let ratios = new Map();
            for (const sponsor of sponsors) {
                ratios.set(sponsor.sponsorId, sponsor.pointtoDollarRatio ?? 1);
            }
            console.log("Loaded point to dollar ratios: ", ratios);
            return ratios;
        }

        async function populateCatalogs (dId, sponsors) {
            let allCatalogs = new Map()
            // Initilize all catalogs to a blank state
            for (const sponsor of sponsors) {
                allCatalogs.set(sponsor.sponsorId, [])
            }

            // Add all products to each respective catalog
            const {data, errors} = await client.models.CatalogProduct.list({
                filter: {
                    driverId: { eq : dId }
                }
            });

            if (errors) {
                console.log("Error: Could not obtain catalogs for driver id:" + dId, errors);                 
            } else if (data === null) {
                console.log("Error: Could not obtain catalogs for driver id:" + dId + " : No catalogs were obtained");          
            }
            
            for (const assignment of data) {
                const product = await assignment.product();

                const bucket = allCatalogs.get(assignment.sponsorId);

                if (bucket) {
                    const pData = product.data;
                    pData.imgs = JSON.parse(pData.imgs)
                    bucket.push(product.data);
                }
            }

            console.log("Retrieved the following catalogs: ", allCatalogs);
            return allCatalogs;
        }

        async function populateCart(ampData) {
            const {data: cart, errors} = await ampData.cart();

            if (errors) {
                console.log(`Error: Could not obtain cart for driver id:${ampData.driverId}:`, errors);
                return [];
            } else if (cart === null) {
                console.log(`Error: Could not obtain cart for driver id:${ampData.driverId}: No cart was found`);
                return [];
            }

            console.log("Retried cart from Amplify Data: ", cart);

            const {data: products, errors: productErrors} = await cart.products();

            if (productErrors) {
                console.log(`Error: Could not obtain products for cart id:${cart.id}:`, productErrors);
                return [];
            } else if (products === null) {
                console.log(`Error: Could not obtain products for cart id:${cart.id}: No products were found`);
                return [];
            }

            console.log("Retrieved products from Amplify Data: ", products);
            return products;
        }

        async function populateWishlist(ampData) {
            const {data: wishlist, errors} = await ampData.wishlist();

            if (errors) {
                console.log(`Error: Could not obtain wishlist for driver id:${ampData.driverId}:`, errors);
                return [];
            } else if (wishlist === null) {
                console.log(`Error: Could not obtain wishlist for driver id:${ampData.driverId}: No wishlist was found`);
                return [];
            }

            console.log("Retrieved wishlist from Amplify Data: ", wishlist);

            const {data: products, errors: productErrors} = await wishlist.products();

            if (productErrors) {
                console.log(`Error: Could not obtain products for wishlist id:${wishlist.id}:`, productErrors);
                return [];
            } else if (products === null) {
                console.log(`Error: Could not obtain products for wishlist id:${wishlist.id}: No products were found`);
                return [];
            }

            console.log("Retrieved products from Amplify Data: ", products);
            return products;
        }

        async function populateSponsors(ampData) {
            let returnedSponsors = [];
            const {data: sponsors, errors} = await ampData.sponsors();

            if (errors) {
                console.log(`Error: Could not obtain sponsors for driver id:${ampData.driverId}:`, errors);
                return [];
            } else if (sponsors === null) {
                console.log(`Error: Could not obtain sponsors for driver id:${ampData.driverId}: No sponsors were found`);
                return [];
            }

            for (const s of sponsors) {
                const sponsor = await s.sponsor()
                returnedSponsors.push(sponsor.data)
            }
            console.log("Retrieved sponsors from Amplify Data: ", returnedSponsors);
            return returnedSponsors;
        }

        async function populatePointTotals(id) {
            let pointTotals = new Map();
            const {data: pTotals, errors} = await client.models.DriverSponsor.list({
                filter: {
                    driverId: { eq: id }
                }
            });

            if (errors) {
                console.log(`Error: Could not obtain point totals for driver id:${id}:`, errors);
                return pointTotals;
            } else if (pTotals === null) {
                console.log(`Error: Could not obtain point totals for driver id:${id}: No point totals were found`);
                return pointTotals;
            }

            for (const pt of pTotals) {
                pointTotals.set(pt.sponsorId, pt.points);
            }

            console.log("Loaded point totals: ", pointTotals);
            return pointTotals;
        }

        async function loadData() {
            const cogData = await getCogUserData();
            const dbData = await getAmpUserData(cogData.id);

            updateUserData(cogData);

            const sponsorData = await populateSponsors(dbData);
            updateSponsors(sponsorData);

            updatePointTotals(await populatePointTotals(cogData.id));
            updatePtToDollarRatios(await populateRatios(sponsorData));
            updateCart(await populateCart(dbData));
            updateWishlist(await populateWishlist(dbData));

            updateCatalogs(await populateCatalogs(dbData.driverId, sponsorData));
        }

        loadData();
    }, []);

    // Check to ensure all user data is loaded
    useEffect(() => {
        if (userData === null) return;
        if (sponsors === null) return;
        if (pointTotals === null) return;
        if (ptToDollarRatios === null) return;
        if (cart === null) return;
        if (wishlist === null) return;
        if (catalogs === null) return;

        console.log("Page loading finished!");
        setIsLoading(false);
    }, [pointTotals, sponsors, catalogs, cart, wishlist, ptToDollarRatios]);

    function submitOrder(product, sId) {
        
        const [ptToDollar, setPtToDollar] = useState(ptToDollarRatios.get(sId));

        const activeTotal = pointTotals.get(sId);

        
    }

    // UI Components
    function RequestModal({ product, sponsorId }) {

        const [ptToDollar, setPtToDollar] = useState(ptToDollarRatios.get(sponsorId));

        if (!product) return null;

        return (
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{product.title}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Carousel>
                        {product.imgs.map((img, i) => (
                            <Carousel.Item key={i}>
                                <img className="d-block w-100" src={img} />
                            </Carousel.Item>
                        ))}
                    </Carousel>

                    <h3>Price: {product.price * ptToDollar}</h3>
                    <p>{product.desc}</p>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleClose}>
                        Complete Request
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }

    function Catalog({sId}) {

        console.log("Loading catalog under the provided id...", sId);

        const [activeCatalog, setActiveCatalog] = useState(catalogs.get(sId));
        const [ptToDollar, setPtToDollar] = useState(ptToDollarRatios.get(sId));

        if (activeCatalog === null) {
            console.log("Error: No catalog under the provided id was found", sId);
            return;
        }

        if (ptToDollar === null) {
            console.log("Error: No point to dollar conversion ratio was found", sId);
            return;
        }

        return (
            <Container>
            <Row>
                {activeCatalog.map((product, index) => (
                    <Col key={index} xs={12} md={4} className="mb-4">
                        <Card style={{ height: "100%" }}>
                            <Card.Img variant="top" src={product.imgs[0]} />
                            <Card.Body style={{ height: "100px" }}>
                                <Card.Title>{product.title}</Card.Title>
                                <Card.Subtitle>
                                    {Number(product.price * ptToDollar)} PTs
                                </Card.Subtitle>
                                <Button onClick= { () => {
                                    setSelectedProduct(product);
                                    setShow(true)
                                }}
                                variant="primary">Request</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
            <RequestModal product={selectedProduct} sponsorId={sId} />
        </Container>
        );
    }

    // Page

    if (isLoading) {
        return (<h1>Loading...</h1>);
    }
    
    return (
        <Container fluid>
            <h1 className="mx-auto" >Drivers Catalog</h1>
            <Tabs
                defaultActiveKey={sponsors[0].sponsorId}
                id="catalogs-tab"
                className="px-3"
            >
                
                {sponsors.map((sponsor, index) => (
                    <Tab 
                        key={sponsor.sponsorId}
                        eventKey={sponsor.sponsorId} 
                        title={sponsor.affiliation ?? `Catalog ${index+1}`}
                    >
                        {/* Catalog Page Content */}
                        <Row className="m-3">
                            <Col md={3}>
                                <Card className="w-100 h-100">
                                    <h2>Account Balance</h2>
                                    <h1>{pointTotals.get(sponsor.sponsorId)} PTs</h1>
                                </Card>
                            </Col>
                            <Col md={9}>
                                <Card style={{ overflowY: 'auto', maxHeight: "500px" }} className="w-100 h-100">
                                    <Catalog sId={sponsor.sponsorId} />
                                </Card>
                            </Col>
                        </Row>
                    </Tab>
                ))}
            </Tabs>

        </Container>
    )
}