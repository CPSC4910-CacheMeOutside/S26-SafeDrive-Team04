import { useState, useEffect } from "react";
// Import the front-end star rating widget for catalog items
import StarRating from "./StarRating";
import { useLanguage } from './LanguageContext';

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
    const { t } = useLanguage();
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

    const [cartItems, setCartItems] = useState([]);
    const [showCart, setShowCart] = useState(false);

    // state of wishlist
    const [wishlistItems, setWishlistItems] = useState([]);
    const [showWishlist, setShowWishlist] = useState(false);

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
            alert(t('sponsorCatalog.pleasePickDriver'));
            return;
        }
        console.log("placing order:", { sponsorId, item: selectedItem.id, driver: selectedDriver, quantity });
        setOrderSuccess(true);
    }


    function addToCart(item) {
        setCartItems((prev) => {
            const existing = prev.find((c) => c.id === item.id);
            if (existing) {
                return prev.map((c) =>
                    c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
                );
            }
            return [...prev, { id: item.id, name: item.name, category: item.category, sponsorPrice: item.sponsorPrice, quantity: 1 }];
        });
    }

    function removeFromCart(itemId) {
        setCartItems((prev) => prev.filter((c) => c.id !== itemId));
    }

    function getCartTotal() {
        return cartItems.reduce((sum, c) => sum + c.sponsorPrice * c.quantity, 0);
    }

    function getCartCount() {
        return cartItems.reduce((sum, c) => sum + c.quantity, 0);
    }

    function isInWishlist(itemId) {
        return wishlistItems.some((w) => w.id === itemId);
    }

    function addToWishlist(item) {
        if (!isInWishlist(item.id)) {
            setWishlistItems((prev) => [
                ...prev,
                { id: item.id, name: item.name, category: item.category },
            ]);
        }
    }

    function removeFromWishlist(itemId) {
        setWishlistItems((prev) => prev.filter((w) => w.id !== itemId));
    }

    async function handleSavePrice() {
        const parsed = parseInt(newPriceInput);
        if (isNaN(parsed) || parsed < 0) {
            alert(t('sponsorCatalog.invalidPrice'));
            return;
        }
        setItems((prev) =>
            prev.map((i) => (i.id === editItem.id ? { ...i, sponsorPrice: parsed } : i))
        );
        setShowPriceModal(false);
    }

    if (loading) return <p>{t('sponsorCatalog.loading')}</p>;

    const filteredItems = getFilteredItems();

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <h2 style={{ margin: 0 }}>{t('sponsorCatalog.title')}</h2>

                <div style={{ display: "flex", gap: "8px" }}>
                    <div style={{ position: "relative", display: "inline-block" }}>
                        <button
                            onClick={() => setShowWishlist(true)}
                            style={{
                                fontSize: "0.875rem",
                                padding: "8px 16px",
                                backgroundColor: "#7b1fa2",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                            }}
                        >
                            {t('sponsorCatalog.wishlist')}
                        </button>
                        {wishlistItems.length > 0 && (
                            <span
                                style={{
                                    position: "absolute",
                                    top: "-8px",
                                    right: "-8px",
                                    backgroundColor: "#e53935",
                                    color: "white",
                                    borderRadius: "50%",
                                    width: "20px",
                                    height: "20px",
                                    fontSize: "0.6875rem",
                                    fontWeight: "bold",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    pointerEvents: "none",
                                }}
                            >
                                {wishlistItems.length}
                            </span>
                        )}
                    </div>

                    <div style={{ position: "relative", display: "inline-block" }}>
                        <button
                            onClick={() => setShowCart(true)}
                            style={{
                                fontSize: "0.875rem",
                                padding: "8px 16px",
                                backgroundColor: "#333",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                            }}
                        >
                            {t('sponsorCatalog.cart')}
                        </button>
                        {getCartCount() > 0 && (
                            <span
                                style={{
                                    position: "absolute",
                                    top: "-8px",
                                    right: "-8px",
                                    backgroundColor: "#e53935",
                                    color: "white",
                                    borderRadius: "50%",
                                    width: "20px",
                                    height: "20px",
                                    fontSize: "0.6875rem",
                                    fontWeight: "bold",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    pointerEvents: "none",
                                }}
                            >
                                {getCartCount()}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
                <span>{t('sponsorCatalog.filterByPrice')}</span>
                <label>
                    {t('sponsorCatalog.min')}
                    <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        style={{ width: "70px", marginLeft: "4px" }}
                    />
                </label>
                <label>
                    {t('sponsorCatalog.max')}
                    <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        style={{ width: "70px", marginLeft: "4px" }}
                    />
                </label>
                <button onClick={() => { setMinPrice(""); setMaxPrice(""); }}>{t('sponsorCatalog.clear')}</button>
            </div>

            {filteredItems.length === 0 && <p>{t('sponsorCatalog.noItemsFound')}</p>}

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
                        <p style={{ fontSize: "0.75rem", color: "gray", margin: "0 0 4px" }}>{item.category}</p>
                        <h4 style={{ margin: "0 0 8px" }}>{item.name}</h4>

                        <p style={{ margin: "0 0 4px" }}>
                            <strong>{item.sponsorPrice} pts</strong>
                            {item.basePrice !== item.sponsorPrice && (
                                <span style={{ color: "gray", textDecoration: "line-through", marginLeft: "8px", fontSize: "0.8125rem" }}>
                                    {item.basePrice} pts
                                </span>
                            )}
                        </p>

                        {/* Star rating widget */}
                        <StarRating itemKey={String(item.id)} />

                        <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                            <button onClick={() => openEditModal(item)} style={{ fontSize: "0.75rem" }}>
                                {t('sponsorCatalog.editPrice')}
                            </button>
                            <button
                                onClick={() => openBuyModal(item)}
                                style={{ fontSize: "0.75rem", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "4px", padding: "4px 8px", cursor: "pointer" }}>
                                {t('sponsorCatalog.buyForDriver')}
                            </button>
                            <button
                                onClick={() => addToCart(item)}
                                style={{ fontSize: "0.75rem", backgroundColor: "#2196F3", color: "white", border: "none", borderRadius: "4px", padding: "4px 8px", cursor: "pointer" }}
                            >
                                {t('sponsorCatalog.addToCart')}
                            </button>
                            <button
                                onClick={() => addToWishlist(item)}
                                disabled={isInWishlist(item.id)}
                                style={{
                                    fontSize: "0.75rem",
                                    backgroundColor: isInWishlist(item.id) ? "#ccc" : "#7b1fa2",
                                    color: isInWishlist(item.id) ? "#888" : "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    padding: "4px 8px",
                                    cursor: isInWishlist(item.id) ? "not-allowed" : "pointer",
                                }}
                            >
                                {isInWishlist(item.id) ? t('sponsorCatalog.wishlisted') : t('sponsorCatalog.addToWishlist')}
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
                                <h3>{t('sponsorCatalog.orderPlaced')}</h3>
                                <p>
                                    {t('sponsorCatalog.ordered')} {quantity}x {selectedItem.name} {t('sponsorCatalog.for')}{" "}
                                    {drivers.find((d) => d.id == selectedDriver)?.name}
                                </p>
                                <button onClick={() => setShowBuyModal(false)}>{t('sponsorCatalog.close')}</button>
                            </div>
                        ) : (
                        <div>
                            <h3>{t('sponsorCatalog.buyForDriverTitle')}</h3>
                            <p>{selectedItem.name} - {selectedItem.sponsorPrice} pts each</p>

                            <div style={{ marginBottom: "12px" }}>
                                <label>{t('sponsorCatalog.driverLabel')} </label>
                                <select value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)}>
                                    <option value="">{t('sponsorCatalog.selectADriver')}</option>
                                    {drivers.map((d) => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: "12px" }}>
                                <label>{t('sponsorCatalog.quantity')} </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                    style={{ width: "60px" }}
                                />
                            </div>

                            <p>{t('sponsorCatalog.total')} {selectedItem.sponsorPrice * quantity} pts</p>

                            <div style={{ display: "flex", gap: "8px" }}>
                                <button onClick={handleBuy} style={{ backgroundColor: "#4CAF50", color: "white", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer" }}>
                                    {t('sponsorCatalog.confirm')}
                                </button>
                                <button onClick={() => setShowBuyModal(false)}>{t('sponsorCatalog.cancel')}</button>
                            </div>
                        </div>
                )}
                    </div>
                </div>
            )}

            {/* shopping cart side panel */}
            {showCart && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        right: 0,
                        width: "320px",
                        height: "100%",
                        background: "white",
                        boxShadow: "-4px 0 12px rgba(0,0,0,0.2)",
                        zIndex: 1100,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <div
                        style={{
                            padding: "16px",
                            borderBottom: "1px solid #eee",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <h3 style={{ margin: 0 }}>{t('sponsorCatalog.cartTitle')}</h3>
                        <button
                            onClick={() => setShowCart(false)}
                            style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", lineHeight: 1 }}
                        >
                            ✕
                        </button>
                    </div>

                    <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
                        {cartItems.length === 0 && (
                            <p style={{ color: "gray", textAlign: "center", marginTop: "32px" }}>{t('sponsorCatalog.cartEmpty')}</p>
                        )}

                        {cartItems.map((cartItem) => (
                            <div
                                key={cartItem.id}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    marginBottom: "12px",
                                    paddingBottom: "12px",
                                    borderBottom: "1px solid #eee",
                                }}
                            >
                                <div>
                                    <p style={{ margin: 0, fontWeight: "bold", fontSize: "0.875rem" }}>{cartItem.name}</p>
                                    <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "gray" }}>
                                        {cartItem.sponsorPrice} pts × {cartItem.quantity}
                                    </p>
                                    <p style={{ margin: "2px 0 0", fontSize: "0.875rem", fontWeight: "600" }}>
                                        {cartItem.sponsorPrice * cartItem.quantity} pts
                                    </p>
                                </div>

                                <button
                                    onClick={() => removeFromCart(cartItem.id)}
                                    title="Remove from cart"
                                    style={{
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        color: "#e53935",
                                        fontSize: "1.125rem",
                                        lineHeight: 1,
                                        padding: "0 4px",
                                    }}
                                >
                                    🗑
                                </button>
                            </div>
                        ))}
                    </div>

                    <div
                        style={{
                            padding: "16px",
                            borderTop: "2px solid #eee",
                            backgroundColor: "#fafafa",
                        }}
                    >
                        <p style={{ margin: 0, fontWeight: "bold", fontSize: "1rem" }}>
                            Total: {getCartTotal()} pts
                        </p>
                    </div>
                </div>
            )}

            {showWishlist && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        right: 0,
                        width: "320px",
                        height: "100%",
                        background: "white",
                        boxShadow: "-4px 0 12px rgba(0,0,0,0.2)",
                        zIndex: 1100,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <div
                        style={{
                            padding: "16px",
                            borderBottom: "1px solid #eee",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <h3 style={{ margin: 0 }}>{t('sponsorCatalog.wishlistTitle')}</h3>
                        <button
                            onClick={() => setShowWishlist(false)}
                            style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", lineHeight: 1 }}
                        >
                            ✕
                        </button>
                    </div>

                    <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
                        {wishlistItems.length === 0 && (
                            <p style={{ color: "gray", textAlign: "center", marginTop: "32px" }}>{t('sponsorCatalog.wishlistEmpty')}</p>
                        )}

                        {wishlistItems.map((wItem) => (
                            <div
                                key={wItem.id}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    marginBottom: "12px",
                                    paddingBottom: "12px",
                                    borderBottom: "1px solid #eee",
                                }}
                            >
                                <div>
                                    <p style={{ margin: 0, fontWeight: "bold", fontSize: "0.875rem" }}>{wItem.name}</p>
                                    <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "gray" }}>{wItem.category}</p>
                                </div>

                                <button
                                    onClick={() => removeFromWishlist(wItem.id)}
                                    title="Remove from wishlist"
                                    style={{
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        color: "#e53935",
                                        fontSize: "1.125rem",
                                        lineHeight: 1,
                                        padding: "0 4px",
                                    }}
                                >
                                    🗑
                                </button>
                            </div>
                        ))}
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
                        <h3>{t('sponsorCatalog.editPriceTitle')}</h3>
                        <p>{editItem.name}</p>
                        <p style={{ color: "gray", fontSize: "0.8125rem" }}>{t('sponsorCatalog.originalPrice')} {editItem.basePrice} pts</p>

                        <div style={{ marginBottom: "16px" }}>
                            <label>{t('sponsorCatalog.newPrice')} </label>
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
                                {t('sponsorCatalog.save')}
                            </button>
                            <button onClick={() => setShowPriceModal(false)}>{t('sponsorCatalog.cancel')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}