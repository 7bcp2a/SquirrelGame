/*
I have decided to add sound, enemies and platforms as my game extensions. 
The factory pattern for platforms was reasonable, and I didn't find it too complicated. 
The constructor function was quite challenging. 
After several attempts with lives, I managed to decrease lives at contact with the enemy. 
I have downloaded the sounds from  https://freesound.org/ as recommended. 
My squirrel didn't want to fall down the canyon for a while. I was stuck there trying to solve the bug. 
I had fun drawing my character. I am proud that I can draw such a cute character with simple shapes all by myself. 
It took me a long time to figure out the position of hands and legs so they would be symmetrical. 
Also, the collectable crown was not easy to draw with the triangles covering each other. 
I managed to figure it out and even added adjustable height to make the collectables different. 
Even my canyons are adjustable in width- it is training squirrels endurance. 
I liked the part where I cleared the space, learned to refactor the code, and moved the functions to the back. 
Then I  called them at the beginning, and everything worked like magic.
*/


var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;
var isLeft;
var isRight;
var isFalling;
var isPlummeting;
var clouds;
var mountains;
var trees_x;
var canyons;
var collectables;
var game_score;
var flagpole;
var lives;
var enemies;
var platforms;
var jumpSound;
var walkSound;
var collectableSound;
var fallSound;
var forestSound;
var lifelostSound;
var levelcompleteSound;

function preload()
{
    soundFormats('mp3','wav');
    
    // Load your sounds here.
    jumpSound = loadSound('assets/jump.wav');
    jumpSound.setVolume(0.1);

    walkSound = loadSound('assets/walk.wav');
    walkSound.setVolume(0.3);

	collectableSound = loadSound('assets/collectable.mp3');
    collectableSound.setVolume(0.5);

	fallSound = loadSound('assets/fall.wav');
    fallSound.setVolume(3);

	forestSound = loadSound('assets/forest.wav');
    forestSound.setVolume(0.8);

	lifelostSound = loadSound('assets/lifelost.wav');
    lifelostSound.setVolume(1);

	levelcompleteSound = loadSound('assets/levelcomplete.wav');
    levelcompleteSound.setVolume(0.7);
}


function setup()
{
	createCanvas(1024, 576);
    floorPos_y = height * 3/4;
	lives = 3;
	startGame();
}

function draw()
{
	// Fill the sky blue.
	background(100, 155, 255); 

	// Draw some green ground.
	noStroke();
	fill(0, 155, 0);
	rect(0, floorPos_y, width, height/4); 

	// Implement scrolling.
	push(); 
	translate(scrollPos, 0);

	// Draw clouds.
	drawClouds();

	// Draw mountains.
	drawMountains();

	// Draw trees.
	drawTrees();

	// Draw platforms.
	for(var i = 0; i < platforms.length; i++ )
	{
		platforms[i].draw();
	}
	
	// Draw canyons.
	for(var i = 0; i < canyons.length; i++)
	{
		drawCanyon(canyons[i]);
		checkCanyon(canyons[i]);	
	}

	// Draw collectable items.
	for(var i = 0; i < collectables.length; i++)
	{
		if(!collectables[i].isFound)
		{
			drawCollectable(collectables[i]);
			checkCollectable(collectables[i]);
		}
	}

	// Draw flagpole.
	renderFlagpole();

	// Background items will be moved in the opposite direction to the game character, creating the illusion of motion.
	pop();

	// Draw game character.
	drawGameChar();

	// Draw score.
	drawScore();

	// Draw lives.
	drawLives();

	// Draw game over message.
	if(lives < 1)
	{
		text("Game over. Press space to continue.", width/3, height/2);
		if(keyCode == 32)
		{
			lives = 3;
			startGame();
		}
		//return at the end of the statement. This prevents any further game logic from happening when play is over.
		return;
	}

	// Draw level complete message.
	if(flagpole.isReached == true)
	{
        text("Level complete. Press space to continue.", width/3, height/2);
		if(keyCode == 32)
		{
			lives = 3;
			startGame();
		}
		// Return at the end of the statement. This prevents any further game logic from happening when play is over.
		return;
	}

	// Logic to make the game character move or the background scroll.
	if(isLeft)
	{
		if(gameChar_x > width * 0.2)
		{
			gameChar_x -= 5;
		}
		else
		{
			scrollPos += 5;
		}
	}

	if(isRight)
	{
		if(gameChar_x < width * 0.8)
		{
			gameChar_x  += 5;
		}
		else
		{
			scrollPos -= 5; // Negative for moving against the background.
		}
	}

	// Logic to make the game character rise and fall.
	if(gameChar_y < floorPos_y)
	{
		var isContact = false;
		for(var i = 0; i < platforms.length; i++)
		{
			if(platforms[i].checkContact(gameChar_world_x, gameChar_y) == true)
			{
				isContact = true;
				isFalling = false;
				break;
			}
		}
		if(isContact == false)
		{
			gameChar_y += 4;
			isFalling = true;
		}
	}
	else
	{
		isFalling = false;
	}
	if(isPlummeting)
	{
		gameChar_y += 4;
	}

	// Check if the flagpole is reached.
	if(flagpole.isReached == false)
	{
		checkFlagpole();
	}

	// Check if player died. 
	checkPlayerDie();
	
	// Update real position of gameChar for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;
}


// ---------------------
// Key control functions
// ---------------------

// Function to move the character left and right.
function keyPressed(){

	if(keyCode == 37)
	{
		console.log("left arrow");
		isLeft = true;
        walkSound.play();
	}
	else if(keyCode == 39)
	{
		console.log("right arrow");
		isRight = true;
        walkSound.play();
	}

	// Jump only when the character is touching the ground or platform.
	else if(keyCode == 32 && (!isPlummeting && !isFalling) || gameChar_y == isContact || gameChar_y == floorPos_y  && lives > 0) 
	{
		console.log("space bar");
		gameChar_y -= 100;
        jumpSound.play();
	}
}

// Function to stop moving the character left and right.
function keyReleased()
{
	if(keyCode == 37)
	{
		console.log("left arrow");
		isLeft = false;
	}
	else if(keyCode == 39)
	{
		console.log("right arrow");
		isRight = false;
	}
}

// ------------------------------
// Game character render function
// ------------------------------

// Function to draw the game character.
function drawGameChar()
{
	if(isLeft && isFalling)
	{
		// Add your jumping-left code.
		fill(118, 57, 49);
		//6.body
		ellipse(gameChar_x, gameChar_y-36, 30, 40);
		//6.head
		ellipse(gameChar_x, gameChar_y-58, 20);
		//6.legs
		triangle(gameChar_x-20, gameChar_y-26, gameChar_x, gameChar_y-26, gameChar_x, gameChar_y-16);
		//6.hands
		triangle(gameChar_x-20, gameChar_y-50, gameChar_x, gameChar_y-50, gameChar_x, gameChar_y-23);
		//6.ears
		triangle(gameChar_x, gameChar_y-64, gameChar_x+11, gameChar_y-64, gameChar_x, gameChar_y-33);
		//6.tail
		fill(118, 57, 49, 180);
		ellipse(gameChar_x+10, gameChar_y-40, 30, 50);
	}
	else if(isRight && isFalling)
	{
		// Add your jumping-right code.
		fill(118, 57, 49);
		//5.body
		ellipse(gameChar_x, gameChar_y-36, 30, 40);
		//5.head
		ellipse(gameChar_x, gameChar_y-58, 20);
		//5.legs
		triangle(gameChar_x, gameChar_y-26, gameChar_x+20, gameChar_y-26, gameChar_x, gameChar_y-16);
		//5.hands
		triangle(gameChar_x, gameChar_y-50, gameChar_x+20, gameChar_y-50, gameChar_x, gameChar_y-23);
		//5.ears
		triangle(gameChar_x-11, gameChar_y-64, gameChar_x, gameChar_y-64, gameChar_x, gameChar_y-33);
		//5.tail
		fill(118, 57, 49, 180);
		ellipse(gameChar_x-10, gameChar_y-40, 30, 50);
	}
	else if(isLeft)
	{
		// Add your walking left code.
		fill(118, 57, 49);
		//3.body
		ellipse(gameChar_x, gameChar_y-16, 30, 40);
		//3.head
		ellipse(gameChar_x, gameChar_y-38, 20);
		//3.legs
		triangle(gameChar_x-20, gameChar_y+4, gameChar_x, gameChar_y+4, gameChar_x, gameChar_y-3);
		//3.hands
		triangle(gameChar_x-20, gameChar_y-23, gameChar_x, gameChar_y-23, gameChar_x, gameChar_y-33);
		//3.ears
		triangle(gameChar_x, gameChar_y-45, gameChar_x+11, gameChar_y-55, gameChar_x+5, gameChar_y-3);
		//3.tail
		fill(118, 57, 49, 180);
		ellipse(gameChar_x+10, gameChar_y-21, 30, 50);
	}
	else if(isRight)
	{
		// Add your walking right code.
		fill(118, 57, 49);
		//4.body
		ellipse(gameChar_x, gameChar_y-16, 30, 40);
		//4.head
		ellipse(gameChar_x, gameChar_y-38, 20);
		//4.legs
		triangle(gameChar_x, gameChar_y+4, gameChar_x+20, gameChar_y+4, gameChar_x, gameChar_y-3);
		//4.hands
		triangle(gameChar_x, gameChar_y-23, gameChar_x+20, gameChar_y-23, gameChar_x, gameChar_y-33);
		//4.ears
		triangle(gameChar_x, gameChar_y-45, gameChar_x-11, gameChar_y-55, gameChar_x-5, gameChar_y-3);
		//4.tail
		fill(118, 57, 49, 180);
		ellipse(gameChar_x-10, gameChar_y-21, 30, 50);
	}
	else if(isFalling || isPlummeting)
	{
		// Add your jumping facing forwards code.
		fill(118, 57, 49);
		//2.body
		ellipse(gameChar_x, gameChar_y-36, 30, 40);
		//2.head
		ellipse(gameChar_x, gameChar_y-58, 20);
		//2.legs
		triangle(gameChar_x-20, gameChar_y-26, gameChar_x+20, gameChar_y-26, gameChar_x, gameChar_y-16);
		//2.hands
		triangle(gameChar_x-20, gameChar_y-50, gameChar_x+20, gameChar_y-50, gameChar_x, gameChar_y-23);
		//2.ears
		triangle(gameChar_x-11, gameChar_y-64, gameChar_x+11, gameChar_y-64, gameChar_x, gameChar_y-33);
		//2.tail
		fill(118, 57, 49, 180);
		ellipse(gameChar_x+10, gameChar_y-40, 30, 50);
	}
	else
	{
		// Add your standing front facing code.
		fill(118, 57, 49);
		//1.body
		ellipse(gameChar_x, gameChar_y-16, 30, 40);
		//1.head
		ellipse(gameChar_x, gameChar_y-38, 20);
		//1.legs
		triangle(gameChar_x-20, gameChar_y+4, gameChar_x+20, gameChar_y+4, gameChar_x, gameChar_y-3);
		//1.hands
		triangle(gameChar_x-20, gameChar_y-23, gameChar_x+20, gameChar_y-23, gameChar_x, gameChar_y-33);
		//1.ears
		triangle(gameChar_x, gameChar_y-45, gameChar_x+11, gameChar_y-55, gameChar_x+5, gameChar_y-3);
		triangle(gameChar_x, gameChar_y-45, gameChar_x-11, gameChar_y-55, gameChar_x-5, gameChar_y-3);
		//1.tail
		fill(118, 57, 49, 180);
		ellipse(gameChar_x+10, gameChar_y-21, 30, 50);
	}
}

// ---------------------------
// Background render functions
// ---------------------------

// Function to draw cloud objects.
function drawClouds()
{
	for(var i = 0; i < clouds.length; i++)
	{
		// Draw the cloud in the sky.
		fill(255, 255, 255, 200);
		ellipse(	clouds[i].x_pos, 		clouds[i].y_pos,    clouds[i].size+80, 	 clouds[i].size);
		ellipse(	clouds[i].x_pos+50, 	clouds[i].y_pos,    clouds[i].size+90, 	 clouds[i].size+60);
		ellipse(	clouds[i].x_pos+120,	clouds[i].y_pos,    clouds[i].size+120,  clouds[i].size+30);
	}
}

// Function to draw mountains objects.
function drawMountains()
{
	for(var i = 0; i < mountains.length; i++)
	{
		// Draw the triple mountain.
		// Mountain no.1.
		fill(255);
		triangle(	mountains[i].x_pos, 	mountains[i].y_pos, 
					mountains[i].x_pos+250, mountains[i].y_pos-mountains[i].size, 
					mountains[i].x_pos+600, mountains[i].y_pos);
		// Mountain no.2.
		fill(0, 115, 0);
		triangle(	mountains[i].x_pos-100, mountains[i].y_pos, 
					mountains[i].x_pos+150, mountains[i].y_pos-mountains[i].size,
					mountains[i].x_pos+700, mountains[i].y_pos);
		// Mountain no.3.
		fill(0, 95, 0);
		triangle(	mountains[i].x_pos+350, mountains[i].y_pos, 
					mountains[i].x_pos+350, mountains[i].y_pos-mountains[i].size, 
					mountains[i].x_pos+500, mountains[i].y_pos);
	}
}

// Function to draw trees objects.
function drawTrees()
{
	for(var i=0; i < trees_x.length; i++)
	{
		// Draw the tree.
		// Trunk.
    	fill(120, 100, 100);
		rect(		trees_x[i], 			floorPos_y-120, 		40, 	120);
		// Branches.
    	fill(0, 135, 0, 220);
		triangle(	trees_x[i]-55, 			floorPos_y-80, 
					trees_x[i]+20, 			floorPos_y-220, 
					trees_x[i]+95, 			floorPos_y-80);
		triangle(	trees_x[i]-55, 			floorPos_y-120, 
					trees_x[i]+20, 			floorPos_y-320, 			
					trees_x[i]+95, 			floorPos_y-120);
	}
}

// ---------------------------------
// Canyon render and check functions
// ---------------------------------

// Function to draw canyon objects.
function drawCanyon(t_canyon)
{
	// Draw the brown part of the canyon.
	fill(100, 90, 0);
	triangle(	t_canyon.x_pos, 					432, 
				t_canyon.x_pos+t_canyon.width-50, 	432, 
				t_canyon.x_pos+t_canyon.width-100, 	500);
	// Draw the black part of the canyon.
	fill(0);
	triangle(	t_canyon.x_pos-t_canyon.width-40, 	500, 
				t_canyon.x_pos, 					432, 
				t_canyon.x_pos+t_canyon.width-100, 	500);
}

// Function to check character is over a canyon.
function checkCanyon(t_canyon)
{
	if(	gameChar_world_x > t_canyon.x_pos &&
		gameChar_world_x < t_canyon.x_pos+t_canyon.width-50 && 
		gameChar_y == floorPos_y)
	{
		console.log("fall");
		isPlummeting = true;
        fallSound.play();
	}
}

// ----------------------------------
// Collectable items render and check functions
// ----------------------------------

// Function to draw collectable objects.
function drawCollectable(t_collectable)
{
	// Draw the collectable crown.
	// Crown top.
	fill(255, 255, 0);
	stroke(1);
	triangle(	t_collectable.x_pos, 		t_collectable.y_pos-	t_collectable.size, 
				t_collectable.x_pos+15, 	t_collectable.y_pos-20-	t_collectable.size, 
				t_collectable.x_pos+30, 	t_collectable.y_pos-	t_collectable.size);

	triangle(	t_collectable.x_pos, 		t_collectable.y_pos-	t_collectable.size, 
				t_collectable.x_pos-5, 		t_collectable.y_pos-20-	t_collectable.size, 
				t_collectable.x_pos+15, 	t_collectable.y_pos-	t_collectable.size);
				
	triangle(	t_collectable.x_pos+15, 	t_collectable.y_pos-	t_collectable.size, 
				t_collectable.x_pos+35, 	t_collectable.y_pos-20-	t_collectable.size, 
				t_collectable.x_pos+30, 	t_collectable.y_pos-	t_collectable.size);
	// Crown base. 
	rect(		t_collectable.x_pos, 		t_collectable.y_pos-	t_collectable.size, 29,   t_collectable.size-90);
	// The diamond.
	point(		t_collectable.x_pos+15, 	t_collectable.y_pos-10-	t_collectable.size);	
	noStroke();
}

// Function to check character has collected an item.
function checkCollectable(t_collectable)
{
	if(dist(gameChar_world_x, gameChar_y, t_collectable.x_pos, t_collectable.y_pos-t_collectable.size) < 30)
	{
		console.log("found");
		t_collectable.isFound = true;
		game_score += 1;
        collectableSound.play();
	}
}

// ----------------------------------
// Flagpole render and check functions
// ----------------------------------

// Function to draw flagpole and enemies.
function renderFlagpole()
{
	push();
	strokeWeight(5);
	stroke(180);
	line(flagpole.x_pos, floorPos_y, flagpole.x_pos, floorPos_y-250);
	fill(255, 0, 255);
	noStroke();
	if(flagpole.isReached)
	{
		rect(flagpole.x_pos, floorPos_y-250, 50, 50);
	}
	else
	{
		rect(flagpole.x_pos, floorPos_y-50, 50, 50);
	}
	for(var i = 0; i < enemies.length; i++)
	{
		enemies[i].draw();
		var isContact = enemies[i].checkContact(gameChar_world_x, gameChar_y);
		if(isContact)
		{
			lives -= 1;
        	lifelostSound.play();
			if(lives > 0)
			{
				startGame();
				break;
			}
		}
	}
	pop();
}

// Function to check character has reached the flagpole.
function checkFlagpole()
{
	var d = abs(gameChar_world_x - flagpole.x_pos);
	if(d < 15)
	{
		flagpole.isReached = true;
        levelcompleteSound.play();
	}
}

// ----------------------------------
// Functions to draw score and draw lives
// ----------------------------------

// Function to draw score.
function drawScore()
{
	fill(255, 255, 0);
	stroke(2);
	textSize(20);
	text("Score: " + game_score, 20, 20);
}

// Function to draw lives.
function drawLives()
{
	fill(255, 0, 0);
	stroke(2);
	for(var i = 0; i < lives; i++)
	{
		ellipse(30+i*30, 70, 15, 15);
		text("Lives:  " + lives, 20, 50);	
	}
}

// ----------------------------------
// Player died and start the game functions
// ----------------------------------

// Function to check the player has died.
function checkPlayerDie()
{
	if(gameChar_y > height)
	{
		lives -= 1;
        lifelostSound.play();
		startGame();
	}
}

// Function to start the game.
function startGame()
{
	gameChar_x = width/2;
	gameChar_y = floorPos_y;

	// Variable to control the background scrolling.
	scrollPos = 0;

	// Variable to store the real position of the gameChar in the game world. Needed for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	// Boolean variables to control the movement of the game character.
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;

	// Initialise arrays of scenery objects.
	clouds = 
	[
		{x_pos: 50, 	y_pos: 80, 		size: 70},
		{x_pos: 600, 	y_pos: 100, 	size: 30},
		{x_pos: 1200, 	y_pos: 120, 	size: 80}
	];

	mountains = 
	[
		{x_pos: 250, 	y_pos: 432, 	size: 400},
		{x_pos: 900, 	y_pos: 432, 	size: 300},
		{x_pos: 1200,	y_pos: 432,		size: 212}
	];

	trees_x = 
	[
		100, 
		400, 
		800, 
		1200,
		1700
	];

	canyons = 
	[
		{x_pos: 300, 	width: 110},
		{x_pos: 750, 	width: 100},
		{x_pos: 1150, 	width: 80},
		{x_pos: 1350, 	width: 80}
	];

	collectables = 
	[
		{x_pos: 100, 	y_pos: 422, 	size: 100, 	isFound: false},
		{x_pos: 900, 	y_pos: 522,	 	size: 95, 	isFound: false},
		{x_pos: 1500, 	y_pos: 522, 	size: 105, 	isFound: false},
		{x_pos: 100, 	y_pos: 322, 	size: 110, 	isFound: false},
		{x_pos: 100, 	y_pos: 522, 	size: 95, 	isFound: false},
		{x_pos: 550, 	y_pos: 322, 	size: 100, 	isFound: false}
	];

	// Platforms and enemies.
	platforms = [];
	platforms.push(createPlatforms(100, 	floorPos_y-100, 100))
	platforms.push(createPlatforms(500, 	floorPos_y-100, 200))
	platforms.push(createPlatforms(1200, 	floorPos_y-100, 100))
	platforms.push(createPlatforms(1500, 	floorPos_y-100, 50))
	platforms.push(createPlatforms(100, 	floorPos_y-200, 50))

	enemies = [];
	enemies.push(new Enemy(100, 	floorPos_y-10, 100));
	enemies.push(new Enemy(900, 	floorPos_y-10, 100));
	enemies.push(new Enemy(1200, 	floorPos_y-10, 100));
	enemies.push(new Enemy(1500, 	floorPos_y-10, 100));
	enemies.push(new Enemy(500, 	floorPos_y-120, 100));

	game_score = 0;
	flagpole = {isReached: false, x_pos: 1800};
    forestSound.play();
}

// ----------------------------------------------------------------
// CreatePlatforms factory pattern and Enemy constructor function
// ----------------------------------------------------------------

// CreatePlatforms factory pattern.
function createPlatforms(x, y, length)
{
	var p = {	x: x,
				y: y,
				length: 		length,
				draw:			function()
								{
									fill(255, 0, 255);
									rect(this.x, this.y, this.length, 20);
								},	
				checkContact:	function(gc_x, gc_y)
								{
									if(gc_x > this.x && gc_x < this.x + this.length)
									{
										var d = this.y - gc_y;
										if(d >= 0 && d <5 )
										{
											return true;
										}
									}
									return false;
								}
			}
	return p;		
}

//Enemy constructor function.
function Enemy(x, y, range)
{
	this.x = x;
	this.y = y;
	this.range = range;
	this.currentX = x;
	this.inc = 1;
	this.update = function()
	{
		this.currentX += this.inc;
		if(this.currentX >=  this.x + this.range)
		{
			this.inc = -1;
		}
		else if(this.currentX < this.x)
		{
			this.inc = 1;
		}
	}

	// Draw enemy.
	this.draw = function()
	{
		this.update();
		// Body.
		fill(0, 0, 0, 80);
		ellipse(this.currentX, 		this.y, 60, 60);
		ellipse(this.currentX, 		this.y, 50, 50);
		ellipse(this.currentX, 		this.y, 40, 40);
		ellipse(this.currentX, 		this.y, 30, 30);
		// Eyes.
		fill(255, 0, 0);
		ellipse(this.currentX-10, 	this.y, 9, 5);
		ellipse(this.currentX+10, 	this.y, 9, 5);
		// Cruel face.
		fill(255, 255, 0);
		triangle(this.currentX-15, 	this.y-10, 	this.currentX, 		this.y-5, 	this.currentX, 		this.y);
		triangle(this.currentX+15, 	this.y-10, 	this.currentX+5, 	this.y-5, 	this.currentX+5, 	this.y);
		triangle(this.currentX-15, 	this.y+10, 	this.currentX, 		this.y+5, 	this.currentX, 		this.y);
		triangle(this.currentX+15, 	this.y+10, 	this.currentX+5, 	this.y+5, 	this.currentX+5, 	this.y);
		triangle(this.currentX, 	this.y+15, 	this.currentX+10,	this.y+5, 	this.currentX, 		this.y);
		triangle(this.currentX, 	this.y+15, 	this.currentX-10, 	this.y+5, 	this.currentX-5, 	this.y);
	}

	// Check the distance.
	this.checkContact = function(gc_x, gc_y)
	{
		var d = dist(gc_x, gc_y, this.currentX, this.y);
		if(d < 35)
		{
			return true;
		}
		return false;
	}
}
