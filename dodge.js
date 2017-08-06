"use strict";
var canvas = document.getElementById("GameCanvas");
var ctx = canvas.getContext("2d");
resize(canvas);

var clickedAnySong = false;
var clickedSong1 = false;
var clickedSong2 = false;
var clickedSong3 = false;
var clickedSong4 = false;
var musicScreen = false;
var clickedHighScore = false;
var startMenu = true;
var gameEnd = false;
var paused = false;
var creditScreen = false;
var playing = false;
var centerPlayer = false;
var x = canvas.width/2;
var y = canvas.height-30;
var ballRadius = 16;
var playerBallRadius = 15;
var ballX = (canvas.width-ballX)/2;
var ballY = canvas.height-30;

var bestPlayers = [];
if (localStorage.getItem("highScores") != null) {
	var temp = JSON.parse(localStorage.getItem("highScores"));
	for (i = 0; i < temp.length; i++) {
		bestPlayers.push(temp[i]);
	}
}

var maxNumHighScores = 10;
var newHighScore;

var score = 0;
var showScore = 0;
var highscore = 0;
var count = 0;
var enemyCount = 15;

var leftX = -ballRadius;
var rightX = canvas.width + ballRadius;
var topY = -ballRadius;
var botY = canvas.height + ballRadius;

var enemies = [];

var easy = 2;
var medium = 3;
var hard = 4;
var difficulty = 1;
var lowestSpeed = 0.5;

var timerInterval;
var gameInterval;

var timer = 3;
var passedTime = 0;

var maxEnemies = 50;
var speed = 4;
var key = [];
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);
function keyDownHandler(e) {
	// pressing p pauses the game
	if (e.keyCode == 80 && !startMenu && !gameEnd) {
		paused = !paused;
		if (!paused) {
			document.getElementById("pausescreen").style.visibility = "hidden";
			bgm.volume = 1;
		}
	}
	key[e.keyCode] = 1;
}

function keyUpHandler(e) {
	key[e.keyCode] = 0;
}

function mouseMoveHandler(e) {
	if (!paused && !playing) {
		var relativeX = e.clientX - canvas.offsetLeft - ballRadius;
	    var relativeY = e.clientY - canvas.offsetTop - ballRadius + window.pageYOffset;
	    if (relativeX > 0 && relativeX < canvas.width - ballRadius*2 && relativeY > 0 && relativeY < canvas.height - ballRadius*2) {
	        ballX = relativeX + ballRadius;
	        ballY = relativeY + ballRadius;
	    }
	}
}

function resize(cvs) {
  	var displayWidth  = cvs.clientWidth;
  	var displayHeight = cvs.clientHeight;
 
  	if (cvs.width  != displayWidth || cvs.height != displayHeight) {
	    cvs.width  = displayWidth;
	    cvs.height = displayHeight;
	    rightX = cvs.width + ballRadius;
		botY = cvs.height + ballRadius;
	}
}

function randomSong() {
	var chance = Math.random();
	if (chance <= 0.5) {
		bgm.src = playlist[0];
	}
	else {
		bgm.src = playlist[1];
	}
}

class Enemy {
	constructor(x, y, dx, dy, plusorminusX, plusorminusY) {
		this.x = x;
		this.y = y;
		this.dx = dx;
		this.dy = dy;
		this.plusorminusX = plusorminusX;
		this.plusorminusY = plusorminusY;
	}

	getX() {
		return this.x;
	}

	getY() {
		return this.y;
	}

	getDX() {
		return this.dx;
	}

	getDY() {
		return this.dy;
	}

	getPlusOrMinusX() {
		return this.plusorminusX;
	}

	getPlusOrMinusY() {
		return this.plusorminusY;
	}

	setX(tempX) {
		this.x = tempX;
	}

	setY(tempY) {
		this.y = tempY;
	}

	setDX(tempDX) {
		this.dx = tempDX;
	}

	setDY(tempDY) {
		this.dy = tempDY;
	}

	setPlusOrMinusX(tempQX) {
		this.plusorminusX = tempQX;
	}

	setPlusOrMinusY(tempQY) {
		this.plusorminusY = tempQY;
	}
}

function randomStart() {
	var randomPlace = Math.random();
	var startX;
	var startY;

	if (randomPlace <= 0.25) {
		startX = leftX;
		startY = Math.random()*canvas.height;
	}
	else if (randomPlace <= 0.5) {
		startX = rightX;
		startY = Math.random()*canvas.height;
	}
	else if (randomPlace <= 0.75) {
		startX = Math.random()*canvas.width;
		startY = botY;
	}
	else {
		startX = Math.random()*canvas.width;
		startY = topY;
	}

	return [startX, startY];
}

for (a = 0; a < enemyCount; a++) {
	var randomPlace = randomStart();
	var randDX = 0;
	var randDY = 0;
	var tempQX = Math.random();
	var tempQY = Math.random();
	if (randomPlace[0] == leftX) {
		randDX = Math.random()*2;
		if (tempQY < 0.5) {
			randDY -= Math.random()*2 + 0.5;
		}
		else {
			randDY = Math.random()*2 + 0.5;
		}
	}
	else if (randomPlace[0] == rightX) {
		randDX -= Math.random()*2 + 0.5;
		if (tempQY < 0.5) {
			randDY -= Math.random()*2 + 0.5;
		}
		else {
			randDY = Math.random()*2 + 0.5;
		}
	}
	else if (randomPlace[1] == botY) {
		randDY -= Math.random()*2 + 0.5;
		if (tempQX < 0.5) {
			randDX -= Math.random()*2 + 0.5;
		}
		else {
			randDX = Math.random()*2 + 0.5;
		}
	}
	else {
		randDY = Math.random()*2 + 0.5;
		if (tempQX < 0.5) {
			randDX -= Math.random()*2 + 0.5;
		}
		else {
			randDX = Math.random()*2 + 0.5;
		}
	}
    enemies[a] = new Enemy(randomPlace[0], randomPlace[1], randDX, randDY, tempQX, tempQY);
}

function drawScore() {
    if (gameEnd || paused) {
    	document.getElementById("scoreCountDiv").style.color = "#5A6472";
    }
    else {
    	document.getElementById("scoreCountDiv").style.color = "#22252B";
    }
    document.getElementById("scoreCountDiv").innerHTML = "Score: " + showScore.toString();
    document.getElementById("scoreCountDiv").style.visibility = "visible";
}

function drawHighScore() {
	if (gameEnd || paused) {
    	document.getElementById("highScoreCountDiv").style.color = "#5A6472";
    }
    else {
    	ctx.fillStyle = "#22252B";
    	document.getElementById("highScoreCountDiv").style.color = "#22252B";
    }
    if (bestPlayers.length > 0) {
    	document.getElementById("highScoreCountDiv").innerHTML = "High Score: " + bestPlayers[0].score;
    }
    else {
    	document.getElementById("highScoreCountDiv").innerHTML = "High Score: " + 0;
    }
    document.getElementById("highScoreCountDiv").style.visibility = "visible";
}

function drawEnemies() {
	resize(canvas);
	for (i = 0; i < enemies.length; i++) {
		ctx.beginPath();
		ctx.arc(enemies[i].getX(), enemies[i].getY(), ballRadius, 0, Math.PI*2);
		if (startMenu || gameEnd || paused) {
			ctx.fillStyle = "#FF6666";
		}
		else {
			ctx.fillStyle = "#CC0000";
		}
		ctx.fill();
		ctx.closePath();
	}
}

function drawPlayerCircle() {
	resize(canvas);
	if (playing && !paused) {
		if (key[37]) {
    		ballX -= speed;
    	}
    	if (key[38]) {
    		ballY -= speed;
    	}
    	if (key[39]) {
    		ballX += speed;
    	}
    	if (key[40]) {
    		ballY += speed;
    	}
	}
	ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    if (centerPlayer) {
    	ballX = (canvas.width-playerBallRadius)/2;
		ballY = (canvas.height-playerBallRadius)/2 - 30;
		centerPlayer = false;
    }
    ctx.arc(ballX, ballY, playerBallRadius, 0, Math.PI*2);
    if (gameEnd || paused) {
    	ctx.fillStyle = "#0088CC";
    }
    else {
    	ctx.fillStyle = "#0066CC";
    }
    ctx.fill();
    ctx.closePath();
}

function collisionDetection() {
	resize(canvas);
	for (i = 0; i < enemies.length; i++) {
		var currEnemy = enemies[i];
		var inner = Math.pow((ballX-currEnemy.getX()), 2) + Math.pow((ballY-currEnemy.getY()), 2);
		if (Math.sqrt(inner) < playerBallRadius*2) {
			gameOver();
		}
	}
}

function draw() {
	resize(canvas);
    if (!paused) {
    	ctx.clearRect(0, 0, canvas.width, canvas.height);
    	drawPlayerCircle();
    	drawEnemies();
    	if (!startMenu) {
    		drawScore();
    		drawHighScore();
    	}
    }
    else {
    	pauseScreen();
    }

    if (!startMenu && !paused) {
    	collisionDetection();
    	count += 10;
    	if (count%100 == 0) {
    		showScore += 7;
    	}
    	if (count%200 == 0) {
    		score += 10;
    		if (score%100 == 0 && enemies.length < maxEnemies) {
    			createEnemy();
    		}
    	}

    	if (score > 200 && score < 500) {
    		difficulty = easy;
    		lowestSpeed = 0.75;
    	}
    	else if (score < 800) {
    		difficulty = medium;
    	}
    	else {
    		difficulty = hard;
    	}
    }

    // check to see if enemies are outside canvas
    // reset that enemy
    if (!paused) {
    	for (a = 0; a < enemies.length; a++) {
	    	if (enemies[a].getX() + enemies[a].getDX() > canvas.width + ballRadius || enemies[a].getX() + enemies[a].getDX() < -ballRadius || 
	    		enemies[a].getY() + enemies[a].getDY() < -ballRadius || enemies[a].getY() + enemies[a].getDY() > canvas.height + ballRadius) {
	   			var randomPlace = randomStart();
	   			enemies[a].setX(randomPlace[0]);
	    		enemies[a].setY(randomPlace[1]);
	    		enemies[a].setPlusOrMinusX(Math.random());
	    		enemies[a].setPlusOrMinusY(Math.random());
	    		var currQX = enemies[a].getPlusOrMinusX();
	    		var currQY = enemies[a].getPlusOrMinusY();
	    		var newDX = 0;
	    		var newDY = 0;
	    		if (randomPlace[0] == leftX) {
					newDX = Math.random()*difficulty + lowestSpeed;
					if (currQY < 0.5) {
						newDY -= Math.random()*difficulty + lowestSpeed;
					}
					else {
						newDY = Math.random()*difficulty + lowestSpeed;
					}
				}
				else if (randomPlace[0] == rightX) {
					newDX -= Math.random()*difficulty + lowestSpeed;
					if (currQY < 0.5) {
						newDY -= Math.random()*difficulty + lowestSpeed;
					}
					else {
						newDY = Math.random()*difficulty + lowestSpeed;
					}
				}
				else if (randomPlace[1] == botY) {
					newDY -= Math.random()*difficulty + lowestSpeed;
					if (currQX < 0.5) {
						newDX -=Math.random()*difficulty + lowestSpeed;
					}
					else {
						newDX = Math.random()*difficulty + lowestSpeed;
					}
				}
				else {
					newDY = Math.random()*difficulty + lowestSpeed;
					if (currQX < 0.5) {
						newDX -= Math.random()*difficulty + lowestSpeed;
					}
					else {
						newDX = Math.random()*difficulty + lowestSpeed;
					}	
				}
	    		enemies[a].setDX(newDX);
	    		enemies[a].setDY(newDY);
	    	}
	    	else {
	    		var jX = enemies[a].getX() + enemies[a].getDX();
	    		var jY = enemies[a].getY() + enemies[a].getDY();
	    		enemies[a].setY(jY);
	    		enemies[a].setX(jX);
	    	}
	    }
    } 
}

function countdown() {
	var id = setInterval(countframe, 10);
	function countframe() {
		if (timer == 0) {
			clearInterval(id);
			document.getElementById("counter").style.visibility = "hidden";
			timer = 3;
			passedTime = 0;
			startMenu = false;
			randomSong();
			bgm.volume = 1;
			bgm.play();
			resetEnemies();
			runGame();
		}
		else {
			passedTime += 10;
			if (passedTime%1000 == 0) {
				timer--;
			}
			centerPlayer = true;
			drawPlayerCircle();
			drawScore();
			drawHighScore();
			if (timer > 0) {
				document.getElementById("counter").style.visibility = "visible";
				document.getElementById("counter").innerHTML = timer.toString();
			}
		}

	}
}

function createEnemy() {
	var randomPlace = randomStart();
	var randDX = 0;
	var randDY = 0;
	var tempQX = Math.random();
	var tempQY = Math.random();

	if (randomPlace[0] == leftX) {
		randDX = Math.random()*2;
		if (tempQY < 0.5) {
				randDY -= Math.random()*difficulty + lowestSpeed;
		}
		else {
			randDY = Math.random() + 0.5;
		}
	}
	else if (randomPlace[0] == rightX) {
		randDX -= Math.random()*difficulty + lowestSpeed;
		if (tempQY < 0.5) {
			randDY -= Math.random()*difficulty + lowestSpeed;
		}
		else {
			randDY = Math.random()*difficulty + lowestSpeed;
		}
	}
	else if (randomPlace[1] == botY) {
		randDY -= Math.random()*difficulty + lowestSpeed;
		if (tempQX < 0.5) {
			randDX -= Math.random()*difficulty + lowestSpeed;
		}
		else {
			randDX = Math.random()*difficulty + lowestSpeed;
		}
	}
	else {
		randDY = Math.random()*difficulty + lowestSpeed;
		if (tempQX < 0.5) {
			randDX -= Math.random()*difficulty + lowestSpeed;
		}
		else {
			randDX = Math.random()*difficulty + lowestSpeed;
		}
	}
	enemies.push(new Enemy(randomPlace[0], randomPlace[1], randDX, randDY, tempQX, tempQY));
}

function resetEnemies() {
	enemies.length = 0;
	for (a = 0; a < enemyCount; a++) {
		var randomPlace = randomStart();
		var randDX = 0;
		var randDY = 0;
		var tempQX = Math.random();
		var tempQY = Math.random();
		if (randomPlace[0] == leftX) {
			randDX = Math.random()*2;
			if (tempQY < 0.5) {
				randDY -= Math.random() + 0.5;
			}
			else {
				randDY = Math.random() + 0.5;
			}
		}
		else if (randomPlace[0] == rightX) {
			randDX -= Math.random() + 0.5;
			if (tempQY < 0.5) {
				randDY -= Math.random() + 0.5;
			}
			else {
				randDY = Math.random() + 0.5;
			}
		}
		else if (randomPlace[1] == botY) {
			randDY -= Math.random() + 0.5;
			if (tempQX < 0.5) {
				randDX -= Math.random() + 0.5;
			}
			else {
				randDX = Math.random() + 0.5;
			}
		}
		else {
			randDY = Math.random() + 0.5;
			if (tempQX < 0.5) {
				randDX -= Math.random() + 0.5;
			}
			else {
				randDX = Math.random() + 0.5;
			}
		}

    	enemies[a] = new Enemy(randomPlace[0], randomPlace[1], randDX, randDY, tempQX, tempQY);
	}
}

function runGame() {
	gameInterval = setInterval(draw, 15);
}

function pauseScreen() {
	bgm.volume = 0.1;
	document.getElementById("paused").innerHTML = "GAME PAUSED";
	document.getElementById("pauseinfo").innerHTML = "PRESS P TO CONTINUE";
	document.getElementById("pausescreen").style.visibility = "visible";
	drawPlayerCircle();
	drawEnemies();
	drawScore();
	drawHighScore();

}

function gameOver() {
	bgm.volume = 0.1;
	gameEnd = true;
	drawPlayerCircle();
	drawEnemies();
	drawScore();
	drawHighScore();
	clearInterval(gameInterval);

	if (bestPlayers.length < maxNumHighScores || showScore > bestPlayers[bestPlayers.length - 1].score || bestPlayers.length == 0) {
		newHighScore = showScore;
		document.getElementById("congrats").style.visibility = "visible";
		document.getElementById("congratsInfo").style.visibility = "visible";
		document.getElementById("formSheet").style.visibility = "visible";
		$('#startButton').attr('disabled', 'disabled');
		$('#backToStartButton').attr('disabled', 'disabled');
		document.getElementById("endScore").innerHTML = "New High Score: " + showScore;
	}
	else {
		document.getElementById('thanksMessage').style.visibility = "visible";
		document.getElementById("endScore").innerHTML = "Score: " + showScore;
	}

	document.getElementById("gameover").innerHTML = "GAME OVER";

	document.getElementById("endscreen").style.visibility = "visible";
	score = 0;
	showScore = 0;
	$('#buttonLayout').css('margin-left', '-138');
	$('#startButton').show();
	$('#backButtonContainer').show();
	// change facebook share description to show high score
	$("meta[property='og\\:description']").attr('content', "I scored " + score + ". Can you dodge better?");
	$('.fb-share-button').show();
	resetEnemies();
}

function showMusicOffMsg() {
	$('#musicDisabledMsgDiv').show();
	$("#musicDisabledMsgDiv").animate({ opacity: 1 }, 1000);
	$('#musicDisabledMsgDiv').delay(500).animate({ opacity: 0 }, 1000);
	$('#musicDisabledMsgDiv').delay(200).hide(0);
}

runGame();

var startSong = new Audio('./game_music/basematic_Zest.mp3');
startSong.loop = true;

var creditSong = new Audio('./game_music/beautiful_cybaker1.mp3');
creditSong.loop = true;

var song1 = './game_music/prediction_branmuffin.mp3';
var song2 = './game_music/flight_al3x.mp3';

var songIndex = 0;
var bgm = new Audio();
bgm.loop = false;

var playlist = new Array(song1, song2);

startSong.play();

// add event listener
bgm.addEventListener("ended", nextTrack, true);

function nextTrack() {
	songIndex++;
	if (songIndex <= playlist.length - 1) {
		bgm.src = playlist[songIndex];
		bgm.play();
	}
	else {
		songIndex = 0;
		bgm.src = playlist[songIndex];
		bgm.play();
	}
}

$('#startButton').on('click', function(e) {
	startSong.pause();
	bgm.pause();
	$(this).hide();
	$('.fb-share-button').hide();
	$('#optionButton').hide();
	$('#highScoreButton').hide();
	$('#backButtonContainer').hide();
	$('#musicButton').hide();
	$('#creditButton').hide();
	gameEnd = false;
	playing = true;
	document.getElementById("title").style.visibility = "hidden";
	document.getElementById("endscreen").style.visibility = "hidden";
	document.getElementById("congrats").style.visibility = "hidden";
	document.getElementById("congratsInfo").style.visibility = "hidden";
	document.getElementById("rankMessage").style.visibility = "hidden";
	document.getElementById("thanksMessage").style.visibility = "hidden";
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	clearInterval(gameInterval);
	ctx.font = "50px sans-serif";
	ctx.fillStyle = "#5A6472";
	ctx.fillText(timer.toString(), canvas.width/2 - 15, canvas.height/2 + 10);
	countdown();
});

$('#backToStartButton').on('click', function(e) {
	$("meta[property='og\\:description']").attr('content', "A simple game.");
	$('.fb-share-button').show();
	$('#backButtonContainer').hide();
	$('#buttonLayout').css('margin-left', '');
	$('#optionButton').show();
	$('#highScoreButton').show();
	$('#startButton').show();
	$('#musicButton').show();
	$('#creditButton').show();
	playing = false;
	if (musicScreen) {
		if (clickedSong1) {
			clickedSong1 = false;
			$('#music1').removeClass('glyphicon-pause');
			$('#music1').addClass('glyphicon-play');
		}
		if (clickedSong2 || clickedSong3) {
			bgm.pause();
			bgm.loop = false;
			clickedSong2 = false;
			clickedSong3 = false;
			$('#music2').removeClass('glyphicon-pause');
			$('#music2').addClass('glyphicon-play');
			$('#music3').removeClass('glyphicon-pause');
			$('#music3').addClass('glyphicon-play');
		}
		if (clickedSong4) {
			creditSong.pause();
			clickedSong4 = false;
			$('#music4').removeClass('glyphicon-pause');
			$('#music4').addClass('glyphicon-play');
		}
		if (clickedAnySong) {
			startSong.currentTime = 0;
			startSong.play();
			clickedAnySong = false;
		}
		musicScreen = false;
	}
	startMenu = true;
	document.getElementById("endscreen").style.visibility = "hidden";
	document.getElementById("title").style.visibility = "visible";
	if(clickedHighScore) {
		document.getElementById("highScoresTable").style.visibility = "hidden";
		clickedHighScore = false;
	}
	document.getElementById("congrats").style.visibility = "hidden";
	document.getElementById("rankMessage").style.visibility = "hidden";
	document.getElementById("thanksMessage").style.visibility = "hidden";
	document.getElementById("optionsTableDiv").style.visibility = "hidden";
	document.getElementById("musicTableDiv").style.visibility = "hidden";
	document.getElementById("scoreCountDiv").style.visibility = "hidden";
	document.getElementById("highScoreCountDiv").style.visibility = "hidden";
	document.getElementById("creditsWrapper").style.visibility = "hidden";
	if (gameEnd) {
		bgm.pause();
		bgm.volume = 1;
		startSong.currentTime = 0;
		startSong.play();
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		gameEnd = false;
		runGame();
	}
	if (creditScreen) {
		creditScreen = false;
		creditSong.pause();
		startSong.currentTime = 0;
		startSong.play();
	}
});

$('#highScoreButton').on('click', function(e) {
	$(this).hide();
	$('#startButton').hide();
	$('#optionButton').hide();
	$('#musicButton').hide();
	$('#creditButton').hide();
	$('#backButtonContainer').show();
	clickedHighScore = true;
	document.getElementById("title").style.visibility = "hidden";
	document.getElementById("highScoresTable").style.visibility = "visible";
	var storedScores = JSON.parse(localStorage.getItem("highScores"));
	if (storedScores.length > 0) {
		$('#topScores').html("");
		for (i = 0; i < storedScores.length; i++) {
			$('#topScores').append("<tr height=\"32px\"><td>"+(i+1)+"</td><td>"+storedScores[i].name+"</td><td>"+storedScores[i].score+"</td></tr>");
		}
		if (storedScores.length < maxNumHighScores) {
			for (j = storedScores.length; j < maxNumHighScores; j++) {
				 $('#topScores').append("<tr height=\"32px\"><td></td><td></td><td></td></tr>");
			}
		}
	}
});

$('#submitButton').on('click', function(e) {
	var playerName = document.getElementById("submitInfo").value;
	document.getElementById("submitInfo").value = "";
	if (playerName.length == 3 && /^[a-zA-Z]+$/.test(playerName)) {
		var upperCaseName = playerName.toUpperCase();
		var currPlayer = {name: upperCaseName, score: newHighScore};
		bestPlayers.push(currPlayer);
		if (bestPlayers.length > 1) {
			bestPlayers.sort(function(a,b){return b.score-a.score});
		}
		if (bestPlayers.length >= maxNumHighScores) {
			bestPlayers.splice(10, 1);
		}
		localStorage.setItem("highScores", JSON.stringify(bestPlayers));


		$('#startButton').removeAttr('disabled');
		$('#backToStartButton').removeAttr('disabled');
		document.getElementById("congratsInfo").style.visibility = "hidden";
		document.getElementById("formSheet").style.visibility = "hidden";
		document.getElementById("errorDiv").style.visibility = "hidden";
		document.getElementById("rankMessage").innerHTML = "YOU ARE RANK #" + (bestPlayers.indexOf(currPlayer) + 1).toString();
		document.getElementById("rankMessage").style.visibility = "visible";
		document.getElementById("thanksMessage").style.visibility = "visible";
	}
	else {
		document.getElementById("errorDiv").style.visibility = "visible";
	}
	return false;
});

$('#optionButton').on('click', function(e) {
	$(this).hide();
	$('#startButton').hide();
	$('#highScoreButton').hide();
	$('#musicButton').hide();
	$('#creditButton').hide();
	$('#backButtonContainer').show();
	document.getElementById("title").style.visibility = "hidden";
	document.getElementById("optionsTableDiv").style.visibility = "visible";
});

$('#musicButton').on('click', function(e) {
	musicScreen = true;
	$(this).hide();
	$('#startButton').hide();
	$('#highScoreButton').hide();
	$('#optionButton').hide();
	$('#backButtonContainer').show();
	$('#creditButton').hide();
	document.getElementById("title").style.visibility = "hidden";
	document.getElementById("musicTableDiv").style.visibility = "visible";
});

// Plays the opening song: Zest by basematic
$('#musicButton1').on('click', function(e) {
	clickedAnySong = false;
	if (!clickedSong1) {
		clickedSong1 = true;
		if (clickedSong2) {
			clickedSong2 = false;
			$('#music2').removeClass('glyphicon-pause');
			$('#music2').addClass('glyphicon-play');
		}
		if (clickedSong3) {
			clickedSong3 = false;
			$('#music3').removeClass('glyphicon-pause');
			$('#music3').addClass('glyphicon-play');
		}
		if (clickedSong4) {
			clickedSong4 = false;
			$('#music4').removeClass('glyphicon-pause');
			$('#music4').addClass('glyphicon-play');
			creditSong.pause();
		}
		$('#music1').removeClass('glyphicon-play');
		$('#music1').addClass('glyphicon-pause');
		if (!startSong.muted) {
			bgm.pause();
			startSong.pause();
			startSong.currentTime = 0;
			startSong.play();
		}
		else {
			showMusicOffMsg();
		}
	}
	else {
		clickedSong1 = false;
		$('#music1').removeClass('glyphicon-pause');
		$('#music1').addClass('glyphicon-play');
		startSong.pause();
	}
});

// Plays Prediction by TheBranMuffin
$('#musicButton2').on('click', function(e) {
	clickedAnySong = true;
	if (!clickedSong2) {
		clickedSong2 = true;
		if (clickedSong1) {
			clickedSong1 = false;
			$('#music1').removeClass('glyphicon-pause');
			$('#music1').addClass('glyphicon-play');
		}
		if (clickedSong3) {
			clickedSong3 = false;
			$('#music3').removeClass('glyphicon-pause');
			$('#music3').addClass('glyphicon-play');
		}
		if (clickedSong4) {
			clickedSong4 = false;
			$('#music4').removeClass('glyphicon-pause');
			$('#music4').addClass('glyphicon-play');
			creditSong.pause();
		}
		$('#music2').removeClass('glyphicon-play');
		$('#music2').addClass('glyphicon-pause');
		if (!bgm.muted) {
			startSong.pause();
			bgm.pause();
			bgm.src = playlist[0];
			bgm.loop = true;
			bgm.play();
		}
		else {
			showMusicOffMsg();
		}
	}
	else {
		clickedSong2 = false;
		$('#music2').removeClass('glyphicon-pause');
		$('#music2').addClass('glyphicon-play');
		bgm.pause();
	}
});

// Plays ~Flight~ by Al3x
$('#musicButton3').on('click', function(e) {
	clickedAnySong = true;
	if (!clickedSong3) {
		clickedSong3 = true;
		if (clickedSong1) {
			clickedSong1 = false;
			$('#music1').removeClass('glyphicon-pause');
			$('#music1').addClass('glyphicon-play');
		}
		if (clickedSong2) {
			clickedSong2 = false;
			$('#music2').removeClass('glyphicon-pause');
			$('#music2').addClass('glyphicon-play');
		}
		if (clickedSong4) {
			clickedSong4 = false;
			$('#music4').removeClass('glyphicon-pause');
			$('#music4').addClass('glyphicon-play');
			creditSong.pause();
		}
		$('#music3').removeClass('glyphicon-play');
		$('#music3').addClass('glyphicon-pause');
		if (!bgm.muted) {
			startSong.pause();
			bgm.pause();
			bgm.src = playlist[1];
			bgm.loop = true;
			bgm.play();
		}
		else {
			showMusicOffMsg();
		}
	}
	else {
		clickedSong3 = false;
		$('#music3').removeClass('glyphicon-pause');
		$('#music3').addClass('glyphicon-play');
		bgm.pause();
	}
});

// Plays the credit song: Beautiful by cybaker1
$('#musicButton4').on('click', function(e) {
	clickedAnySong = true;
	if (!clickedSong4) {
		clickedSong4 = true;
		if (clickedSong1) {
			clickedSong1 = false;
			$('#music1').removeClass('glyphicon-pause');
			$('#music1').addClass('glyphicon-play');
		}
		if (clickedSong2) {
			clickedSong2 = false;
			$('#music2').removeClass('glyphicon-pause');
			$('#music2').addClass('glyphicon-play');
		}
		if (clickedSong3) {
			clickedSong3 = false;
			$('#music3').removeClass('glyphicon-pause');
			$('#music3').addClass('glyphicon-play');
		}
		$('#music4').removeClass('glyphicon-play');
		$('#music4').addClass('glyphicon-pause');
		if (!bgm.muted) {
			startSong.pause();
			bgm.pause();
			creditSong.currentTime = 0;
			creditSong.play();
		}
		else {
			showMusicOffMsg();
		}
	}
	else {
		clickedSong4 = false;
		$('#music4').removeClass('glyphicon-pause');
		$('#music4').addClass('glyphicon-play');
		creditSong.pause();;
	}
});

$('#creditButton').on('click', function(e) {
	creditScreen = true;
	startSong.pause();
	creditSong.currentTime = 0;
	setTimeout(function(){creditSong.play(); }, 1400);
	$('#startButton').hide();
	$('#highScoreButton').hide();
	$('#optionButton').hide();
	$('#musicButton').hide();
	$('#creditButton').hide();
	$('#backButtonContainer').show();
	document.getElementById("title").style.visibility = "hidden";
	document.getElementById("creditsWrapper").style.visibility = "visible";

	var tempMarquee = $('#marquee').clone().removeClass();
    $('#marquee').remove();
    $('#creditsWrapper').append(tempMarquee);
    document.getElementById("marquee").style.animationName = "animate";
});

var musicOn = true;
$("[name='musicCheckBox']").bootstrapSwitch();
$("[name='musicCheckBox']").on('switchChange.bootstrapSwitch', function() {
  if ($("[name='musicCheckBox']").bootstrapSwitch('state')) {
    startSong.muted = false;
    bgm.muted = false;
    startSong.play();
    musicOn = true;
  }
  else {
    startSong.muted = true;
    bgm.muted = true;
    musicOn = false;
  }
});
