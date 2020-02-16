class CardPair {
    constructor(blackCard, whiteCard){
        this._blackCard = blackCard;
        this._whiteCard = whiteCard;
    }
    get blackCard(){
        return this._blackCard;
    }
    set blackCard(b){
        this._blackCard = b;
    }
    get whiteCard(){
        return this._whiteCard;
    }
    set whiteCard(s){
        this._whiteCard = s;
    }
    toString(){
        return '[Black Card: ' + this._blackCard + ", White Card: " + this._whiteCard + "]";
    }
}

module.exports = CardPair;