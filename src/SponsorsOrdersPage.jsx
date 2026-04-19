import { useState, useEffect } from "react";
// Import the front-end star rating widget for catalog items
import StarRating from "./StarRating";
import { useLanguage } from './LanguageContext';
import { generateClient } from 'aws-amplify/data';
import { updateUserAttributes, fetchUserAttributes } from 'aws-amplify/auth';
import { AmplifyError } from "@aws-amplify/core/internals/utils";
import useAmplifyAuth from "./UseAmplifyAuth";

import { Container, Row, Col, Card, Tab, Tabs, Button, Modal, Alert, Carousel} from "react-bootstrap";
import { Filter } from "aws-cdk-lib/aws-sns";

export default function SponsorCatalog() {

    // Page State Trackers
    const [isLoading, setIsLoading] = useState(true);
    // Clients
    const client = generateClient();
    const auth = useAmplifyAuth();
    // User Centric Data
    const [userData, updateUserData] = useState(null);
    const [drivers, updateDrivers] = useState([]);
    const [orders, updateOrders] = useState([]);
    const [ordersAwaitingApproval, updateOrdersAwaitingApproval] = useState(null);

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
            const {data, errors} = await client.models.Sponsor.get({
                sponsorId: id
            })

            if (errors) {
                console.log(`Error: Could not obtain sponsor id:${id} from Sponsor table:`, errors);
                return;
            } else if (data === null) {
                console.log(`Error: Could not obtain sponsor id:${id} from Sponsor table: No sponsor by that id was found`);
                return;
            }
            console.log("Retrieved from Amplify Data: ", data);
            return data;
        }

        async function populateDrivers(id) {
            let returnedDrivers = [];
            const {data, errors} = await client.models.DriverSponsor.list({
                filter: {
                    sponsorId: {
                        eq: id
                    }
                }
            });

            if (errors) {
                console.log(`Error: Could not obtain drivers for sponsor id:${id} from Driver table:`, errors);
                return;
            } else if (data === null) {
                console.log(`Error: Could not obtain drivers for sponsor id:${id} from Driver table: No drivers were found for that sponsor id`);
                return;
            }

            for (const d of data) {
                const { data: lDriver, errors: dErrors} = await d.driver();

                if (dErrors) {
                    console.log(`Error: Could not obtain driver id:${d.driverId} from Driver table:`, dErrors);
                    continue;
                } else if (lDriver === null) {
                    console.log(`Error: Could not obtain driver id:${d.driverId} from Driver table: No driver by that id was found`);
                    continue;
                }

                returnedDrivers.push(lDriver);
            }
            console.log("Drivers retrieved from Amplify Data: ", returnedDrivers);
            return data; 
    }

    async function populateOrders(id) { 
        let orders = [];
        // Get all orders for the sponsor
        const {data: ordersData, errors} = await client.models.Order.list({
            filter: {
                sponsorId: {
                    eq: id
                }
            }
        });

        if (errors) {
            console.log(`Error: Could not obtain orders for sponsor id:${id} from Order table:`, errors);
            return;
        } else if (ordersData === null) {
            console.log(`Error: Could not obtain orders for sponsor id:${id} from Order table: No orders were found for that sponsor id`);
            return;
        }

        // Go through each order and extract the all products assignments in the order
       for (const order of ordersData) {
        let productsInOrder = []
            const {data: productAssignments, errors: paErrors} = await order.products();

            if (paErrors) {
                console.log(`Error: Could not obtain products for order id:${order.id} from Order table:`, paErrors);
                continue;
            }

            // For each assignment extract the products
            for (const product of productAssignments) {
                const {data: productData, errors: pErrors} = await product.product();

                if (pErrors) {
                    console.log(`Error: Could not obtain product id:${product.pId} from Product table:`, pErrors);
                    continue;
                } else if (productData === null) {
                    console.log(`Error: Could not obtain product id:${product.pId} from Product table: No product by that id was found`);
                    continue;
                }

                // Push the product data into the products in order array
                productsInOrder.push(productData);
            }
            order.products = productsInOrder;
            orders.push(order);
        }
        console.log("Orders retrieved from Amplify Data: ", orders);

        updateOrdersAwaitingApproval(orders.filter(o => o.status === 0).length);
        return orders;
    }

        async function loadData() {
            const cogData = await getCogUserData();
            const dbData = await getAmpUserData(cogData.id);

            const driversData = await populateDrivers(cogData.id);
            const ordersData = await populateOrders(cogData.id);

            updateDrivers(driversData);
            updateOrders(ordersData);

            updateUserData(cogData);
        }

        loadData();
    }, []);

    // Check to ensure all user data is loaded
    useEffect(() => {
        if (userData === null) return;
        if (drivers === null) return;
        if (orders === null) return;

        console.log("Page loading finished!");
        setIsLoading(false);
    }, [userData])

    // Prevent rendering until all data is loaded
    if (isLoading) {
        return (
            <Container>
                <Row>
                    <Col>
                        <h1>Loading...</h1>
                    </Col>
                </Row>
            </Container>
        );
    } 

    // UI Components
    function OrderCard({order}) {

        const [orderStatus, setOrderStatus] = useState(order.status);

        return (
            <Card className="m-2">
                <Card.Body>
                    <Card.Title>{`Order #${order.id}`}</Card.Title>
                    <Card.Subtitle>{orderStatus === 0 ? "Pending Approval" : orderStatus === 1 ? "Approved" : "Rejected"}</Card.Subtitle>
                    <Card.Text>{`Driver: ${order.driverId}`}</Card.Text>    
                    <ul>
                        {order.products.map((product, index) => (
                            <li key={index}>{product.title}</li>
                        ))}
                    </ul>
                    {orderStatus === 0 && (
                        <>
                            <Button variant="success" onClick={ async () => {
                                const {data, errors} = await client.models.Order.update({
                                    id: order.id,
                                    status: 1
                                });

                                if (errors) {
                                    console.log(`Error: Could not approve order id:${order.id}:`, errors);
                                    return;
                                } else if (data === null) {
                                    console.log(`Error: Could not approve order id:${order.id}: No order with that id was found`);
                                    return;
                                }

                                setOrderStatus(1);
                                ordersAwaitingApproval(ordersAwaitingApproval - 1);
                            }}>
                                Approve
                            </Button>
                            <Button variant="danger" className="mx-2" onClick={ async () => {
                                const {data, errors} = await client.models.Order.update({
                                    id: order.id,
                                    status: -1
                                });

                                if (errors) {
                                    console.log(`Error: Could not reject order id:${order.id}:`, errors);
                                    return;
                                } else if (data === null) {
                                    console.log(`Error: Could not reject order id:${order.id}: No order with that id was found`);
                                    return;
                                }

                                // Refund the drivers points
                                const{data: driverData, errors: driverErrors} = await client.models.Driver.update({
                                    id: order.driverId,
                                    points: order.driver.points + order.products.reduce((total, product) => total + product.pointValue, 0)
                                });

                                if (driverErrors) {
                                    console.log(`Error: Could not refund points for driver id:${order.driverId}:`, driverErrors);
                                }

                                setOrderStatus(-1);
                                ordersAwaitingApproval(ordersAwaitingApproval - 1);
                            }}>
                                Reject
                            </Button>
                        </>
                    )}
                </Card.Body>
            </Card>
        );
    }
    
    return (
        <Container fluid>
            <Row>
                <Col>
                    <h1 className="mx-auto">{`Welcome, ${userData.name}!`}</h1>
                    <h2>{`You have ${ordersAwaitingApproval} orders pending approval`}</h2>
                    <Card style={{ overflowY: 'auto', maxHeight: "500px" }} className="w-100 h-100">
                        {orders.map((order) => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}