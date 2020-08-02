var fedTime, lastFed, feedButton, fillButton, foodObj, foodS;

var gameState;
var bedroom, washroom, garden, currentTime;

function preload(){
  dogImg = loadImage("images/dogImg.png");
  happyDogImg = loadImage("images/dogImg1.png");
  bedroom = loadImage("images/bedroom.png");
  garden = loadImage("images/garden.png");
  washroom = loadImage("images/washroom.png");
}

function setup() {
  database = firebase.database();
  createCanvas(600,500);
  
  dog = createSprite(450,250,20,20);
  dog.scale = 0.3;

  ground = createSprite(width/2,490,width,20);
  ground.visible = false;

  foodObj = new Food();

  feedButton = createButton("Feed dog");
  feedButton.position(800,100);
  fillButton = createButton("Refill food");
  fillButton.position(900,100);
  feedButton.mousePressed(feedDog);
  fillButton.mousePressed(addFood);

  currentTime = hour();
  //console.log(currentTime);
}


function draw() {  
  background(46,139,87);

  fedTime = database.ref("feedTime");
  fedTime.on("value", function(data){
    lastFed = data.val();
  })

  textSize(20);
  fill(255);
  if(lastFed > 12){
    text("Last Fed: " + lastFed%12 + " PM", 90,70);
  }else if (lastFed === 0){
    text("Last Fed: 12 AM", 90,70);
  }else if(lastFed === 12){
    text("Last Fed: 12 PM", 90,70)
  }else{
    text("Last Fed: " + lastFed + " AM", 90,70);
  }

  readState = database.ref("gameState");
  readState.on("value", readGameState);
  
  if(currentTime == (lastFed + 1)){
    update("playing");
    foodObj.garden();
  }else if(currentTime == (lastFed + 2)){
    update("sleeping");
    foodObj.bedroom();
  }else if (currentTime > (lastFed + 2) && currentTime <= (lastFed + 4)){
    update("bathing");
    foodObj.washroom();
  }else{
    update("hungry");
    foodObj.getFoodStock();
    foodObj.display();
  }

  if(gameState != "hungry"){
    feedButton.hide();
    fillButton.hide();
    dog.remove();
  }
  else if(gameState == "hungry"){
    feedButton.show();
    fillButton.show();
    dog.addImage(dogImg);
  } 
    
  dog.velocityY = dog.velocityY + 8;
  dog.collide(ground);
  drawSprites();
}

function readGameState(data){
  gameState = data.val();
}

function update(state){
  database.ref('/').update({
    gameState: state
  })
}

function addFood(){
  foodObj.updateFoodStock();
}

function feedDog(){
  dog.velocityY = -15;
  foodObj.deductFood();
  database.ref('/').update({
    feedTime:currentTime
  })
}



