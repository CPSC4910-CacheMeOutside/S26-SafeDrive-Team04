import { useState, useEffect, use } from "react";
// Import the front-end star rating widget for catalog items
import StarRating from "./StarRating";
import { useLanguage } from './LanguageContext';
import { generateClient } from 'aws-amplify/data';
import { updateUserAttributes, fetchUserAttributes } from 'aws-amplify/auth';
import { AmplifyError } from "@aws-amplify/core/internals/utils";
import useAmplifyAuth from "./UseAmplifyAuth";

import { Container, Row, Col, Card, Tab, Tabs, Button, Modal, Alert, Carousel} from "react-bootstrap";
import { Filter } from "aws-cdk-lib/aws-sns";

export default function DriverOrdersPage() {

    // Page State Trackers
    const [isLoading, setIsLoading] = useState(true);
    // Clients
    const client = generateClient();
    const auth = useAmplifyAuth();
    // User Centric Data
    const [userData, updateUserData] = useState(null);
    const [sponsors, updateSponsors] = useState(null);
    const [orders, updateOrders] = useState(null);
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

        async function populateSponsors(driverId) {
            let returnedSponsors = [];
            const {data, errors} = await client.models.DriverSponsor.list({
                filter: {
                    driverId: {
                        eq: driverId
                    }
                }
            });

            if (errors) {
                console.log(`Error: Could not obtain sponsors for driver id:${driverId} from DriverSponsor table:`, errors);
                return;
            } else if (data === null) {
                console.log(`Error: Could not obtain sponsors for driver id:${driverId} from DriverSponsor table: No entries were found for that driver id`);
                return;
            }
            
            for (const ds of data) {
                const {data: sponsorData, errors: sponsorErrors} = await client.models.Sponsor.get({
                    sponsorId: ds.sponsorId
                });

                if (sponsorErrors) {
                    console.log(`Error: Could not obtain sponsor id:${ds.sponsorId} from Sponsor table:`, sponsorErrors);
                    continue;
                } else if (sponsorData === null) {
                    console.log(`Error: Could not obtain sponsor id:${ds.sponsorId} from Sponsor table: No sponsor by that id was found`);
                    continue;
                }
                returnedSponsors.push(sponsorData);
            }
            console.log(`Sponsors populated for driver id:${driverId}: `, returnedSponsors);
            return returnedSponsors;
        }

        async function populateOrders(id) { 
        let orders = [];
        // Get all orders for the sponsor
        const {data: ordersData, errors} = await client.models.Order.list({
            filter: {
                driverId: {
                    eq: id
                }
            }
        });

        if (errors) {
            console.log(`Error: Could not obtain orders for driver id:${id} from Order table:`, errors);
            return;
        } else if (ordersData === null) {
            console.log(`Error: Could not obtain orders for driver id:${id} from Order table: No orders were found for that driver id`);
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
            const sponsorData = await populateSponsors(cogData.id);
            const ordersData = await populateOrders(cogData.id);

            updateUserData(cogData);
            updateSponsors(sponsorData);
            updateOrders(ordersData);
        }

        loadData();

    }, []);

    useEffect(() => {
        if (userData === null) return;
        if (sponsors === null) return;
        if (orders === null) return;
        if (ordersAwaitingApproval === null) return;

        setIsLoading(false);
    }, [userData, sponsors, orders, ordersAwaitingApproval]);

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
                </Card.Body>
            </Card>
        );
    }

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

    return (
        <Container fluid>
            <Row className="my-4">
                <Col>
                    <h1 className="mx-auto">Welcome, {userData.name}!</h1>
                    <h2>You have {ordersAwaitingApproval} orders awaiting approval.</h2>
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