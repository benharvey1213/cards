class Room {
    constructor(roomID, screenSocket) {
        this._roomID = roomID;
        this._screenSocket = screenSocket;

        this._clients = [];
        this._numCardsSubmitted = 0;
        this._whiteCards = [];
        this._judge = null;
        this._judgeIndex = -1;
        this._curBlackCard = null;
        this._champion = null;
        this._curCardJudgingIndex = 0;
        this._currentlyJudging = false;
        this._judgeMode = false;
        this._familyMode = false;
        this._cardGen = null;
    }

    get currentlyJudging(){return this._currentlyJudging}
    set currentlyJudging(c){this._currentlyJudging = c}

    get cardGen(){return this._cardGen;}
    set cardGen(c){this._cardGen = c;}

    get roomID(){return this._roomID;}
    set roomID(rID){this._roomID = rID;}

    get screenSocket(){return this._screenSocket;}
    set screenSocket(s){this._screenSocket = s;}

    shufflePlayers(){
        var returnPlayerList = [];

        for (var i = 0; i < this._clients.length; i++){
            var randIndex;
            do {
                randIndex = Math.floor(Math.random() * (this._clients.length));
            } while (returnPlayerList.includes(this._clients[randIndex]));

            returnPlayerList.push(this._clients[randIndex]);
        }

        this._clients = [];
        returnPlayerList.forEach(player => {
            this._clients.push(player);
        });
    }

    get judgeMode(){return this._judgeMode;}
    set judgeMode(b){this._judgeMode = b;}

    get familyMode(){return this._familyMode;}
    set familyMode(b){this._familyMode = b;}

    get numCardsSubmitted(){return this._numCardsSubmitted;}
    set numCardsSubmitted(n){this._numCardsSubmitted = n;}
    resetNumCardsSubmitted(){this._numCardsSubmitted = 0;}

    // can this just be ++?
    addNumCardsSubmitted(){this._numCardsSubmitted = this._numCardsSubmitted + 1;}

    get clients(){return this._clients;}
    set clients(c){this._clients = c;}
    addClient(s){this._clients.push(s);}

    get whiteCards(){return this._whiteCards;}
    set whiteCards(w){this._whiteCards = w;}
    addWhiteCard(w){this._whiteCards.push(w);}
    resetWhiteCards(){this._whiteCards = [];}

    get judge(){return this._judge;}
    set judge(j){this._judge = j;}

    nextJudge(){
        this._judgeIndex = (this._judgeIndex + 1) % this._clients.length;
        this._judge = this._clients[this._judgeIndex];
        return this._judge;
    }

    get curBlackCard(){return this._curBlackCard;}
    set curBlackCard(c){this._curBlackCard = c;}

    get champion(){return this._champion;}
    set champion(s){this._champion = s;}
    
    get curCardJudgingIndex(){return this._curCardJudgingIndex}
    set curCardJudgingIndex(c){this._curCardJudgingIndex = c}
    incrementCurCardJudgingIndex(){this._curCardJudgingIndex = this._curCardJudgingIndex + 1}

    removeClient(socket){
        // FIX THIS
        this._clients.forEach(c => {
            if (c.id == socket.id){
                this._clients.splice(this._clients.indexOf(c), 1);
            }
        });
    }

    toString(){
        var string = '\nRoom ID: ' + this._roomID + ', Screen ID: ' + this._screenSocket.id + ', Clients:\n';
        this._clients.forEach(c => {
            string += "-" + c.toString() + "\n";
        });
        return string;
    }
}

module.exports = Room;