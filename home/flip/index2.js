// here lies my failure to implement a solver based on systems of linear equations and gaussian elimination. i give the fuck up. rip

const Cell = class {
  constructor(x,y,id) {
    this.x = x;
    this.y = y;
    this.value = true;
    this.color = 255;
    this.inSolution = false;
    this.coordX = 0;
    this.coordY = 0;
    this.affects = [];
    this.affectedBy = [];
    this.id = id;
  }
};

var size = 4;
var cells = [];
var solved = false;
const canvas = document.getElementById("canvas");
const controls = document.getElementById("controls");
const ctx = canvas.getContext("2d");
canvas.addEventListener("mouseup", onCanvasClick, false);
const newGame = document.getElementById("newGame");
newGame.addEventListener("click", setupBoard, false);
const sizeSelector = document.getElementById("sizeSelector");
const solveButton = document.getElementById("solve");
solveButton.addEventListener("click", solveBoard, false);
let animationId = 0;


function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

//method that alters row1 by row2
function rowxor(row1, row2) {
  for (let i in row1) {
    row1[i] ^= row2[i];
  }
}

function solveBoard(){
  //you ready to see some shit?
  /* step 1 - set up a system of linear equations. see LINK for details but in summary:
   •  one equation for each cell,
   •  one independent variable in each equation per cell
   •  coefficient for each variable indicates whether that cell having a flip inputted will flip the cell represented by this equation
   •  equation is equal to the current value of the cell.
  */
  solved = !solved;
  let equations = [];
  let freeVariables = [];
  let isPivot = [];
  for (let i in cells){
    equations.push([]);
    for (let j in cells){
      equations[i].push(cells[i].affectedBy.includes(cells[j]) ? 1 : 0);
    }
    // =
    equations[i].push(cells[i].value ? 0 : 1); //if false it needs to flip
  }
  //kay lets work out a gaussian elimination algorithm
  let currentRow = 0;
  let doneRows = 0;
  let doneColumns = 0;
  do {
  //find a pivot
  let pivotFound = false;
    for (let i in equations){
      if (equations[i][doneColumns] && i >= currentRow && i < size * size){
        if (i > currentRow) {
          //if pivot isnt at top, move it there with an xor
          rowxor(equations[currentRow], equations[i]);
        }
        //i think once we find this pivot that row is done?
        pivotFound = true;
        break;
      }
    }
    if (!pivotFound){
      //i think we can just move on? even without advancing rows?
      //we should notate this free variable...
      freeVariables.push(doneColumns);
    }
    //now to cancel out all the columns
    for (let i in equations){
      //only do this for lower rows
      if (i > currentRow){
        if (equations[i][doneColumns]){
          //zero it out with an xor
          rowxor(equations[i], equations[currentRow]);
          //wont this bring back ones to the left?
        }
      }
    }
    pivotFound ? currentRow++ : currentRow;
    doneColumns++;
  } while (doneColumns < equations.length);
  
  //huh am, am i done?
  //okay equations[] is now in row echelon form?
  //assuming i didnt fuck up
  //now to backpropogate solutions for each variable...
  //actually rather than backpropogating, the simon tatham source skips straight to generating solutions by systematically filling in unknowns...
  //future emily here, that is backpropogation lol
  let possibleSolutions = [];
  let originalEquations = JSON.parse(JSON.stringify(equations)); //deep clone array
  console.log(equations);
  for (let i = 0; i < 2 ** freeVariables.length; i++){
    /* fill in free variables
     * starting from last row, if the rhs is one, any place that row's column is one should have its rhs flipped
     * i think thats it....
     * 
     * counter to combinations converter
     * x = 5 = 0b101
     * x % 2 == 1
     * (x >> 1) % 2 == 0
     * (x >> 2) % 2 == 1
     */
     let currentSolution = (JSON.parse(JSON.stringify(equations)));
     //set freeVariables
     let rhs = size * size;
     for (let j in freeVariables) {
       currentSolution[freeVariables[j]][rhs] = (i >> j) % 2;
     }
     for (let j in currentSolution) {
       for (let k in currentSolution) {
         let thisRow = currentSolution.length - 1 - j;
         
         //if last column in each row starting from the bottom is one
         if (currentSolution[thisRow][rhs]) {
           
           //if that row has a one in the index of this row, flip that rows rhs
           if (currentSolution[k][thisRow]) {
             currentSolution[k][rhs] ^= 1;
             //console.log(thisRow + " flipped " + k + " to " + currentSolution[k][rhs]);
             console.log(currentSolution[k]);
             console.log(rhs);
             console.log(currentSolution[k][rhs]);
           }
         }
       }
     }
     possibleSolutions.push([]);
     for (let j in currentSolution) {
       possibleSolutions[i][j] = currentSolution[j][rhs];
     }
     console.log(currentSolution);
  }
  updateBoard();
}

function flipCell(cell){
  //theres 0 reason for this to be generic to different flip shapes lol everything else would break
  cell.value = !cell.value;
  cell.inSolution = !cell.inSolution;
  for (let i in cell.affects){
    cell.affects[i].value = !cell.affects[i].value;
  }
  if (!animationId) {
    animationId = requestAnimationFrame(step);
  }
}


function onCanvasClick(event){
  //mouse coord relative to canvas space, after transformations in css and responsive ui
  var rect = canvas.getBoundingClientRect(), // abs. size of element
  mouseX = (event.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
  mouseY = (event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
  
  //find which cell to flip based on divided x and y values
  flipCell(cells[Math.floor(mouseX / cellWidth) * size + Math.floor(mouseY / cellWidth)]);
  updateBoard();
}

function setupBoard(){
  cells = [];
  solved = false;
  size = +sizeSelector.value;
  cellWidth = canvas.width / size;
  
  //create cells
  for (let i = 0; i < size; i++){
    for (let j = 0; j < size; j++){
      cells[(i * size) + j] = new Cell(i, j, j + (i * size));
    }
  }
  
  for (let j in cells){
    //i am so tired
    let i = +j;
    
    //link cells to the: up, down, left, and right if possible
    cells[i].affectedBy.push(cells[i]);
    if (cells[i - 1] && cells[i].y > 0) {
      cells[i].affects.push(cells[i - 1]);
      cells[i - 1].affectedBy.push(cells[i]);
    }
    if (cells[i + 1] && cells[i].y < size - 1) {
      cells[i].affects.push(cells[i + 1]);
      cells[i + 1].affectedBy.push(cells[i]);
    }
    if (cells[i - size] && cells[i].x > 0) {
      cells[i].affects.push(cells[i - size]);
      cells[i - size].affectedBy.push(cells[i]);
    }
    if (cells[i + (size)] && cells[i].x < size - 1) {
      cells[i].affects.push(cells[i + size]);
      cells[i + size].affectedBy.push(cells[i]);
    }
  }
  
  //find the top left of the grid
  topleft = (canvas.width / 2) - ((size * cellWidth) / 2);
  
  //store top left of the cell
  for (let i in cells) {
    cells[i].coordX = topleft + (cells[i].x * cellWidth);
    cells[i].coordY = topleft + (cells[i].y * cellWidth);
  }
  
  //flip random cells for a while
  for (let i = 0; i < cells.length; i++){
    flipCell(cells[getRandomInt(cells.length)]);
  }
  updateBoard();
}

function step(timeStamp) {
  let needsUpdate = false;
  for (let i in cells) {
    if (cells[i].value && cells[i].color < 255) {
      needsUpdate = true;
      cells[i].color = Math.min(cells[i].color * 1.1, 255);
    } else if (!cells[i].value && cells[i].color > 128) {
      needsUpdate = true;
      cells[i].color = Math.max(cells[i].color * 0.9, 128);
    }
  }
  updateBoard();
  if (needsUpdate) {
    requestAnimationFrame(step) 
    } else {
      cancelAnimationFrame(animationId);
      animationId = 0;
    };
}


function updateBoard() {
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "lightgray";
  ctx.lineWidth = 8;
  
  for (let i in cells) {
    //light cells
    if (cells[i].value) {
      ctx.fillStyle = "rgb(" + cells[i].color + " " + cells[i].color + " " + cells[i].color + ")";
      ctx.fillRect(cells[i].coordX, cells[i].coordY, cellWidth, cellWidth);
      
    } else {
      //dark cells
      ctx.fillStyle = "rgb(" + cells[i].color + " " + cells[i].color + " " + cells[i].color + ")";
      ctx.fillRect(cells[i].coordX, cells[i].coordY, cellWidth, cellWidth);
    }
    
    //solver boxes
    if (solved && cells[i].inSolution) {
      ctx.strokeStyle = "red";
      ctx.lineWidth = 4;
      ctx.strokeRect(cells[i].coordX + (cellWidth / 10), cells[i].coordY + (cellWidth / 10), cellWidth - (cellWidth / 5), cellWidth - (cellWidth / 5));
    }
    
    //grid
    ctx.strokeStyle = "lightgray";
    ctx.lineWidth = 8;
    ctx.strokeRect(cells[i].coordX, cells[i].coordY, cellWidth, cellWidth);
    
    //draw affects cells ughhhh
    let hintWidth = cellWidth / 8;
    for (let i in cells) {
      //central square
      ctx.lineWidth = 2;
      ctx.fillStyle = "lightgray";
      ctx.fillRect(cells[i].coordX + cellWidth / 2 - hintWidth / 2, cells[i].coordY + cellWidth / 2 - hintWidth / 2, hintWidth, hintWidth);
      
      //this is cos otherwise its like inset by one pixel
      ctx.strokeRect(cells[i].coordX + cellWidth / 2 - hintWidth / 2, cells[i].coordY + cellWidth / 2 - hintWidth / 2, hintWidth, hintWidth);
      
      for (let j in cells[i].affects) {
        //uggghhhh
        ctx.lineWidth = 2;
        ctx.strokeStyle = "lightgrey";
        
        //the grid distance between the current cell and the affected cell
        let affectedRelativeX = cells[i].affects[j].x - cells[i].x;
        let affectedRelativeY = cells[i].affects[j].y - cells[i].y;
        
        let affectedTopLeftX = (cells[i].coordX + cellWidth / 2) - (hintWidth / 2) + affectedRelativeX * hintWidth;
        let affectedTopLeftY = (cells[i].coordY + cellWidth / 2) - (hintWidth / 2) + affectedRelativeY * hintWidth;
        
        ctx.strokeRect(affectedTopLeftX, affectedTopLeftY, hintWidth, hintWidth);
        //thats what all glsl is like
        //like 4 levels of variables packaging a ridic equation to find the top left of a square
      }
    }
    //todo: research canvas animations?
  }
}

setupBoard();

