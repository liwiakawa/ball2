document.addEventListener("DOMContentLoaded", start);
let TIMER_SPEED = 10; //jak czas w grze zapierdala
let HOLE_DIFFICULTY = 1.3; //jak trudna będzie dziura
let MAX_HIGHSCORES = 20; //max wynik
let PREFIX_LENGTH = 8; //długość niku w rankingu

let canvas; //canvasik
let context; //kontekst

let ball; //bakłażan
let hole; //picz
let badhole; //bad pepper
let game; //giera
let gameloop; //pętla czy trafiłeś w dobrą dziurę
let ballImage; //fotka bakłażana
let holeImage; //fotka piczy
let badholeImage; // fotka papryki

function start() {
  canvas = document.getElementById("canvas"); //canvasik
  context = canvas.getContext("2d"); //kontekst
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight * 0.7;
  document.getElementById("timer").style.fontSize =
    window.innerHeight * 0.08 + "px";

  initGame(); //czyści plansze
  initHole();
  initBadHole();
  initBall();
  changeGameState();

  window.addEventListener(
    "deviceorientation",
    onDeviceOrientationChange,
    false
  );
}

function onDeviceOrientationChange(event) {
  if (game.state === 1) {
    var shiftX = event.gamma;
    var shiftY = event.beta;
    switch (window.orientation) {
      case 180:
        shiftX *= -1;
        shiftY *= -1;
        break;
      case 90:
        var tmp = shiftX;
        shiftX = shiftY;
        shiftY = -tmp;
        break;
      case -90:
        var tmp = shiftX;
        shiftX = -shiftY;
        shiftY = tmp;
        break;
    }

    ball.x += shiftX;
    ball.y += shiftY;

    context.clearRect(0, 0, canvas.width, canvas.height);
    drawHole();
    drawBadHole();
    drawBall();
  }
}

function initGame() {
  clearGame();
}

// no to czyści plansze i rysuje balle i halle na nowo
//zeruje czas
//ale ta game no nwm
//ma state bo można pausować i zatrzymywać
// a to pierwsze to klasyczny czas w grze
function clearGame() {
  game = {
    speed: 1000 / TIMER_SPEED,
    timepassed: 0,
    state: 0
  };
  initBall();
  initHole();
  initBadHole();
  context.clearRect(0, 0, canvas.width, canvas.height);
  refreshTimer();
}

function ballSize() {
  return canvas.width > canvas.height ? canvas.height / 10 : canvas.width / 10;
}

function initBall() {
  ball = {
    size: ballSize(),
    radius: ballSize() / 2,
    x: ballSize() / 2 + Math.random() * (canvas.width - ballSize() / 2),
    y: ballSize() / 2 + Math.random() * (canvas.height - ballSize() / 2)
  };

  ballImage = new Image();
  ballImage.src = "img/ball.png";
}

//tworzenie dziury
//bierzemy size naszego bakłażana i na tej podstawie tworzymy dziurę
function initHole() {
  hole = {
    size: ballSize() * 1.3,
    radius: (ballSize() * 1.3) / 2,
    x: ballSize() + Math.random() * (canvas.width - ballSize()),
    y: ballSize() + Math.random() * (canvas.height - ballSize()),
    difficulty: HOLE_DIFFICULTY
  };

  holeImage = new Image();
  holeImage.src = "img/hole.png";
}

function initBadHole() {
  badhole = {
    size: ballSize(),
    radius: ballSize(),
    x: ballSize() + Math.random() * (canvas.width - ballSize()),
    y: ballSize() + Math.random() * (canvas.height - ballSize())
  };

  badholeImage = new Image();
  badholeImage.src = "img/badhole.png";
}

function loop() {
  if (ballInHole()) {
    var time = game.timepassed;
    stopGame();
    var name = prompt(
      "Congratulations!\nYou have finished the game in " +
        msToTime(time) +
        "!\n\nPlease type in your name:"
    );
    if (name.length > 0) {
      var chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      var prefix = "";
      for (var i = 0; i < PREFIX_LENGTH; i++)
        prefix += chars.charAt(Math.floor(Math.random() * chars.length));

      setCookie(prefix + name, "" + time, 365 * 100);
    } else if (ballInBadHole()) {
      stopGame();
      alert("GAMEOVER!");
      refreshTimer();
    }
  }

  game.timepassed += game.speed;
  refreshTimer();
}

function ballInHole() {
  var hminx = hole.x - hole.radius * hole.difficulty;
  var hminy = hole.y - hole.radius * hole.difficulty;
  var hmaxx = hole.x + hole.radius * hole.difficulty;
  var hmaxy = hole.y + hole.radius * hole.difficulty;

  var bminx = ball.x - ball.radius;
  var bminy = ball.y - ball.radius;
  var bmaxx = ball.x + ball.radius;
  var bmaxy = ball.y + ball.radius;

  return bminx >= hminx && bminy >= hminy && bmaxx <= hmaxx && bmaxy <= hmaxy;
}

function ballInBadHole() {
  var bhminx = badhole.x - badhole.radius;
  var bhminy = badhole.y - badhole.radius;
  var bhmaxx = badhole.x + badhole.radius;
  var bhmaxy = badhole.y + badhole.radius;

  var bminx = ball.x - ball.radius;
  var bminy = ball.y - ball.radius;
  var bmaxx = ball.x + ball.radius;
  var bmaxy = ball.y + ball.radius;

  return bminx >= bhminx && bminy >= bhminy && bmaxx <= bhmaxx && bmaxy <= bhmaxy;
  
}

function refreshTimer() {
  document.getElementById("timer").innerHTML = msToTime(game.timepassed);
}

function drawBall() {
  if (ball.x < ball.radius) ball.x = ball.radius;
  else if (ball.x > canvas.width - ball.radius)
    ball.x = canvas.width - ball.radius;
  if (ball.y < ball.radius) ball.y = ball.radius;
  else if (ball.y > canvas.height - ball.radius)
    ball.y = canvas.height - ball.radius;

  context.drawImage(
    ballImage,
    ball.x - ball.radius,
    ball.y - ball.radius,
    ball.size,
    ball.size
  );
}

function drawHole() {
  context.drawImage(
    holeImage,
    hole.x - hole.radius,
    hole.y - hole.radius,
    hole.size,
    hole.size
  );
}

function drawBadHole() {
  context.drawImage(
    badholeImage,
    badhole.x - badhole.radius,
    badhole.y - badhole.radius,
    badhole.size,
    badhole.size
  );
}

function getBounds() {
  return {
    minx: ball.x - ball.radius,
    miny: ball.y - ball.radius,
    maxx: ball.x + ball.radius,
    maxy: ball.y + ball.radius
  };
}

function hitTest(x, y) {
  var bounds = getBounds();
  return (
    x >= bounds.minx && x <= bounds.maxx && y >= bounds.miny && y <= bounds.maxy
  );
}

function playGame() {
  if (game.state !== 1) {
    game.state = 1;
    gameloop = setInterval(loop, game.speed);
    changeGameState();
    drawHole();
    drawBadHole();
    drawBall();
  }
}

function pauseGame() {
  if (game.state === 1) {
    game.state = 2;
    clearInterval(gameloop);
    changeGameState();
  }
}

function stopGame() {
  if (game.state !== 0) {
    game.state = 0;
    clearInterval(gameloop);
    clearGame();
    changeGameState();
  }
}

function changeGameState() {
  var start = document.getElementById("play");
  var pause = document.getElementById("pause");
  var stop = document.getElementById("stop");
  switch (game.state) {
    case 1: {
      start.style.opacity = "0.2";
      pause.style.opacity = "1.0";
      stop.style.opacity = "1.0";
      break;
    }
    case 2: {
      start.style.opacity = "1.0";
      pause.style.opacity = "0.2";
      stop.style.opacity = "1.0";
      break;
    }
    default: {
      start.style.opacity = "1.0";
      pause.style.opacity = "0.2";
      stop.style.opacity = "0.2";
      break;
    }
  }
}

function msToTime(s) {
  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  secs = secs < 10 ? "0" + secs : secs;
  mins = mins < 10 ? "0" + mins : mins;
  ms = pad(Math.floor(ms), 3);
  return mins + ":" + secs + ":" + ms;
}

function pad(n, width) {
  n = n + "";
  return n.length >= width ? n : new Array(width - n.length + 1).join("0") + n;
}

function padAfter(n, width, z) {
  z = z || "0";
  n = n + "";
  return n.length >= width ? n : n + new Array(width - n.length + 1).join(z);
}

function setCookie(c_name, value, exdays) {
  var exdate = new Date();
  exdate.setDate(exdate.getDate() + exdays);
  var c_value =
    escape(value) + (exdays == null ? "" : "; expires=" + exdate.toUTCString());
  document.cookie = c_name + "=" + c_value;
}

function getHighscores() {
  var cookies = {};
  if (document.cookie && document.cookie != "") {
    var split = document.cookie.split(";");
    for (var i = 0; i < split.length; i++) {
      var name_value = split[i].split("=");
      name_value[0] = name_value[0].replace(/^ /, "");
      cookies[decodeURIComponent(name_value[0])] = decodeURIComponent(
        name_value[1]
      );
    }
  }
  return cookies;
}

function highscores() {
  var highscores = getHighscores();

  var highscoresMap = new Object();
  var rank = 1;
  for (var index in highscores) {
    if (highscores[index] > 0) {
      highscoresMap[index] = highscores[index];
    }

    if (rank === MAX_HIGHSCORES) break;
    rank++;
  }

  var highscoreMapKeys = Object.keys(highscoresMap);
  highscoreMapKeys.sort(function(a, b) {
    return parseInt(highscoresMap[a]) < parseInt(highscoresMap[b]) ? -1 : 1;
  });

  var output = "";
  var line = "";
  rank = 1;
  highscoreMapKeys.forEach(function(key) {
    var name = key;
    name = name.substring(PREFIX_LENGTH);

    line = rank + ". " + name + " (" + msToTime(highscoresMap[key]) + ")";
    line = padAfter(line, 32, " ");
    output += line + "\n";
    rank++;
  });
  if (output.length > 0) {
    output = "Highscores:\n--------------------------------\n" + output;
    alert(output);
  } else {
    alert("There are no highscores yet!");
  }
}
