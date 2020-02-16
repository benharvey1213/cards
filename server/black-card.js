class BlackCard {
    constructor(text, whiteCardsNeeded){
        this._text = text;
        this._whiteCardsNeeded = whiteCardsNeeded; 
    }
    get text(){return this._text;}
    set text(t){this._text = t;}
    get whiteCardsNeeded(){return this._whiteCardsNeeded;}
    set whiteCardsNeeded(w){this._whiteCardsNeeded = w;}
    toString() {
        return 'Text: ' + this._text + ', White Cards Needed: ' + this._whiteCardsNeeded;
    }
}
module.exports = BlackCard;