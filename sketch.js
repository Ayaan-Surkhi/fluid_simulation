function setup() {
  createCanvas(400, 400);
  cellSize = width / n;
  
  for (let i = 0; i < n; i++) {
    cells[i] = [];
    nextCells[i] = [];
    for (let j = 0; j < n; j++) {
      // blob of density near the center and gentle velocity
      let dx = i - n / 2;
      let dy = j - n / 2;
      let d = exp(-(dx * dx + dy * dy) / 6.0);
      let vx = -dy * .08;
      let vy = dx * .08;
      cells[i][j] = new Cell(i, j, d, vx, vy, 0.1);
      nextCells[i][j] = new Cell(i, j, d, vx, vy, 0.1);
    }
  }
}

function draw() {
  background(255);

  // little dye where the mouse moves
  if (mouseIsPressed) {
    let mi = floor(mouseX / cellSize);
    let mj = floor(mouseY / cellSize);
    if (mi > 0 && mi < n - 1 && mj > 0 && mj < n - 1) {
      cells[mi][mj].d = min(1, cells[mi][mj].d + 0.4);
      cells[mi][mj].vel.add((mouseX - pmouseX) * 0.05, (mouseY - pmouseY) * 0.05);
    }
  }

  // 1. diffuse density using previous-frame values
  for (let i = 1; i < n - 1; i++) {
    for (let j = 1; j < n - 1; j++) {
      let s =
        (cells[i - 1][j].d +
          cells[i + 1][j].d +
          cells[i][j + 1].d +
          cells[i][j - 1].d) / 4;
      let k = 0.25;
      nextCells[i][j].d = cells[i][j].diffuse(s, k);
    }
  }
  swapGrids();

  // 2. advect density along velocity field
  for (let i = 1; i < n - 1; i++) {
    for (let j = 1; j < n - 1; j++) {
      nextCells[i][j].d = cells[i][j].advect(cells);
    }
  }
  swapGrids();

  // 3. clear divergence on velocity field
  for (let i = 1; i < n - 1; i++) {
    for (let j = 1; j < n - 1; j++) {
      cells[i][j].clear_divergence(cells);
    }
  }

  // render density
  noStroke();
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let shade = constrain(cells[i][j].d * 255, 0, 255);
      fill(30, 90, 180, shade);
      rect(i * cellSize, j * cellSize, cellSize, cellSize);
    }
  }
}

function swapGrids() {
  let temp = cells;
  cells = nextCells;
  nextCells = temp;
}