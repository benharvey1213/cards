const sock = io();

var nickName;
var numToSubmit = 0;
var myID;
var myRoom;
var numCards;

var hexCodes = ['#FF0000', '#008000', '#FF00FF', '#00FFFF', '#0000FF', '#800080', '#FFFF00', '#00FF00', '#800000', '#FFA500', '#000000', '#008080'];
var myColor = null;

// server listeners
sock.on('addCard', function(cText){addCard(cText)})
sock.on('addDiscardCard', function(text){addDiscardCard(text)})
sock.on('addPromptCard', function(){addPromptCard()})
sock.on('addDrawCard', function(){addDrawCard()})
sock.on('addStartCard', function(text){addStartCard(text)})
sock.on('addNextRoundCard', function(text){addNextRoundCard(text)})
sock.on('addRestartCard', function(text){addRestartCard(text)})
sock.on('addJudgeCard', function(text){addJudgeCard(text)})
sock.on('addJudgeNextCard', function(text){addJudgeNextCard(text)})
sock.on('setPrompt', function(mText){setPrompt(mText)})
sock.on('setPromptError', function(mText){setPromptError(mText)})
sock.on('clearCards', function(){clearCards()})
sock.on('newTurn', function(num){numToSubmit += num})
sock.on('getMyID', function(id){myID = id; myColor = hexCodes[Math.floor(Math.random() * hexCodes.length)]})
sock.on('joinedRoom', function(room){myRoom = room});
sock.on('topOffCards', function(numMax){sock.emit('topMyCards', numCards, numMax)})
sock.on('hideCardArea', function(){hideCardArea()})
sock.on('showCardArea', function(){showCardArea()})

window.onload = function() {
    // document.body.requestFullscreen();
}

window.onresize = function(event) {
    
    // dynamic sizing
    var canvas = document.getElementsByClassName("draw")[0];
    var textSpan = document.getElementsByClassName("cardSpan")[0];

    var parentSize = textSpan.getBoundingClientRect();

    canvas.width = parentSize.width;
    canvas.height = parentSize.width;  
    


}

function removeCard(cardText){
    // remove card on client side
    var cardArea = document.getElementsByClassName("card-area");
    var cards = cardArea[0].getElementsByClassName("card");

    for (var i = 0; i < cards.length; i++) {
        var curCard = cards[i];
        var curCardDiv = (curCard.getElementsByTagName("span"))[0];
        if (curCardDiv.innerHTML == cardText){
            curCard.remove();
            numCards--;
            break;
        }
    }
}

function discardCard(cardText){
    sock.emit('discardCard', cardText);
    removeCard(cardText);
    clearCards();
}

function addDrawCard() {
    showCardArea();
    numCards++;

    const cardArea = document.querySelector(".card-area");

    var newButton = document.createElement("button");
    newButton.className = "card static";

    var newTextSpan = document.createElement("span");
    newTextSpan.className = "cardSpan";

    var newCanvas = document.createElement("canvas");
    newCanvas.className = "draw";
    newCanvas.style.border = "5px solid #f0f0f0";
    
    newTextSpan.appendChild(newCanvas);
    newButton.appendChild(newTextSpan);
    
    cardArea.appendChild(newButton);

    // dynamic sizing
    newCanvas.style.width = newTextSpan.width - 10;
    newCanvas.style.height = newTextSpan.width - 10;

    // var parentSize = newTextSpan.getBoundingClientRect();

    newCanvas.width = newTextSpan.offsetWidth - 10;
    newCanvas.height = newTextSpan.offsetWidth - 10;

    newButton.style.width = "90%";
    console.log(newButton.offsetWidth);
    newButton.style.height = parseInt(newButton.offsetWidth) + "px";

    context = newCanvas.getContext("2d");

    // event handlers for drawing on the canvas
    newCanvas.addEventListener('mousedown', function(e){startPosition(e);})
    newCanvas.addEventListener('touchstart', function(e){startPosition(e);})

    newCanvas.addEventListener('mouseup', function(){finishPosition();})
    newCanvas.addEventListener('touchend', function(){finishPosition();})

    newCanvas.addEventListener('mousemove', function(e){draw(e);})
    newCanvas.addEventListener('touchmove', function(e){draw(e); e.preventDefault(); passive:false})  
};

var drawing = false;

function startPosition(e){
    drawing = true;
    draw(e);

    // emit starting?

}

function finishPosition(){
    drawing = false;
    context.beginPath();

    // emit ending?
    sock.emit('cutDrawing');
}

function draw (e){
    if (!drawing) return;

    var canvas = document.querySelector(".draw");
    var rect = canvas.getBoundingClientRect();
    context = canvas.getContext("2d");
    var thisX = e.clientX;
    var thisY = e.clientY;
    var thisXPercent = e.clientX / rect.width;
    var thisYPercent = e.clientY / rect.height;

    console.log(thisXPercent, thisYPercent);

    context.lineWidth = 10;
    context.lineCap = "round";

    // assign color from list
    context.strokeStyle = myColor;
    //context.strokeStyle = hexCodes[Math.floor(Math.random() * hexCodes.length)];
    
    context.lineTo(thisX - rect.left, thisY - rect.top);
    context.stroke();
    context.beginPath();
    context.moveTo(thisX - rect.left, thisY - rect.top);

    // send info to server, probably will have to convert
    // coordinates to percent of canvas so I can scale it
    var coordinates = {
        x: thisXPercent,
        y: thisYPercent
    }

    sock.emit('sendDrawing', coordinates, context.strokeStyle);
}

function hideCardArea() {
    var cardArea = document.getElementsByClassName("card-area")[0];
    cardArea.style.display = "none";
}

function showCardArea() {
    var cardArea = document.getElementsByClassName("card-area")[0];
    cardArea.style.display = "flex";
}

function setPrompt(messageText) {
    const promptArea = document.querySelector(".client-prompt");
    promptArea.innerHTML = messageText;
};

function setPromptError(messageText) {
    setPrompt(messageText);
    var idField = document.getElementById("roomID");
    idField.value = "";
};

function submitCard(cardText) {
    if (numToSubmit == 0){return;}
    numToSubmit--;
    
    // to server (-> screen)
    sock.emit('submitCard', cardText);

    removeCard(cardText);

    // update this to not be hard-coded
    // if (cardText != 'Click me when everyone is in!'){
        // setPrompt("Wait for everyone to submit their cards");
    // }
};

function submitPromptCard(name, room){sock.emit('submitPromptCard', name, room);};
function submitStartCard(){sock.emit('submitStartCard');}
function submitNextRoundCard(){sock.emit('submitNextRoundCard');}
function submitRestartCard(){sock.emit('submitRestartCard');}
function submitJudgeCard(text){sock.emit('submitJudgeCard', text);}
function submitJudgeNextCard(){sock.emit('submitJudgeNextCard');}

function clearCards(){
    hideCardArea();
    var cardArea = document.getElementsByClassName("card-area");
    cardArea[0].innerHTML = null;
    numCards = 0;
};

// builds a card object with text and adds it to the page
function addCard(cardText) {
    showCardArea();
    numCards++;

    const cardArea = document.querySelector(".card-area");

    var newButton = document.createElement("button");
    var newTextSpan = document.createElement("span");
    var newContent = document.createTextNode(cardText);

    newTextSpan.appendChild(newContent);
    newButton.appendChild(newTextSpan);
    newButton.className = "card";

    newButton.onclick = function(){submitCard(cardText)};

    cardArea.appendChild(newButton);
};

// builds a card object with text and adds it to the page
function addDiscardCard(cardText) {
    showCardArea();
    numCards++;

    const cardArea = document.querySelector(".card-area");

    var newButton = document.createElement("button");
    var newTextSpan = document.createElement("span");
    var newContent = document.createTextNode(cardText);

    newTextSpan.appendChild(newContent);
    newButton.appendChild(newTextSpan);
    newButton.className = "card";

    newButton.onclick = function(){discardCard(cardText)};

    cardArea.appendChild(newButton);
};

function addJudgeCard(cardText) {
    showCardArea();
    numCards++;
    // console.log(numCards + ' cards');
    //convert cardText apostrephies to HTML Entities?
    // &#39 is a single quote

    const cardArea = document.querySelector(".card-area");

    var newButton = document.createElement("button");
    var newTextSpan = document.createElement("span");
    var newContent = document.createTextNode(cardText);

    newTextSpan.appendChild(newContent);
    newButton.appendChild(newTextSpan);
    newButton.className = "card";

    newButton.onclick = function(){submitJudgeCard(cardText)};

    cardArea.appendChild(newButton);
};

function addJudgeNextCard(text) {
    showCardArea();
    numCards++;

    const cardArea = document.querySelector(".card-area");

    var newButton = document.createElement("button");
    var newTextSpan = document.createElement("span");

    var newContent = document.createTextNode(text);

    newTextSpan.appendChild(newContent);
    newButton.appendChild(newTextSpan);
    newButton.className = "card";

    newButton.onclick = function(){submitJudgeNextCard()};

    cardArea.appendChild(newButton);
};

function addRestartCard(cardText) {
    showCardArea();
    numCards++;
    // console.log(numCards + ' cards');
    //convert cardText apostrephies to HTML Entities?
    // &#39 is a single quote

    const cardArea = document.querySelector(".card-area");

    var newButton = document.createElement("button");
    var newTextSpan = document.createElement("span");
    var newContent = document.createTextNode(cardText);
    // Click me when everyone's in!

    newTextSpan.appendChild(newContent);
    newButton.appendChild(newTextSpan);
    newButton.className = "card";

    newButton.onclick = function(){submitRestartCard()};

    cardArea.appendChild(newButton);
};

function addStartCard(cardText) {
    showCardArea();
    numCards++;
    // console.log(numCards + ' cards');
    //convert cardText apostrephies to HTML Entities?
    // &#39 is a single quote

    const cardArea = document.querySelector(".card-area");

    var newButton = document.createElement("button");
    var newTextSpan = document.createElement("span");
    var newContent = document.createTextNode(cardText);
    // Click me when everyone's in!

    newTextSpan.appendChild(newContent);
    newButton.appendChild(newTextSpan);
    newButton.className = "card";

    newButton.onclick = function(){submitStartCard()};

    cardArea.appendChild(newButton);
};

function addNextRoundCard(cardText) {
    showCardArea();
    numCards++;
    // console.log(numCards + ' cards');
    //convert cardText apostrephies to HTML Entities?
    // &#39 is a single quote

    const cardArea = document.querySelector(".card-area");

    var newButton = document.createElement("button");
    var newTextSpan = document.createElement("span");
    var newContent = document.createTextNode(cardText);
    // Click me when everyone's in!

    newTextSpan.appendChild(newContent);
    newButton.appendChild(newTextSpan);
    newButton.className = "card";

    newButton.onclick = function(){submitNextRoundCard()};

    cardArea.appendChild(newButton);
};

// builds a prompt card object
function addPromptCard() {
    showCardArea();
    const cardArea = document.querySelector(".card-area");

    // var newForm = document.createElement("form");

    var newButton = document.createElement("button");
    newButton.className = "prompt card";
    newButton.id = "prompt-card";

    var newTextSpan = document.createElement("span");

    var nickDiv = document.createElement("div");
    nickDiv.className = "promptText";
    var nickText = document.createTextNode("Nickname:");
    nickDiv.innerHTML = nickText.textContent;

    var nickInput = document.createElement("input");
    nickInput.type = "text";
    nickInput.className = "cardInput";
    nickInput.id = "nickname";
    nickInput.spellcheck = false;
    nickInput.autocomplete = "off";
    nickInput.autocorrect = "off";
    nickInput.addEventListener("keyup", function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            document.getElementById("submit").click();
        }
    });

    var roomDiv = document.createElement("div");
    roomDiv.className = "promptText";
    var roomText = document.createTextNode("Room ID:");
    roomDiv.innerHTML = roomText.textContent;

    var roomInput = document.createElement("input");
    roomInput.type = "text";
    roomInput.className = "cardInput";
    roomInput.id = "roomID";
    roomInput.spellcheck = false;
    roomInput.autocomplete = "off";
    roomInput.autocorrect = "off";
    roomInput.maxLength = "4";
    roomInput.addEventListener("keyup", function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            document.getElementById("submit").click();
        }
    });

    var submitButton = document.createElement("button");
    submitButton.id = "submit";
    submitButton.style.cursor = "pointer";
    // submitButton.type = "submit";
    // submitButton.formAction = alert('test');
    submitButton.innerHTML = "Join";

    submitButton.onclick = function() {
        var nameContents = document.getElementById("nickname").value;
        var roomContents = document.getElementById("roomID").value;
        if (nameContents != null) {
            submitPromptCard(nameContents, roomContents);
            nickName = nameContents;
        }
    };

    newTextSpan.appendChild(nickDiv);
    newTextSpan.appendChild(nickInput);
    newTextSpan.appendChild(roomDiv);
    newTextSpan.appendChild(roomInput);
    newTextSpan.appendChild(submitButton);

    newButton.appendChild(newTextSpan);
    
    // newForm.appendChild(newButton);

    cardArea.appendChild(newButton);
};