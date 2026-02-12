import { Container, Row, Col, Stack, Card, Button, CardBody } from 'react-bootstrap';

/* Here to test the catalog. Future versions will pull items from store API and backend */
const catalog = [
    {
        title: "iPhone 6",
        img: "",
        desc: "Speakerphone, Accelerometer, Camera, Front Camera, 3D Depth Camera, Bluetooth Enabled, Digital Compass, Fingerprint Sensor, GPS, MMS (Multimedia Messaging), Motion & Gesture Control, OLED Display, Pressure Sensor, Retina Display, Streaming Video, Wi-Fi Capable",
    },
    {
        title: "Bluetooth Speaker",
        img: "",
        desc: "Take big JBL Pro sound wherever you go. The bold, colorful JBL Go 4 ultra-portable Bluetooth speaker fits in the palm of your hand, delivering clear, loud JBL Pro Sound with rich, punchy bass. Its newly redesigned integrated loop makes it easy to bring anywhere, and the variety of colorways means you can choose one that fits your vibe. Plus it's waterproof and dustproof, so it loves to go outside. And up to 7 hours of playtime means it will keep the good times rolling throughout a fun day trip or an evening chilling under the stars. Pair two Go 4's for stereo sound, or wirelessly connect multiple JBL Auracast-enabled speakers for even bigger sound. Crank it up and let your music take you anywhere."
    },
    {
        title: "Logitech M220 Silent Wireless Mouse",
        img: "",
        desc: "With the same click feel and 90% noise reduction* compared to classic mice, Logitech Silent Wireless Mouse offers a quiet experience for yourself and those around you. It has a long-lasting 18-month battery life with auto-sleep and a powerful 10-meter wireless range with 128-bit encryption between the mouse and the receiver. Plus, its small size is perfect to toss in a bag and go. Just plug the tiny USB receiver and it works with Windows®, Mac®, Chrome OS™ or Linux®. Finally, the Logitech® Advanced Optical Tracking is designed for smooth and precise moves on almost any surface."
    }
]

function CatalogItem(product) {
    return (
        <Card >
            <Card.Body>
                <Col>
                    <Card.Title>{product.title}</Card.Title>
                    <Card.Img href={product.img}></Card.Img>
                </Col>
                <Col>
                    <Button onClick={alert(`${product.title} has been requested for purchase`)}>Request</Button>
                    <Card.Text>{product.desc}</Card.Text>
                </Col>
            </Card.Body>
        </Card>
    );
}

export default function Catalog({view}) {
    return (
        <Container>
            <h1>Sponsor Catalog</h1>
            {catalog.forEach(item => <CatalogItem product={item}></CatalogItem>)}
        </Container>
    );
}