import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const FallenItems = ({ items, basketPosition }) => {
    const [visibleTooltips, setVisibleTooltips] = useState(
        new Array(items.length).fill(false)
    );

    return (
        <div
            className="fallen-items-container"
            style={{
                position: "fixed", // Fix it to the bottom of the screen
                bottom: 100, // Align to the bottom
                width: "100%",
                height: "200px", // Adjust the height as needed
                zIndex: 10, // Make sure it appears on top of other content
            }}
        >
            {items.map((item, index) => (
                <motion.div
                    key={index}
                    className="fallen-item"
                    initial={{
                        // Adjust initial x and y based on the basket's absolute position relative to the container
                        x: basketPosition.x - (window.innerWidth / 2),
                        y: -basketPosition.y - 250, // Starting above the container
                        opacity: 0,
                    }}
                    animate={{
                        // Final position after falling
                        x: 100 + (150 * ((index % 10) - 5)), // You can adjust this to control how far apart the items fall horizontally
                        y: (200 * Math.floor(index / 10)) - 100, // y = 0 corresponds to the top of the fallen-items-container
                        opacity: 1, // Fade in as the items fall
                    }}
                    transition={{
                        type: "tween",
                        duration: 2,
                        ease: "easeOut"
                    }}
                    onAnimationComplete={() => {
                        // Set tooltip visibility to true when animation completes
                        setVisibleTooltips((prev) => {
                            const newVisibleTooltips = [...prev];
                            newVisibleTooltips[index] = true;
                            return newVisibleTooltips;
                        });
                    }}
                    style={{
                        position: "absolute", // Absolute positioning for each item within the parent container
                        top: "0px", // Space out items vertically inside the container
                    }}
                >
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="fallen-item-link">
                        <img src={item.image} alt={`gift-${index}`} className="fallen-item-image" />
                        {visibleTooltips[index] && (
                            <span className="fallen-item-tooltip">{item.tooltip}</span>
                        )}
                    </a>
                </motion.div>
            ))}
        </div>
    );
};

export default FallenItems;
