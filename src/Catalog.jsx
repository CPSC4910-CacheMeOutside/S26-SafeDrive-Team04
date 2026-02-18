import { useState } from 'react';
import { Container, Row, Col, Card, Button, CardBody } from 'react-bootstrap';

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

function CatalogItem({product}) {
    return (
        <Card style={{ width: '100rem' }}>
            <Card.Img variant="top" src={product.img} />
            <Card.Body>
                <Card.Title>{product.title}</Card.Title>
                <Card.Text>{product.desc}</Card.Text>
                <Button variant="primary">Request</Button>
            </Card.Body>
        </Card>
    );
}

export default function Catalog({view}) {
    // Tracks the current text in the search bar
    const [query, setQuery] = useState('');

    // Filter catalog items whenever the query changes
    // The search looks at the title of the item but also he description.
    const filtered = catalog.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.desc.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div>
            {/* Changed the header row so the search bar is in there */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="mb-0">Sponsor Catalog</h1>
                {/* The search updates on every keypress */}
                <input
                    type="search"
                    className="form-control w-auto"
                    placeholder="Search catalog..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    style={{ minWidth: '220px' }}
                />
            </div>
            <Container>
                {/* make is so only the items matching the search are shown */}
                {filtered.map((item, idx) =>
                    (
                        <Row key={idx}>
                            <CatalogItem product={item}></CatalogItem>
                        </Row>
                    ))}
                {/* Display a message for when the search has no results */}
                {filtered.length === 0 && (
                    <p className="text-muted mt-3">No items match your search.</p>
                )}
            </Container>
        </div>
    );
}