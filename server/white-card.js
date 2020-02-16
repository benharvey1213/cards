class WhiteCard {
    constructor(text, player){
        this._text = text;
        this._player = player;
    }
    get text(){return this._text;}
    set text(t){this._text = t;}
    get player(){return this._player;}
    set player(p){this._player = p;}
    toString(){
        return 'Text: ' + this._text + ', Player ID: ' + this._player.socket.id;
    }
}

module.exports = WhiteCard;