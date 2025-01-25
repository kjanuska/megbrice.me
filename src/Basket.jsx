import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import basketImage from "./images/basket.png"; // adjust path if needed

const Basket = ({ onDropGift, totalItems, droppedCount, styling, setBasketPosition }) => {
	const basketRef = useRef(null);
	const [tooltipVisible, setTooltipVisible] = useState(true); // Track tooltip visibility
	const lastPosition = useRef({ x: 0, y: 0 }); // Track last position of basket for shake detection
	const shakeThreshold = 10; // Increase the shake threshold to require more movement
	const firstDropTriggered = useRef(false); // Ref to track if the first drop has occurred
	const lastDropTime = useRef(0); // Ref to store the time of the last drop
	let timer;

	// Framer Motion values
	const x = useMotionValue(0);
	const y = useMotionValue(0);

	// For rotation, only apply when y is negative (dragged upward)
	const rotation = useTransform([x, y], ([latestX, latestY]) => {
		if (latestY >= 0) return 0; // No rotation if dragged below the starting position

		const maxDragUp = 300;
		const verticalProgress = Math.max(-maxDragUp, latestY); // Clamp upward movement
		const flipPercentage = verticalProgress / -maxDragUp; // 0 to 1
		const direction = latestX < 0 ? 1 : -1; // Rotate direction based on x
		const angle = flipPercentage * 180 * direction;
		return Math.max(Math.min(angle, 180), -180); // Clamp to ±180
	});

	// Detect shake when the basket is dragged and call onDropGift()
	useEffect(() => {
		const handleShake = (latestX, latestY) => {
			const deltaX = Math.abs(latestX - lastPosition.current.x);
			const deltaY = Math.abs(latestY - lastPosition.current.y);

			const currentTime = Date.now();

			// Only allow drop if basket is upside down, delta exceeds threshold, and enough time has passed
			if (
				(deltaX > shakeThreshold || deltaY > shakeThreshold / 3) &&
				rotation.get() <= -180 &&
				currentTime - lastDropTime.current >= 1500 // 2-second delay between drops
			) {
				if (droppedCount < totalItems && firstDropTriggered.current) {
					// Capture the basket position
					if (basketRef.current) {
						const { left, top } = basketRef.current.getBoundingClientRect();
						setBasketPosition({
							x: left + basketRef.current.offsetWidth / 2, // Horizontal center of the basket
							y: top + basketRef.current.offsetHeight, // Bottom of the basket
						});
					}
					onDropGift();
					lastDropTime.current = currentTime; // Update last drop time
				}
			}

			// Update last position for next comparison
			lastPosition.current = { x: latestX, y: latestY };
		};

		// Subscribe to the motion values
		const unsubscribeX = x.on("change", (latestX) => handleShake(latestX, y.get()));
		const unsubscribeY = y.on("change", (latestY) => handleShake(x.get(), latestY));

		// Cleanup the subscriptions when the component unmounts
		return () => {
			unsubscribeX();
			unsubscribeY();
		};
	}, [droppedCount, totalItems, x, y, onDropGift, rotation]);

	// When rotation crosses -180, drop the first gift
	rotation.on("change", (value) => {
		if (!firstDropTriggered.current && value <= -180) {
			firstDropTriggered.current = true; // Prevent further drops
			// Capture the basket position
			if (basketRef.current) {
				const { left, top } = basketRef.current.getBoundingClientRect();
				setBasketPosition({ x: left + basketRef.current.offsetWidth / 2, y: top + basketRef.current.offsetHeight / 2 });
			}
			onDropGift(); // Drop the first gift when the basket reaches -180 degrees
			lastDropTime.current = Date.now(); // Set initial drop time
		}
	});

	const handleDragStart = () => {
		// Fade out the tooltip when the user picks up the basket
		setTooltipVisible(false);

		// Clear the timeout if the user starts dragging again
		return () => clearTimeout(timer);
	};

	const handleDragEnd = () => {
		// Start a timer to fade the tooltip back in after 2 seconds of inactivity
		timer = setTimeout(() => {
			setTooltipVisible(true);
		}, 2000);

		// Animate x, y, and rotation back to their initial values
		animate(x, 0, { duration: 1 });
		animate(y, 0, { duration: 1 });
		animate(rotation, 0, { duration: 1 });
	};

	return (
		<div className="basket" style={styling}>
			<div
				className="basket-tooltip noselect"
				style={{
					opacity: tooltipVisible ? 1 : 0,
					transition: "opacity 0.5s ease",
				}}
			>
				Pick me up!
			</div>

			<motion.div
				ref={basketRef}
				style={{
					width: 200,
					height: 200,
					x: x,
					y: y,
					rotateZ: rotation, // Updated to rotate on the Z-axis
					backgroundImage: `url(${basketImage})`,
					backgroundSize: "cover",
					backgroundPosition: "center",
					cursor: "grab",
				}}
				drag
				dragConstraints={{
					top: -500, // Increased drag range
					bottom: 150, // Increased drag range
					left: -500, // Increased drag range
					right: 500, // Increased drag range
				}}
				dragElastic={0.3} // Increased resistance to make the basket follow the mouse more closely
				dragMomentum={false}
				onDragStart={handleDragStart} // Trigger fade-out when drag starts
				onDragEnd={handleDragEnd} // Trigger fade-in after 2 seconds of inactivity
			/>
		</div>
	);
};

export default Basket;
