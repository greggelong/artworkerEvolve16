const hanzi = [
  "滴","涌","泉","思","汗","禾","文","下","土","一"
];

// Target pattern as 32x32 array (paste your full string here)
const targetStr = `一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一
一一一一一一一一一一一下涌禾涌汗汗禾文涌泉一一一一一一一一一一一
一一一一一一一一一涌禾禾文文文思禾汗文文禾文禾一一一一一一一一一
一一一一一一一滴汗禾文文文文文文泉禾禾文文文禾滴一一一一一一一一
一一一一一一滴滴汗文文文文文文文禾涌禾禾文文文禾滴一一一一一一一
一一一一文滴滴涌禾文文文文文文文文禾禾涌文文文文禾文一一一一一一
一一一一滴滴泉汗文文文文文文文文文文思禾禾文文文文汗一一一一一一
一一一滴滴滴滴禾文文文文文文文文文文禾禾思文文文文禾涌一一一一一
一一一滴滴滴泉禾文文文文文禾禾泉汗禾汗汗汗汗汗汗涌汗滴一一一一一
一一一滴滴滴涌汗文文文禾思汗汗涌滴滴滴滴滴滴滴滴滴涌滴一一一一一
一一一滴滴滴滴滴禾禾禾汗滴滴泉下土土一一土土下泉滴滴滴滴滴一一一
一一一滴滴滴滴滴思汗滴下土一一一一一一一一一一一一土滴滴滴滴一一
一一一滴滴滴泉思滴滴土一一一土土土土一一一一一一一一下滴滴滴下一
一一一滴滴思滴文滴滴一一一滴禾泉滴滴滴一一一涌滴滴滴滴滴滴滴滴一
一一土滴滴滴滴下滴滴一一一下一汗滴文一一一滴文土汗汗滴滴滴滴一一
一一滴滴滴滴滴下滴涌一一一下滴土涌滴一一一滴汗滴文滴滴滴滴涌一一
一滴滴滴滴滴滴下滴一一一一一一思下土一一一土土文文文滴滴土一一一
滴滴滴滴滴滴滴文下一一一一一一一一一一一一一一一一一文一一一一一
滴滴滴滴禾禾滴文文一一一一一一一一一一一一滴一一一一下一一一一一
一滴滴滴文滴滴涌汗一一一一一一一一滴一一一一一一一一下一一一一一
一一滴滴滴泉思滴土一一一一一一一一滴汗一滴一一一一一禾一一一一一
一一一一文滴滴滴下一一一一一一一一一一一一一一一一一一一一一一一
一一一一一滴文禾禾文一一一一一一一土思滴滴下一一一一一一一一一一
一一一一一一滴思滴土一一一一一一土下文下文文涌一一文一一一一一一
一一一一一一一滴滴涌文一一一一一一土滴滴滴禾一一一一一一一一一一
一一一一一一一滴滴滴下泉一一一一一一一一一一一一一一一一一一一一
一一一一一一一一滴滴滴下土一一一一一一一一一一土一一一一一一一一
一一一一一一一一涌滴滴滴禾禾下滴土一一一一土泉一一一一一一一一一
一一一一一一一一文滴滴滴滴滴滴滴文文泉滴滴滴思涌一一一一一一一一
一一一一一一一一滴滴滴泉滴滴下下下一一一涌滴下下滴一一一一一一一
一一一一一一一一一一一一一一一一土一一土滴文禾一土滴一一一一一一
一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一`;

let target = [];
let population = [];
let popSize = 8;       // increased population
let mutationRate = 0.001; // mutation lower works better
let generation = 0;
let cellSize = 12;      // smaller to fit on canvas
let margin = 40;
let gridWidth = 32*cellSize;

function setup() {
  //createCanvas(4*gridWidth + 5*margin, 4*gridWidth + 5*margin + 60); 
   let canvas = createCanvas(4*gridWidth + 5*margin, 4*gridWidth + 5*margin + 60);
canvas.style('display', 'block');
canvas.style('margin', '0 auto'); // horizontal centering

  textFont('monospace');
  textAlign(CENTER, CENTER);
  //frameRate(4);

  // Convert target string to 32x32 array
  const lines = targetStr.trim().split("\n");
  for (let y = 0; y < 32; y++) {
    target[y] = lines[y].split("");
  }

  // Initialize population
  for (let i = 0; i < popSize; i++) {
    population.push(new Genome());
  }
}

function draw() {
  background(255);

  fill(0);
  textSize(40);
  text(`Generation: ${generation}`, width/2, 20);

  // Display first 16 grids in 4x4 layout
  for (let i = 0; i < popSize; i++) {
    let col = i % 4;
    let r = floor(i / 4);
    let x0 = margin + col * (gridWidth + margin);
    let y0 = 40 + r * (gridWidth + margin);
    population[i].display(x0, y0, cellSize);

    // Fitness border: red → green
    let fit = population[i].fitness();
    let pct = fit / (32*32); // normalized 0-1
    strokeWeight(3);
    stroke(lerpColor(color(255,0,0), color(0,200,0), pct));
    noFill();
    rect(x0-1, y0-1, gridWidth+2, gridWidth+2);
    noStroke();

    fill(0);
    textSize(25);
    text(`fit:${fit}`, x0 + gridWidth/2, y0 + gridWidth + 15);
  }

  evolve();
}

function evolve() {
  // Sort by fitness
  population.sort((a,b) => b.fitness() - a.fitness());

  // Use top 4 parents to produce next generation
  let topParents = population.slice(0, 4);
  let children = [];
  for (let i = 0; i < popSize; i++) {
    let parentA = random(topParents);
    let parentB = random(topParents);
    children.push(parentA.crossover(parentB));
  }

  population = children;
  generation++;
}

// --- Genome class ---
class Genome {
  constructor(genes) {
    if (genes) {
      this.genes = genes;
    } else {
      this.genes = [];
      for (let y = 0; y < 32; y++) {
        this.genes[y] = [];
        for (let x = 0; x < 32; x++) {
          this.genes[y][x] = random(hanzi);
        }
      }
    }
  }

  fitness() {
    let score = 0;
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        if (this.genes[y][x] === target[y][x]) score++;
      }
    }
    return score; // 0-1024
  }

  crossover(other) {
    let newGenes = [];
    for (let y = 0; y < 32; y++) {
      newGenes[y] = [];
      for (let x = 0; x < 32; x++) {
        let gene = random() < 0.5 ? this.genes[y][x] : other.genes[y][x];
        if (random() < mutationRate) gene = random(hanzi);
        newGenes[y][x] = gene;
      }
    }
    return new Genome(newGenes);
  }

  display(x0, y0, s) {
    textSize(s);
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        fill(0);
        text(this.genes[y][x], x0 + x*s + s/2, y0 + y*s + s/2);
      }
    }
  }
}
