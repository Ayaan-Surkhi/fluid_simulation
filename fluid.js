let n = 64;
let cellSize;
let cells = [];
let nextCells = [];

class Cell {
  constructor(i, j, d, vx = 0.1, vy = 0.1, dt = 0.1) {
    this.i = i;
    this.j = j;
    this.pos = createVector(i, j);
    this.vel = createVector(vx, vy);
    this.d = d;
    this.p = 0;
    this.dt = dt;
  }

  diffuse(s, k) {
    return (this.d + k * s) / (1 + k);
  }

  lerpVal(a, b, t) {
    return a + t * (b - a);
  }

  advect(grid) {
    let backX = constrain(this.i - this.vel.x * this.dt, 0, n - 1.001);
    let backY = constrain(this.j - this.vel.y * this.dt, 0, n - 1.001);

    let i0 = floor(backX);
    let j0 = floor(backY);
    let i1 = i0 + 1;
    let j1 = j0 + 1;

    let tx = backX - i0;
    let ty = backY - j0;

    let z1 = this.lerpVal(grid[i0][j0].d, grid[i1][j0].d, tx);
    let z2 = this.lerpVal(grid[i0][j1].d, grid[i1][j1].d, tx);

    return this.lerpVal(z1, z2, ty);
  }

  clear_divergence(grid) {
    let i = this.i;
    let j = this.j;

    // Velocity divergence: (du/dx + dv/dy) / 2
    let div =
      0.5 *
      (grid[i + 1][j].vel.x -
        grid[i - 1][j].vel.x +
        grid[i][j + 1].vel.y -
        grid[i][j - 1].vel.y);

    // Jacobi pressure update
    this.p =
      (grid[i - 1][j].p +
        grid[i + 1][j].p +
        grid[i][j - 1].p +
        grid[i][j + 1].p -
        div) / 4;

    // Subtract pressure gradient to make velocity divergence-free
    this.vel.x -= 0.5 * (grid[i + 1][j].p - grid[i - 1][j].p);
    this.vel.y -= 0.5 * (grid[i][j + 1].p - grid[i][j - 1].p);
  }
}