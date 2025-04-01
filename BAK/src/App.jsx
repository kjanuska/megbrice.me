import React, { useState, useEffect } from "react";
import Basket from "./Basket";
import FallenItems from "./FallenItems";
import data from "./data.json";

function App() {
	const [items, setItems] = useState(data);
	const [droppedItems, setDroppedItems] = useState([]);
	const [allDropped, setAllDropped] = useState(false);
	const [show, setShow] = useState(true);
	const [basketPosition, setBasketPosition] = useState({ x: 0, y: 0 });

	// Function called whenever a gift is dropped
	const handleDropGift = () => {
		if (items.length > 0 && droppedItems.length < items.length) {
			const nextItem = items[droppedItems.length];
			setDroppedItems((prev) => [...prev, nextItem]);
		}
	};

	useEffect(() => {
		if (items.length > 0 && droppedItems.length === items.length) {
			setAllDropped(true);
		}
	}, [droppedItems, items.length]);

	useEffect(() => {
		if (allDropped === true) {
			setTimeout(() => setShow(false), 1000);
		}
	}, [allDropped]);

	return (
		<div className="app-container">
			{show && (
				<Basket
					onDropGift={handleDropGift}
					totalItems={items.length}
					droppedCount={droppedItems.length}
					setBasketPosition={setBasketPosition}
					styling={{
						opacity: !allDropped ? 1 : 0,
						transition: "opacity 1s ease",
					}}
				/>
			)}

			<FallenItems items={droppedItems} basketPosition={basketPosition} />
		</div>
	);
}

export default App;
