document.addEventListener("DOMContentLoaded", () => {
	const grid = document.querySelector(".grid");
	const width = 10;
	const height = 20;
	const miniGrid = document.querySelector(".mini-grid");
	const miniGridSize = 16; // 4x4 mini-grid
	const scoreDisplay = document.querySelector("#score");
	const startBtn = document.querySelector("#start-button");
	const colors = ["orange", "red", "purple", "green", "blue"];
	let squares = Array.from(grid.querySelectorAll("div"));
	let nextRandom = 0;
	let timerId;
	let score = 0;

	// Create main grid dynamically
	for (let i = 0; i < width * height; i++) {
		const div = document.createElement("div");
		grid.appendChild(div);
	}

	// Create taken row at the bottom
	for (let i = 0; i < width; i++) {
		const div = document.createElement("div");
		div.classList.add("taken");
		grid.appendChild(div);
	}

	// Create mini grid dynamically
	for (let i = 0; i < miniGridSize; i++) {
		const div = document.createElement("div");
		miniGrid.appendChild(div);
	}
	// Refresh squares array AFTER grid creation
	squares = Array.from(document.querySelectorAll(".grid div"));

	//the tetrominoes
	const lTetromino = [
		[1, width + 1, width * 2 + 1, 2],
		[width, width + 1, width + 2, width * 2 + 2],
		[1, width + 1, width * 2 + 1, width * 2],
		[width, width * 2, width * 2 + 1, width * 2 + 2],
	];
	const zTetromino = [
		[0, width, width + 1, width * 2 + 1],
		[width + 1, width + 2, width * 2, width * 2 + 1],
		[0, width, width + 1, width * 2 + 1],
		[width + 1, width + 2, width * 2, width * 2 + 1],
	];

	const tTetromino = [
		[1, width, width + 1, width + 2],
		[1, width + 1, width + 2, width * 2 + 1],
		[width, width + 1, width + 2, width * 2 + 1],
		[1, width, width + 1, width * 2 + 1],
	];
	const oTetromino = [
		[0, 1, width, width + 1],
		[0, 1, width, width + 1],
		[0, 1, width, width + 1],
		[0, 1, width, width + 1],
	];
	const iTetromino = [
		[1, width + 1, width * 2 + 1, width * 3 + 1],
		[width, width + 1, width + 2, width + 3],
		[1, width + 1, width * 2 + 1, width * 3 + 1],
		[width, width + 1, width + 2, width + 3],
	];
	const theTetrominoes = [
		lTetromino,
		zTetromino,
		tTetromino,
		oTetromino,
		iTetromino,
	];

	let currentPosition = 4;
	let currentRotation = 0;

	// randomly select a tetromino and its first rotation
	let random = Math.floor(Math.random() * theTetrominoes.length);
	let current = theTetrominoes[random][currentRotation];

	// draw the tetromino on the grid

	function draw() {
		current.forEach((index) => {
			const square = squares[currentPosition + index];
			if (square && !square.classList.contains("taken")) {
				// Ensure the square is not "taken" before drawing the tetromino
				square.classList.add("tetromino");
				square.style.backgroundColor = colors[random];
			}
		});
	}

	function undraw() {
		current.forEach((index) => {
			const square = squares[currentPosition + index];
			if (square) {
				// Clear the "tetromino" class and background before moving it
				square.classList.remove("tetromino");
				square.style.backgroundColor = "";
			}
		});
	}

	//assign functions to keyCodes
	function control(e) {
		if (e.keyCode === 37) {
			moveLeft();
		} else if (e.keyCode === 38) {
			rotate();
		} else if (e.keyCode === 39) {
			moveRight();
		} else if (e.keyCode === 40) {
			moveDown();
		}
	}

	// speed up the block if down button held
	document.addEventListener("keydown", control);

	function moveDown() {
		// Check if moving down is possible before actually moving
		if (
			current.some(
				(index) =>
					squares[currentPosition + index + width] &&
					squares[currentPosition + index + width].classList.contains("taken")
			)
		) {
			freeze(); // If collision is detected, freeze the tetromino
		} else {
			undraw();
			currentPosition += width; // Move down by one row
			draw();
		}
	}

	// Freeze function, when the current shape hits the bottom
	function freeze() {
		current.forEach((index) => {
			if (squares[currentPosition + index]) {
				squares[currentPosition + index].classList.add("taken");
				squares[currentPosition + index].style.backgroundColor = colors[random];
			}
		});

		// Generate a new tetromino
		random = nextRandom;
		nextRandom = Math.floor(Math.random() * theTetrominoes.length);
		current = theTetrominoes[random][currentRotation];
		currentPosition = 4;

		draw();
		displayShape();
		addScore();
		gameOver();
	}

	//move the tetromino left, unless is at the edge or there is a blockage
	function moveLeft() {
		undraw();
		const isAtLeftEdge = current.some(
			(index) => (currentPosition + index) % width === 0
		);
		if (!isAtLeftEdge) currentPosition -= 1;

		if (
			current.some((index) =>
				squares[currentPosition + index].classList.contains("taken")
			)
		) {
			currentPosition += 1;
		}
		draw();
	}

	//move the tetromino right, unless is at the edge or there is a blockage
	function moveRight() {
		undraw();
		const isAtRightEdge = current.some(
			(index) => (currentPosition + index) % width === width - 1
		);

		if (!isAtRightEdge) currentPosition += 1;

		if (
			current.some((index) =>
				squares[currentPosition + index].classList.contains("taken")
			)
		) {
			currentPosition -= 1;
		}
		draw();
	}

	// rotate the tetromino
	function rotate() {
		undraw();
		currentRotation++;
		if (currentRotation === current.length) {
			// If the current rotation gets to 4, then it goes back to 0
			currentRotation = 0;
		}

		const rotatedTetromino = theTetrominoes[random][currentRotation];
		// Check for boundary conditions before rotating
		const isOutOfBounds = rotatedTetromino.some(
			(index) =>
				(currentPosition + index) % width < 0 ||
				(currentPosition + index) % width >= width
		);

		if (!isOutOfBounds) {
			current = rotatedTetromino;
			draw();
		} else {
			// Optionally, you can also prevent rotation if it's too close to the edge
			currentRotation = (currentRotation - 1) % current.length; // Undo rotation if out of bounds
		}
	}

	//show up-next tetromino in mini-grid
	const displaySquares = document.querySelectorAll(".mini-grid div");
	const displayWidth = 4;
	const displayIndex = 0;

	//the Tetrominoes without rotations
	const upNextTetrominoes = [
		[1, displayWidth + 1, displayWidth * 2 + 1, 2], //lTetromino
		[0, displayWidth, displayWidth + 1, displayWidth * 2 + 1], //zTetromino
		[1, displayWidth, displayWidth + 1, displayWidth + 2], //tTetromino
		[0, 1, displayWidth, displayWidth + 1], //oTetromino
		[1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1], //iTetromino
	];

	//display the shape in the mini-grid display
	function displayShape() {
		//remove any trace of a tetromino from the entire grid
		displaySquares.forEach((square) => {
			square.classList.remove("tetromino");
			square.style.backgroundColor = "";
		});
		upNextTetrominoes[nextRandom].forEach((index) => {
			displaySquares[displayIndex + index].classList.add("tetromino");
			displaySquares[displayIndex + index].style.backgroundColor =
				colors[nextRandom];
		});
	}

	//add functionality to the button
	startBtn.addEventListener("click", () => {
		if (timerId) {
			clearInterval(timerId);
			timerId = null;
		} else {
			draw();
			timerId = setInterval(moveDown, 1000);
			nextRandom = Math.floor(Math.random() * theTetrominoes.length);
			displayShape();
		}
	});

	function addScore() {
		for (let i = 0; i < 199; i += width) {
			const row = [
				i,
				i + 1,
				i + 2,
				i + 3,
				i + 4,
				i + 5,
				i + 6,
				i + 7,
				i + 8,
				i + 9,
			];

			if (row.event((index) => squares[index].classList.contains("taken"))) {
				score += 10;
				scoreDisplay.innerHTML = score;

				// Remove "taken" class from cleared row
				row.forEach((index) => {
					squares[index].classList.remove("taken");
					squares[index].style.backgroundColor = "";
				});

				// Shift rows down after clearing
				const squaresRemoved = squares.splice(i, width);
				squares = squaresRemoved.concat(squares); // Update squares array
				squares.forEach((cell) => grid.appendChild(cell));

				// Re-add the squares back to the grid
				squares.forEach((square) => grid.appendChild(square));
			}
		}
	}

	function gameOver() {
		if (
			current.some((index) =>
				squares[currentPosition + index].classList.contains("taken")
			)
		) {
			scoreDisplay.innerHTML = "Game Over";
			clearInterval(timerId); // Stop the game
		}
	}
});
