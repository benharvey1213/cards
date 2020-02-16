const sock = io();

var myID;
var curCards = [];

// server listeners
sock.on('displayCard', function(text){addSubmittedWhiteCard(text)})
sock.on('displayNameCard', function(text, sockID){addNameCard(text, sockID)})
sock.on('displaySubmittedCard', function(text){addWhiteCard(text)})
sock.on('changeCard', function(cardText){changeCard(cardText)})
sock.on('changePrompt', function(promptText){changePrompt(promptText)})
sock.on('getMyID', function(id){myID = id; /* console.log('my id: ' + myID) */ })
sock.on('clearCards', function(){clearWhiteCards()})
sock.on('showModalCardPair', function(bT, wT){showModalCardPair(bT, wT)})
sock.on('hideModalCardPair', function(){hideModalCardPair()})
sock.on('hidePrompt', function(){hidePromptArea()})
sock.on('showPrompt', function(){showPromptArea()})
sock.on('getSettings', function(){getSettings()})
sock.on('hideBlackCardArea', function(){hideBlackCardArea()})
sock.on('returnRoomID', function(roomID){changePrompt('Room ID: ' + roomID);})
sock.on('screenDrawing', function(coordinates, sockid, color){drawOnScreen(coordinates, sockid, color)})
sock.on('cutScreenDrawing', function(socketid){cutDrawing(socketid)})
sock.on('displayRankings', function(players){displayRankings(players)})

var modalDiv = null; 
var blackCardArea = null;
var whiteCardArea = null;
var promptArea = null;
var settingsArea = null;

window.onload = function() {
    sock.emit('requestRoomID');

    modalDiv = document.getElementById("bg-modal");
    blackCardArea = document.getElementById("blackCards");
    whiteCardArea = document.getElementById("whiteCards");
    promptArea = document.getElementsByClassName("header-area")[0];
    settingsArea = document.getElementsByClassName("settings")[0];
    
}

function displayRankings(players){
    var modal = document.getElementById("bg-modal2");
    var modalContent = document.getElementsByClassName("modal-content2")[0];

    // modal.style.display = "flex";
    modal.style.display = "none";
    
    modalContent.innerHTML = "";
    


    players.forEach(player => {
        var text = document.createElement("div");
        text.innerHTML = player.name + ": " + player.score;
        modalContent.appendChild(text);
        
    });
}

function drawOnScreen(coordinates, sockid, color){
    // find the canvas with the socket id
    var playerCanvas = document.getElementById(sockid);
    var ctx = playerCanvas.getContext("2d");

    // need to stop stroke at some point? look at vid?
    // ctx.beginPath();

    // get dimensions of this canvas
    var rect = playerCanvas.getBoundingClientRect();

    // draw on it
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.strokeStyle = color;

    // make this dynamic - one of these is off somehow
    var toX = coordinates.x * rect.width - 18;
    var toY = coordinates.y * rect.height - 41;

    ctx.lineTo(toX, toY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(toX, toY);

}

function cutDrawing(sockid){
    var playerCanvas = document.getElementById(sockid);
    var ctx = playerCanvas.getContext("2d");
    ctx.beginPath();
}

function clearDrawing(){

}

function getSettings() {
    var isJudgeMode = document.getElementById("judgeMode").checked;
    var isFamilyMode = document.getElementById("familyMode").checked;

    // testing; remove this later
    // isFamilyMode = true;

    sock.emit('setSettings', isJudgeMode, isFamilyMode);
}

function addSubmittedWhiteCard(text) {
    // console.log(text);
    whiteCardArea.style.display = "flex";
    var newCard = text;
    curCards.push(newCard);
    
    // change this if I want something else to display when cards are submitted
    addWhiteCard("");   
};

function showModalCardPair(blackCardText, whiteCardText) {
    var blackCardSpan = document.getElementsByClassName("blackModalSpan")[0];
    var whiteCardSpan = document.getElementsByClassName("whiteModalSpan")[0];
    blackCardSpan.innerHTML = blackCardText;
    whiteCardSpan.innerHTML = whiteCardText;

    modalDiv.style.display = "flex";
}

function toggleSettings() {
    var settingsModal = document.getElementsByClassName("settings-bg-modal")[0];

    if (settingsModal.style.display == "flex"){
        settingsModal.style.display = "none";
    } else {
        settingsModal.style.display = "flex";
    }
}

function hideModalCardPair(){modalDiv.style.display = "none";}
function hideWhiteCardArea(){whiteCardArea.style.display = "none";}
function hideBlackCardArea(){blackCardArea.style.display = "none";}
function hidePromptArea(){promptArea.style.display = "none";}
function showPromptArea(){promptArea.style.display = "auto";}
function showSettingsIcon(){settingsArea.style.display = "auto";}
function hideSettingsIcon(){settingsArea.style.display = "none";}

function addWhiteCard(text) {
    // console.log(text)
    var isBlackCard = false;
    if (text.substring(0, 3) == "*B*"){isBlackCard = true;}
    whiteCardArea.style.display = "flex"
    
    var newButton = document.createElement("button");
    var newTextSpan = document.createElement("span");

    var newContent = null;
    if (isBlackCard){
        newContent = document.createTextNode(text.substring(3, text.length));
    } else {
        newContent = document.createTextNode(text);
    }
    
    newTextSpan.appendChild(newContent);
    newButton.appendChild(newTextSpan);

    if (isBlackCard){
        newButton.classList = "black card";
    } else {
        newButton.className = "card";
    }

    var randomTime = Math.random() * 0.8;
    var randomAngle = ((Math.random() * 300) - 150)+ "deg";

    newButton.style.setProperty('--starting-angle', randomAngle);

    newButton.style.animationTimingFunction = "linear";

    newButton.style.animation = "fadeIn 1s, zoomIn " + randomTime + "s";

    whiteCardArea.appendChild(newButton);
};

function addNameCard(text, playerSocketID) {
    whiteCardArea.style.display = "flex"
    
    var newButton = document.createElement("button");
    newButton.style.cursor = "auto";
    newButton.className = "card";
    // newButton.style.justifyItems("middle");

    var newTextSpan = document.createElement("span");
    // newTextSpan.style.margin = "auto";

    var newContent = document.createTextNode(text);
    
    var newDiv = document.createElement("div");    

    // make this dynamic
    newDiv.style.marginTop = "35px";

    var newCanvas = document.createElement("canvas");
    newCanvas.id = playerSocketID;
    newCanvas.style.border = "2px solid #f0f0f0";

    newTextSpan.appendChild(newContent);
    // newDiv.appendChild(newCanvas);
    newTextSpan.appendChild(newDiv);
    newButton.appendChild(newTextSpan);
    
    // add the card to the screen
    whiteCardArea.appendChild(newButton);

    newDiv.width = newTextSpan.offsetWidth;
    newDiv.height = newTextSpan.offsetWidth;

    // allow this to be dynamic
    // newCanvas.style.position = "absolute";
    // newCanvas.style.width = '100%';
    // newCanvas.style.height = '100%';

    newCanvas.style.width = newDiv.width - 4;
    newCanvas.style.height = newDiv.height - 4;

    // newCanvas.style.width = "150px";
    // newCanvas.style.height = "150px";

    // newCanvas.style.top = newDiv.offsetTop;
    // newCanvas.style.left = newDiv.offsetLeft;

    // newCanvas.width = newDiv.getBoundingClientRect().width;
    // newCanvas.height = newDiv.getBoundingClientRect().width;

    newCanvas.width = newTextSpan.offsetWidth - 4;
    newCanvas.height = newTextSpan.offsetWidth - 4;
};

function addBlackCard(cardText) {
    blackCardArea.style.display = "flex"

    const cardArea = document.getElementById("blackCards");
    
    var newButton = document.createElement("button");
    newButton.className = "black card";
    newButton.id = "blackCard";

    var newTextSpan = document.createElement("span");
    newTextSpan.id = "thisSpan";

    var newContent = document.createTextNode(cardText);
    
    newTextSpan.appendChild(newContent);
    newButton.appendChild(newTextSpan);

    cardArea.appendChild(newButton);
};

function changeCard(cardText) {
    // var blackCard = document.querySelector(".black card");
    var blackCard = document.getElementById("blackCard");
    var cardSpan = document.getElementById("thisSpan");

    if (blackCardArea.style.display == "none"){
        blackCardArea.style.display = "flex";
    }

    if (blackCard == null){
        addBlackCard(cardText);
    } else {
        cardSpan.innerHTML = cardText;
    }
    
};

function changePrompt(promptText) {
    var promptArea = document.getElementsByClassName("prompt")[0];
    promptArea.innerHTML = promptText;
    if (promptArea.style.display == "none"){showPromptArea()};
};

function clearWhiteCards() {
    var cardArea = (document.getElementsByClassName("card-area"))[1];
    cardArea.innerHTML = null;
    // hideWhiteCardArea();
};