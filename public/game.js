// Konstante koje se koriste kasnije u kodu
const GAME_CONFIG = {
    PADDLE_WIDTH: 300,
    PADDLE_HEIGHT: 15,
    PADDLE_COLOR: '#981518',
    PADDLE_SPEED: 6,
    BALL_RADIUS: 8,
    BALL_SPEED: 4,
    BRICK_ROWS: 5,
    BRICK_COLUMNS: 8,
    BRICK_HEIGHT: 20,
    BRICK_PADDING: 10,
    BRICK_COLOR: '#304529',
    SCORE_FONT: '20px Arial',
    TEXT_COLOR: '#fff'
};

let canvas, ctx;
let paddle, ball;
let bricks = [];
let score = 0;
let highScore = localStorage.getItem('HighScore') || 0;
let gameOver = false;

// Funkcija koja se poziva prilikom pokretanja stranice - inicijaliziranje canvasa, palice i lopte
function initGame() {
    // Postavljanje canvasa (platna) na kojem će se iscrtavat elementi igre
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'white';

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Postavljanje palica na canvas - lokacija i veličine
    paddle = {
        x: (canvas.width - GAME_CONFIG.PADDLE_WIDTH) / 2,
        y: canvas.height - GAME_CONFIG.PADDLE_HEIGHT - 20,
        dx: 0,
        width: GAME_CONFIG.PADDLE_WIDTH,
        height: GAME_CONFIG.PADDLE_HEIGHT
    };

    // Postavljanje loptice na canvas - lokacija i veličine
    ball = {
        x: paddle.x + GAME_CONFIG.PADDLE_WIDTH / 2,
        y: paddle.y - GAME_CONFIG.BALL_RADIUS,
        dx: GAME_CONFIG.BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
        dy: -GAME_CONFIG.BALL_SPEED,
        radius: GAME_CONFIG.BALL_RADIUS
    };

    // Poziva se funkcija za iscrtavanje cigli na canvas
    createBricks();
    // Poziva se funkcija za postavljanje listenera na tipke koje služe za kretanje palice
    setupControls();
    // Funkcija kojom pokrećemo animaciju naše igre u pregledniku
    requestAnimationFrame(gameLoop);
}

// Funkcija za kreiranje određenog broji cigli koji je definiran u configu (od tamo se uzimaju i informacije za veličinu)
function createBricks() {
    bricks = []; //Bricks je 2D matrica cigli
    const columns = GAME_CONFIG.BRICK_COLUMNS;
    const rows = GAME_CONFIG.BRICK_ROWS;
    const padding = GAME_CONFIG.BRICK_PADDING;
    const brickHeight = GAME_CONFIG.BRICK_HEIGHT;
    const brickWidth = (canvas.width - (padding * (columns + 1))) / columns;

    for (let row = 0; row < rows; row++) {
        bricks[row] = [];
        for (let col = 0; col < columns; col++) {
            const x = padding + col * (brickWidth + padding);
            const y = padding + row * (brickHeight + padding);
            bricks[row][col] = { x, y, width: brickWidth, height: brickHeight, active: true };
        }
        // Active označava da cigla još nije uništena
    }
}

// Postavljanje kontrola za kretanje palice - tipke "Lijevo" i  "Desno" služe za kretanje palice
function setupControls() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') paddle.dx = -GAME_CONFIG.PADDLE_SPEED;
        if (e.key === 'ArrowRight') paddle.dx = GAME_CONFIG.PADDLE_SPEED;
    });
    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') paddle.dx = 0;
    });
}

// Funkcija koja detektira je li lopta udarila na pojedini objekt
// Ista se funkcija koristi za provjeru je li loptica udarila u ciglu ili u palicu (ovisno o parametru koji šaljemo u funkciju)
function collision(ball, obj) {
    return (
        ball.x > obj.x &&
        ball.x < obj.x + obj.width &&
        ball.y > obj.y &&
        ball.y < obj.y + obj.height
    );
}

// Funkcija u kojoj ažuriramo našu igru i što se iscrtava na zaslonu
function update() {
    if (gameOver) return;

    // Promjena pozicije palice po x osi
    paddle.x += paddle.dx;
    paddle.x = Math.max(Math.min(paddle.x, canvas.width - paddle.width), 0); // Ne želimo da nam palica izađe izvan zaslona pa uzimamo rubne vrijednosti zaslona u slučaju da ona izađe van

    // Promjena pozicije loptice po x i y osi
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Udarac loptice o rub i promjena njezina smjera kretanja 
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) ball.dx *= -1;
    if (ball.y - ball.radius < 0) ball.dy *= -1;

    // Udarac loptice o palicu i promjena njezina smjera kretanja
    if (collision(ball, paddle)) ball.dy *= -1;

    // Udarac loptice o ciglu - moramo "ugasiti" ciglu, promijeniti smijer loptici i ažurirati (high)score
    bricks.forEach(row => row.forEach(brick => {
        if (brick.active && collision(ball, brick)) {
            ball.dy *= -1;
            brick.active = false;
            score++;
            
            // Zvuk prilikom razbijanja cigle
            const brickBreakSound = document.getElementById('brakeBrick');
            brickBreakSound.currentTime = 0; 
            brickBreakSound.play();

            // Ažuriranje highscore-a
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('HighScore', highScore);
            }
        }
    }));

    if (ball.y + ball.radius > canvas.height) gameOver = true;
}

// Funkcija za iscrtavanje palice, loptice i "živih" cigli
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Postavljanje postavki za sjenčanje palice
    ctx.shadowBlur = 20;
    ctx.shadowColor = "white";
    ctx.strokeStyle = GAME_CONFIG.PADDLE_COLOR;
    
    // Crtanje palice sa sjenčanjem
    ctx.fillStyle = GAME_CONFIG.PADDLE_COLOR;
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
    
    // Isključivanje sjenčanja za loptu jer za loptu anm ne treba sjenčano
    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";
    
    // Crtanje lopte
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = GAME_CONFIG.TEXT_COLOR;
    ctx.fill();
    ctx.closePath();
    
    // Ponovno uključivanje sjenčanja, ali ovaj put za cigle
    ctx.shadowBlur = 20;
    ctx.shadowColor = "white";
    ctx.fillStyle = GAME_CONFIG.BRICK_COLOR;
    ctx.strokeStyle = GAME_CONFIG.BRICK_COLOR;
    
    // Crtanje cigli sa senčanjem
    ctx.beginPath();
    bricks.forEach(row => row.forEach(brick => {
        if (brick.active) {
            ctx.rect(brick.x, brick.y, brick.width, brick.height);
        }
    }));
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
    
    // Isključivanje sjenčanja
    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";

    // Ažuriranje bodova u gornjem desnom kutu
    ctx.font = GAME_CONFIG.SCORE_FONT;
    ctx.fillStyle = GAME_CONFIG.TEXT_COLOR;
    ctx.textAlign = 'right';
    ctx.fillText(`Score: ${score} High Score: ${highScore}`, canvas.width - 20, 30);

    // Ispisivanje prikladnih poruka u slučaju pobjede / poraza
    if (gameOver) {
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    }

    if (score === 40) {
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('WINNER', canvas.width / 2, canvas.height / 2);
        gameOver = true;
    }
}

// Glavna petlja igre koju animiramo i prekida se tek kada dođe kraj igre (pobjeda ili poraz)
function gameLoop() {
    update();
    draw();
    if (!gameOver) requestAnimationFrame(gameLoop);
}

window.addEventListener('load', initGame);