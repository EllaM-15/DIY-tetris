const cvs = document.getElementById("tetris");
const ctx = cvs.getContext("2d");
const scoreElem = document.getElementById("score");

const ROW = 30;
const COL = 15;
const SQ = 20;
const SCORE_WORTH = 50;
const VACANT = "#0B1215"; // culoarea unui patrat liber
const CONTOUR = "#202020"; // culoarea grid-ului

let score = 0;
let drop_ms = 250 - 0.5*score;

// deseneaza un patrat 
function drawSquare(x, y, color){
    ctx.fillStyle = color;
    ctx.fillRect(x*SQ, y*SQ, SQ, SQ)

    ctx.strokeStyle = CONTOUR;
    ctx.strokeRect(x*SQ, y*SQ, SQ, SQ);
}


// construim tabla de joc
const board = [];
for (i = 0; i < ROW; i++) {
    board[i] = [];
    for (j = 0; j < COL; j++) {
        board[i][j] = VACANT;
    }
}

// desenam tabla de joc
function drawBoard(){
    for (let i = 0; i < ROW; i++){
        for (let j = 0; j < COL; j++) {
            drawSquare(j, i, board[i][j]);
        }
    }
}

drawBoard();

function randomPiece(){
    let rand = Math.floor(Math.random() * PIECES.length) // 0 -> 6
    return new Piece(PIECES[rand][0], PIECES[rand][1]);
}

let p = randomPiece();

// piesele de joc
function Piece(tetromino, color){
    this.tetromino = tetromino;
    this.color = color;
    
    this.tetrominoR = 0; // modelul primei rotatii
    this.activeTetromino = this.tetromino[this.tetrominoR];

    this.x = Math.floor(COL/2);
    this.y = -2;
}

// umplerea cu o anumita culoare a unei forme tetromino
Piece.prototype.fill = function(color) {
    for (let i = 0; i < this.activeTetromino.length; i++){
        for (let j = 0; j < this.activeTetromino.length; j++) {
            if(this.activeTetromino[i][j]) {
                drawSquare(this.x + j, this.y + i, color);
            }
        }
    }
}

// umplerea de culoare a unui tetromino
Piece.prototype.draw = function() {
    this.fill(this.color);
}

// stergerea unui tetromino
Piece.prototype.undraw = function() {
    this.fill(VACANT);
}

// caderea unui tetromino 
Piece.prototype.moveDown = function() {
    if(!this.collision(0, 1, this.activeTetromino)){
        this.undraw();
        this.y++;
        this.draw();
    } else {
        // se blocheaza piesa actuala si se generaza una noua
        this.lock();
        p = randomPiece();
    }
    
}

// mutarea la dreapta unui tetromino
Piece.prototype.moveRight = function() {
    if(!this.collision(1, 0, this.activeTetromino)){
        this.undraw();
        this.x++;
        this.draw();
    }
}

// mutarea la stanga unui tetromino
Piece.prototype.moveLeft = function() {
    if(!this.collision(-1, 0, this.activeTetromino)){
        this.undraw();
        this.x--;
        this.draw();
    }
}

// rotirea unui tetromino
Piece.prototype.rotate = function() {
    nextPattern = this.tetromino[(this.tetrominoR + 1) % this.tetromino.length]
    let kick = 0;
    
    if(this.collision(0,0,nextPattern)){
        if(this.x > COL / 2){
            // lovire de peretele drept 
            kick = -1; // se muta piesa la stanga si dupa se roteste
        } else {
            // lovire de peretele stang
            kick = 1; // se muta piesa la dreapta si dupa se roteste
        }
    }

    if(!this.collision(kick,0,nextPattern)){
        this.undraw();
        this.x += kick;
        this.tetrominoR = (this.tetrominoR + 1) % this.tetromino.length;
        this.activeTetromino = this.tetromino[this.tetrominoR];
        this.draw();
    }
}


// blocarea unui tetromino in pozita finala
Piece.prototype.lock = function() {
    for (let i = 0; i < this.activeTetromino.length; i++){
        for (let j = 0; j < this.activeTetromino.length; j++) {
            // trecem peste patratele libere
            if(!this.activeTetromino[i][j]) {
                continue;
            } 

            // pierdem jocul daca piesele ating marginea superioara
            if(this.y + i < 0){
                alert("Game Over!");
                gameOver = true;
                break;
            }
            board[this.y + i][this.x + j] = this.color;
        }
    }
    // eliminam randurile complete
    for (let i = 0; i < ROW; i++){
        let fullRow = true;
        for (let j = 0; j < COL; j++) {
            fullRow = fullRow &&(board[i][j] != VACANT);
        }
        if(fullRow){
            for(let r = i; r > 1; r--){
                for (let c = 0; c < COL; c++){
                    board[r][c] = board[r-1][c];
                }
            }
            for(let c = 0; c < COL; c++){
                board[0][c] = VACANT;
            }
            // marim scorul
            score += SCORE_WORTH;
        }
    }
    drawBoard();

    p = randomPiece();
    p.draw();

    scoreElem.innerHTML = score;
}

// testam daca se intalneste cu alte piese sau cu marginea tablei
Piece.prototype.collision = function(x, y, piece) {
    for (let i = 0; i < piece.length; i++){
        for (let j = 0; j < piece.length; j++) {
            if(!piece[i][j]) {
                continue;
            }
            let newX = this.x + j + x;
            let newY = this.y + i + y;

            if(newX < 0 || newX >= COL || newY >= ROW){
                return true;
            }

            if(newY < 0) {
                continue;
            }

            if(board[newY][newX] != VACANT){
                return true;
            }
        }
    }
    return false;
}

// controlul pieselor
document.addEventListener("keydown", CONTROL);

function CONTROL(event){
    if(event.keyCode == 37) { // sageata stanga
        p.moveLeft();
        dropStart = Date.now();
    } else if (event.keyCode == 38) { // sageata de sus
        p.rotate();
        dropStart = Date.now();
    } else if (event.keyCode == 39) { // sageata dreapta
        p.moveRight();
        dropStart = Date.now();
    } else if (event.keyCode == 40) { // sageata de jos
        p.moveDown();
        dropStart = Date.now();
    }
}

// caderea unui tetromino o data la un timp
let dropStart = Date.now();
let gameOver = false;
function drop(){
    let now = Date.now();
    let delta = now - dropStart;
    if(delta > drop_ms){
        p.moveDown();
        dropStart = Date.now();
    }
    if(!gameOver){
        requestAnimationFrame(drop);
    }
}

drop();