import { useState } from "react";

const STORAGE_KEY = "safedrive_catalog_ratings";

export default function StarRating({ itemKey }) {
    const [ratingsData, setRatingsData] = useState(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    });

    const [hovered, setHovered] = useState(0);

    const itemData = ratingsData[itemKey] || { total: 0, count: 0, userRating: 0 };

    const avgRating = itemData.count > 0 ? itemData.total / itemData.count : 0;


    function handleRate(star) {
        const current = itemData;

        const newTotal = current.total - current.userRating + star;
        const newCount = current.userRating === 0 ? current.count + 1 : current.count;

        const updatedData = {
            ...ratingsData,
            [itemKey]: { total: newTotal, count: newCount, userRating: star },
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
        setRatingsData(updatedData);
    }

    return (
        <div style={{ marginTop: "8px" }}>
            {/* Clickable star buttons */}
            <div style={{ display: "inline-flex", gap: "2px" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        onClick={() => handleRate(star)}
                        onMouseEnter={() => setHovered(star)}
                        onMouseLeave={() => setHovered(0)}
                        style={{
                            cursor: "pointer",
                            fontSize: "22px",
                            // Fill stars up to the hovered position
                            color: star <= (hovered || itemData.userRating) ? "#FFD700" : "#ccc",
                            lineHeight: 1,
                            userSelect: "none",
                        }}
                        // Accessibility
                        role="button"
                        aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && handleRate(star)}
                    >
                        ★
                    </span>
                ))}
            </div>

            {/* Show average rating and total count once at least one rating exists */}
            {itemData.count > 0 && (
                <span style={{ fontSize: "12px", color: "gray", marginLeft: "6px" }}>
                    {avgRating.toFixed(1)} ({itemData.count} rating{itemData.count !== 1 ? "s" : ""})
                </span>
            )}
        </div>
    );
}
