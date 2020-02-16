class Player {
    constructor(socket, name, room) {
        this._name = name;
        this._socket = socket;
        this._room = room;
        this._hand = [];    // array of strings (card text)
        this._winningCardPairs = [];
        this._isJudge = false;
    }
    get name(){return this._name;}
    set name(n){this._name = n;}

    get socket(){return this._socket;}
    set socket(s){this._socket = s;}

    get room(){return this._room;}
    set room(r){this._room = r;}

    get hand(){return this._hand;}
    set hand(h){this._hand = h;}
    addToHand(h){this._hand.push(h);}
    resetHand(){this._hand = [];}
    removeFromHand(h){
        this._hand.forEach(cardText => {
            if (h == cardText){
                this._hand.splice(this._hand.indexOf(cardText), 1);
            }
        });
    }

    get winningCardPairs(){return this._winningCardPairs;}
    addCardPair(pair){
        this._winningCardPairs.push(pair);
    }

    get isJudge(){return this._isJudge;}
    set isJudge(b){this._isJudge = b;}

    toString(){
        var returnString = "";
        returnString += 'Socket ID: ' + this._socket.id + ', Name: ' + this._name +
        ", Room: " + this._room + ", Current Hand: ";

        /*
        this._hand.forEach(card => {
            
        });
        */

        returnString += ", Winning Card Pairs: " + this._winningCardPairs.toString();

        return returnString;
    }
}

module.exports = Player;