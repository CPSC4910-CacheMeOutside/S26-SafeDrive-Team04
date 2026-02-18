import { useState, useEffect } from "react";

// move to separate API file when set up
const BASE_URL = "http://localhost:3000";

async function getCatalogItems(sponsorId) {
    const rest = await fetch(`${BASE_URL}/api/catalog?sponsorId=${sponsorId}`);
    const data = await rest.json();
    return data;
}

async function getDrivers(sponsorId) {
    const res = await fetch(`${BASE_URL}/api/sponsors/${sponsorId}/drivers`);
    const data = await res.json();
    return data;
}

async function updatePrice(itemId, sponsorId, newPrice) {
    const res = await fetch(`${BASE_URL}/api/catalog/${itemId}/price`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sponsorId, newPrice }),
    });
    return res.json();
}

async function placeOrder(sponsorId, itemId, driverId, qty) {
    const res = await fetch(`${BASE_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sponsorId, itemId, driverId, quantity: qty }),
    });
    return res.json();
}

// hardcoded for now, will pull from DB later
const FAKE_ITEMS = [
    { id: 1, name: "Dash Cam Pro 4K", category: "Electronics", basePrice: 900, sponsorPrice: 800 },
    { id: 2, name: "Phone Case", category: "Accessory", basePrice: 150, sponsorPrice: 150 },
    { id: 3, name: "Necklace", category: "Accessory", basePrice: 200, sponsorPrice: 200 },
    { id: 4, name: "Wallet", category: "Accessory", basePrice: 350, sponsorPrice: 300 },
    { id: 5, name: "Headphones", category: "Electronics", basePrice: 900, sponsorPrice: 850 },
];

const FAKE_DRIVERS = [
    { id: 101, name: "Taylor Swift" },
    { id: 102, name: "Harry Styles" },
    { id: 103, name: "Lionel Messi" },
];

export default function SponsorCatalog({ sponsorId = 1 }) {
    const [items, setItems] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);

    // for filter by price
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    // for purchase for driver
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedDriver, setSelectedDriver] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [orderSuccess, setOrderSuccess] = useState(false);

    // for edit price
    const [showPriceModal, setShowPriceModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [newPriceInput, setNewPriceInput] = useState("");

    useEffect(() => {
        setItems(FAKE_ITEMS);
        setDrivers(FAKE_DRIVERS);
        setLoading(false);
    }, []);

    function getFilteredItems() {
        return items.filter((item) => {
            let show = true;
            if (minPrice !== "" && item.sponsorPrice < parseFloat(minPrice)) show = false;
            if (maxPrice !== "" && item.sponsorPrice > parseFloat(maxPrice)) show = false;
            return show;
        });
    }

    function openBuyModal(item) {
        setSelectedItem(item);
        setSelectedDriver("");
        setQuantity(1);
        setOrderSuccess(false);
        setShowBuyModal(true);
    }

    function openEditModal(item) {
        setEditItem(item);
        setNewPriceInput(item.sponsorPrice);
        setShowPriceModal(true);
    }

    async function handleBuy() {
        if (!selectedDriver) {
            alert("Please pick a driver");
            return;
        }
        console.log("placing order:", { sponsorId, item: selectedItem.id, driver: selectedDriver, quantity });
        setOrderSuccess(true);
    }

    async function handleSavePrice() {
        const parsed = parseInt(newPriceInput);
        if (isNaN(parsed) || parsed < 0) {
            alert("Invalid price");
            return;
        }
        setItems((prev) =>
            prev.map((i) => (i.id === editItem.id ? { ...i, sponsorPrice: parsed } : i))
        );
        setShowPriceModal(false);
    }

    if (loading) return <p>Loading...</p>;

    const filteredItems = getFilteredItems();

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h2>Sponsor Catalog</h2>

            <div style={{ marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
                <span>Filter by price (pts):</span>
                <label>
                    Min:
                    <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        style={{ width: "70px", marginLeft: "4px" }}
                    />
                </label>
                <label>
                    Max:
                    <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        style={{ width: "70px", marginLeft: "4px" }}
                    />
                </label>
                <button onClick={() => { setMinPrice(""); setMaxPrice(""); }}>Clear</button>
            </div>

            {filteredItems.length === 0 && <p>No items found.</p>}

            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                {filteredItems.map((item) => (
                    <div
                        key={item.id}
                        style={{
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                            padding: "16px",
                            width: "220px",
                        }}
                    >
                        <p style={{ fontSize: "12px", color: "gray", margin: "0 0 4px" }}>{item.category}</p>
                        <h4 style={{ margin: "0 0 8px" }}>{item.name}</h4>

                        <p style={{ margin: "0 0 4px" }}>
                            <strong>{item.sponsorPrice} pts</strong>
                            {item.basePrice !== item.sponsorPrice && (
                                <span style={{ color: "gray", textDecoration: "line-through", marginLeft: "8px", fontSize: "13px" }}>
                                    {item.basePrice} pts
                                </span>
                            )}
                        </p>

                        <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                            <button onClick={() => openEditModal(item)} style={{ fontSize: "12px" }}>
                                Edit Price
                            </button>
                            <button
                                onClick={() => openBuyModal(item)}
                                style={{ fontSize: "12px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "4px", padding: "4px 8px", cursor: "pointer" }}>
                                Buy for Driver
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showBuyModal && selectedItem && (
                <div
                    style={{
                        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex", justifyContent: "center", alignItems: "center",
                    }}
                >
                    <div style={{ background: "white", padding: "24px", borderRadius: "8px", minWdith: "320px" }}>
                        {orderSuccess ? (
                            <div>
                                <h3>Order placed!</h3>
                                <p>
                                    Ordered {quantity}x {selectedItem.name} for{" "}
                                    {drivers.find((d) => d.id == selectedDriver)?.name}
                                </p>
                                <button onClick={() => setShowBuyModal(false)}>Close</button>
                            </div>
                        ) : (
                        <div>
                            <h3>Buy for Driver</h3>
                            <p>{selectedItem.name} - {selectedItem.sponsorPrice} pts each</p>

                            <div style={{ marginBottom: "12px" }}>
                                <label>Driver: </label>
                                <select value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)}>
                                    <option value="">Select a driver</option>
                                    {drivers.map((d) => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: "12px" }}>
                                <label>Quantity: </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                    style={{ width: "60px" }}
                                />
                            </div>

                            <p>Total: {selectedItem.sponsorPrice * quantity} pts</p>

                            <div style={{ display: "flex", gap: "8px" }}>
                                <button onClick={handleBuy} style={{ backgroundColor: "#4CAF50", color: "white", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer" }}>
                                    Confirm
                                </button>
                                <button onClick={() => setShowBuyModal(false)}>Cancel</button>
                            </div>
                        </div>
                )}
                    </div>
                </div>
            )}

            {showPriceModal && editItem && (
                <div
                    style={{
                        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex", justifyContent: "center", alignItems: "center",
                    }}
                >
                    <div style={{ background: "white", padding: "24px", borderRadius: "8px", minWidth: "280px" }}>
                        <h3>Edit Price</h3>
                        <p>{editItem.name}</p>
                        <p style={{ color: "gray", fontSize: "13px" }}>Original price: {editItem.basePrice} pts</p>

                        <div style={{ marginBottom: "16px" }}>
                            <label>New Price (pts): </label>
                            <input
                                type="number"
                                step="1"
                                value={newPriceInput}
                                onChange={(e) => setNewPriceInput(e.target.value)}
                                style={{ width: "80px" }}
                            />
                        </div>

                        <div style={{ display: "flex", gap: "8px" }}>
                            <button onClick={handleSavePrice} style={{ backgroundColor: "#2196F3", color: "white", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer" }}>
                                Save
                            </button>
                            <button onClick={() => setShowPriceModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}