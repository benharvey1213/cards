const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const app = express();
const Room = require('./room.js');
const Player = require('./player.js');
const CardGen = require('./card-gen.js');
const WhiteCard = require('./white-card.js');
const CardPair = require("./card-pair");
const clientPath = `${__dirname}/../client`;
const server = http.createServer(app);
const io = socketio(server);
app.use(express.static(clientPath));

// stores all Room objects in use
var rooms = [];

io.on('connection', (sock) => {
    // initialize for each connection
    var thisRoom = null;
    var thisPlayer = null;

    // initialize for screen
    sock.emit('clearCards');
    sock.emit('getMyID', sock.id);

    // initialize for players
    sock.emit('setPrompt', 'Enter info, then click Join');
    
    // testing
    sock.emit('addPromptCard');
    // sock.emit('addDrawCard');

    // generates unique ID for each screen/room
    sock.on('requestRoomID', () => {
        var existingIDs = [];
        rooms.forEach(room => {
            existingIDs.push(room.roomID);
        })
        
        var newID = generateRoomID();
        while (existingIDs.includes(newID)){
            newID = generateRoomID();
        }

        sock.emit('returnRoomID', (newID));

        thisRoom = new Room(newID, sock);
        rooms.push(thisRoom);

        // testing
        // testCardGen = new CardGen(false);
        // for (var i = 0; i < 5; i++){
        //     sock.emit('displaySubmittedCard', testCardGen.genWhiteCard());
        // }

        var players = [];

        for (var i = 0; i < 5; i++){
            var player = {name:"Player " + i, score:i}
            players.push(player);
        }

        sock.emit('displayRankings', players);

    })

    // prompts for nickname and room ID
    sock.on('submitPromptCard', (name, roomID) => {
        // testing (auto join)
        if (name == "" && roomID == ""){
            name = "Player " + (sock.id).substring(0, 3);
            roomID = rooms[0].roomID;
        }

        // create a Player object
        thisPlayer = new Player(sock, name, null);
        
        // search for user-submitted room ID
        var roomExists = false;
        rooms.forEach(r => {
            if(r.roomID.toUpperCase() == roomID.toUpperCase()){
                // assigns the local reference
                thisRoom = r;
                thisRoom.addClient(thisPlayer);
                roomExists = true;
            }
        })

        if (!roomExists){
            sock.emit('setPromptError', 'Invalid Room ID, try again');
        } else {
            // the room exists
            thisPlayer.room = roomID.toUpperCase();        

            sock.emit('joinedRoom', roomID);
            sock.emit('clearCards');
            sock.emit('setPrompt', 'Joined Room ' + roomID.toUpperCase() + "!");

            // push card to client to prompt to start game if 2+ players
            if (thisRoom.clients.length == 2){
                thisRoom.clients.forEach(client => {
                    client.socket.emit('addStartCard', 'Click me when everyone\'s in!');
                });
            } else if (thisRoom.clients.length > 2){
                sock.emit('addStartCard', 'Click me when everyone\'s in!');
            }
            
            // testing
            // sock.emit('addDrawCard');

            // show user name on screen
            displayNameCard(name, thisRoom.screenSocket, sock.id);
        }
    })

    // deals out cards until client has the max number
    sock.on('topMyCards', (numCards, numMax) => {
        while (numCards < numMax){
            var card = thisRoom.cardGen.genWhiteCard();
            thisPlayer.addToHand(card);
            sock.emit('addCard', card);
            numCards++;
        }
    })
    
    // handles submitting cards in-game
    sock.on('submitCard', (cardText) => {
        var newWhiteCard = new WhiteCard(cardText, thisPlayer)

        thisRoom.addWhiteCard(newWhiteCard);
        thisPlayer.removeFromHand(cardText);
        displayCard(cardText, thisRoom.screenSocket);
        
        sock.emit('clearCards');

        sock.emit('setPrompt', 'Pick a card to discard')
        thisPlayer.hand.forEach(card => {
            sock.emit('addDiscardCard', card);
        });
        
        // waits until all cards submitted, then starts judging
        thisRoom.addNumCardsSubmitted();
        if (thisRoom.numCardsSubmitted == thisRoom.clients.length - 1){
            judgeTurn(thisRoom);
        }
    })

    sock.on('discardCard', (cardText) => {
        thisPlayer.removeFromHand(cardText);
        if (thisRoom.currentlyJudging){
            thisPlayer.socket.emit('setPrompt', 'Wait for the judge to pick the winning card');
        } else {
            thisPlayer.socket.emit('setPrompt', 'Wait until everyone has submitted their card')
        }
    })

    // handles submission of the game starting card
    sock.on('submitStartCard', () => {
        // prepare to start game
        thisRoom.screenSocket.emit('hidePrompt');
        thisRoom.screenSocket.emit('getSettings');
    })

    sock.on('submitRestartCard', () => {
        // reset this room variables
        thisRoom.numCardsSubmitted = 0;
        thisRoom.whiteCards = [];
        thisRoom.judge = null;
        thisRoom.judgeIndex = -1;
        thisRoom.curBlackCard = null;
        thisRoom.champion = null;
        thisRoom.curCardJudgingIndex = 0;

        thisRoom.clients.forEach(client => {
            client.isJudge = false;
            client.hand = [];
            client.winningCardPairs = [];
        })

        startRound(thisRoom);
    })
    
    sock.on('submitNextRoundCard', () => {
        startRound(thisRoom);
    })

    sock.on('setSettings', (j, f) => {
        thisRoom.judgeMode = j;
        thisRoom.familyMode = f;

        thisRoom.cardGen = new CardGen(f);

        thisRoom.shufflePlayers();
        startRound(thisRoom);
    })


    sock.on('submitJudgeNextCard', () => {
        thisRoom.judge.socket.emit('clearCards');
        // if the room curCardJudgingIndex is not = to room.whiteCards.length
        if (thisRoom.curCardJudgingIndex < thisRoom.whiteCards.length){

            // determine if this next card will be the last
            if ((thisRoom.curCardJudgingIndex + 1) == thisRoom.whiteCards.length){
                thisRoom.judge.socket.emit('addJudgeNextCard', 'Pick a winning card');
            } else {
                thisRoom.judge.socket.emit('addJudgeNextCard', 'View next card');
            }

            var curCard = thisRoom.whiteCards[thisRoom.curCardJudgingIndex];
            thisRoom.incrementCurCardJudgingIndex();
            thisRoom.screenSocket.emit('showModalCardPair', thisRoom.curBlackCard.text, curCard.text);
        } else {
            thisRoom.screenSocket.emit('hideModalCardPair');
            thisRoom.judge.socket.emit('clearCards');
            thisRoom.judge.socket.emit('setPrompt', 'Choose the winning card');

            thisRoom.whiteCards.forEach(card => {
                thisRoom.screenSocket.emit('displaySubmittedCard', card.text);
                thisRoom.judge.socket.emit('addJudgeCard', card.text);
            });


        }
    })

    sock.on('submitJudgeCard', (text) => {
        var winningPlayer = null;

        thisRoom.whiteCards.forEach(card => {
            if (card.text == text){
                card.player.socket.emit('setPrompt', 'You won this round! Congrats!');

                // add the black and white card pair to the winner Player
                var thisWhiteCard = new WhiteCard(card.text, card.player);
                var cardPair = new CardPair(thisRoom.curBlackCard, thisWhiteCard);

                card.player.addCardPair(cardPair);

                winningPlayer = card.player;

                thisRoom.screenSocket.emit('changePrompt', (winningPlayer.name + ' won the round!'));
            }
        })

        // clear cards and show only the winning one
        thisRoom.screenSocket.emit('clearCards');
        thisRoom.screenSocket.emit('displaySubmittedCard', text);

        // if the max number of card pairs has not yet been reached, do this
        if (winningPlayer.winningCardPairs.length < 2){
            // get the judge
            thisRoom.clients.forEach(player => {
                if (player.isJudge){
                    player.socket.emit('setPrompt', 'Thanks for picking a winner!');
                    player.socket.emit('clearCards');
                    player.isJudge = false;
                } else if (player.socket != winningPlayer.socket){
                    player.socket.emit('setPrompt', 'You didn\'t get chosen, better luck next time!');
                }
    
                // player.socket.emit('addStartCard', 'Click me to start the next turn!');
                player.socket.emit('addNextRoundCard', 'Click me to start the next turn!')
            });

        } else {
            // end the game
            thisRoom.clients.forEach(player => {
                player.socket.emit('clearCards');
                if (player != winningPlayer){
                    player.socket.emit('setPrompt', (winningPlayer.name + ' won the game!'));
                } else {
                    player.socket.emit('setPrompt', 'You won the game!');
                }

                player.socket.emit('addRestartCard', 'Play another round?');
            })

            // clear cards on screen
            thisRoom.screenSocket.emit('clearCards');
            thisRoom.screenSocket.emit('hideBlackCardArea');

            // show the winning cards
            winningPlayer.winningCardPairs.forEach(pair => {
                thisRoom.screenSocket.emit('displaySubmittedCard', ("*B*" + pair.blackCard.text));
                thisRoom.screenSocket.emit('displaySubmittedCard', pair.whiteCard.text);
            });

        }
    });

    sock.on('disconnect', function() {
        // remove room if socket was a screen client, or just remove client from room
        rooms.forEach(r => {
            if (r.screenSocket.id == sock.id){
                rooms.splice(rooms.indexOf(r), 1);
            } else if (r.clients.socket == sock){
                // console.log('removing ' + sock.id);
                r.removeClient(sock);
            }
        });
    });

    sock.on('sendDrawing', (coordinates, color) => {
        thisRoom.screenSocket.emit('screenDrawing', coordinates, sock.id, color);
    })

    sock.on('cutDrawing', () => {
        thisRoom.screenSocket.emit('cutScreenDrawing', sock.id);
    })

});

function startRound(room){
    // room.cardGen = new CardGen(room.familyMode);
    var numberOfStartingCards = 7;

    // resets room
    room.resetNumCardsSubmitted();
    room.resetWhiteCards();

    if (!room.judgeMode){
        room.curCardJudgingIndex = 0;
    }

    // pushes client Player objects into players array, clears their cards
    room.clients.forEach(c => {
        // c.isJudge = false;
        // c.winningCardPairs = [];
        // c.hand = [];
        c.socket.emit('clearCards');
    });

    // clears cards on screen (player names)
    room.screenSocket.emit('clearCards');
    room.screenSocket.emit('changePrompt', 'Pick a card on your device');

    // initializes current card pair for winning player to have,
    // shows the contents of the Black Card on the screen
    var blackCard = room.cardGen.genBlackCard();
    room.screenSocket.emit('changeCard', blackCard.text);
    room.curBlackCard = blackCard;

    // cycles through each player
    if (!room.judgeMode){
        var judge = room.nextJudge();
        judge.isJudge = true;
        judge.socket.emit('setPrompt', 'You\'re the judge!');
    }

    // initializes turn for non-judges
    room.clients.forEach(p => {
        if (!p.isJudge){
            // if we already have cards in our hand, show those first
            if (p.hand != null){
                p.hand.forEach(cardText => {
                    p.socket.emit('addCard', cardText);
                });
            }
            p.socket.emit('newTurn', blackCard.whiteCardsNeeded);
            p.socket.emit('topOffCards', numberOfStartingCards);
            p.socket.emit('setPrompt', 'Pick a card');
        }
    });
}

function judgeTurn(room){
    room.currentlyJudging = true;
    room.screenSocket.emit('clearCards');

    room.clients.forEach(c => {
        if (!c.isJudge){
            // c.socket.emit('clearCards');
            // c.socket.emit('setPrompt', 'Wait for the judge to pick the winning card');
        } else {
            c.socket.emit('addJudgeNextCard', 'View next card');
        }
    })

    var curCard = room.whiteCards[room.curCardJudgingIndex];
    room.incrementCurCardJudgingIndex();
    room.screenSocket.emit('showModalCardPair', room.curBlackCard.text, curCard.text);
}


server.on('error', (err) => {
    console.err('Server error: ', err);
});

server.listen(8080, () => {
    console.log('Card Game started on 8080');
});

function displayCard(cardText, screenSocket){
    screenSocket.emit('displayCard', cardText);
}

function displayNameCard(playerName, screenSocket, playerSocketID){
    screenSocket.emit('displayNameCard', playerName, playerSocketID);
}

var alpha = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 
'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', ];
var nums = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

function generateRoomID() {
    var ID = "";

    for (var i = 0; i < 4; i++) {
        if (i <= 1){
            ID += (alpha[Math.floor(Math.random() * alpha.length)]);
        } else {
            ID += (nums[Math.floor(Math.random() * nums.length)]);
        }
    }

    return ID;
}