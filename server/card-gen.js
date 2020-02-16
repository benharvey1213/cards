const BlackCard = require("./black-card");
var fs = require('fs');

// bring text file contents into memory
var vowUseA = fs.readFileSync("./word-gen/vowels-use-a.txt").toString().split("\n");
var nouns = fs.readFileSync("./word-gen/singular-nouns.txt").toString().split("\n");
var adjectives = fs.readFileSync("./word-gen/adjectives.txt").toString().split("\n");
var people = fs.readFileSync("./word-gen/people.txt").toString().split("\n");
var places = fs.readFileSync("./word-gen/places.txt").toString().split("\n");
var events = fs.readFileSync("./word-gen/events.txt").toString().split("\n");
var pastEvents = fs.readFileSync("./word-gen/past-events.txt").toString().split("\n");
var quantities = fs.readFileSync("./word-gen/quantities.txt").toString().split("\n");
var pluralNouns = fs.readFileSync("./word-gen/plural-nouns.txt").toString().split("\n");
var gerunds = fs.readFileSync("./word-gen/gerunds.txt").toString().split("\n");
var requests = fs.readFileSync("./word-gen/requests.txt").toString().split("\n");
var abstractNouns = fs.readFileSync("./word-gen/abstract-nouns.txt").toString().split("\n");
var peoplePlural = fs.readFileSync("./word-gen/people-plural.txt").toString().split("\n");
var emotions = fs.readFileSync("./word-gen/emotions-er.txt").toString().split("\n");
var foodSingular = fs.readFileSync("./word-gen/food-singular.txt").toString().split("\n");
var foodPlural = fs.readFileSync("./word-gen/food-plural.txt").toString().split("\n");
var possessivePronouns = fs.readFileSync("./word-gen/possessive-pronouns.txt").toString().split("\n");

var vowels = ['a', 'e', 'i', 'o', 'u'];

var whiteCardPhraseList = [];
var whiteCardPhraseListWeights = [];
var whiteCardWeightedPhraseList = [];
var blackCardPhraseList = [];
var blackCardPhraseListWeights = [];
var blackCardWeightedPhraseList = [];

var numTotalWhite = 36;
var numTotalBlack = 41;

var numGoodWhite = 13;
var numGoodBlack = 27;

class CardGen {
    constructor(fMode){
        // testing
        // fMode = true;

        // make weighted lists of white cards
        for (var i = 0; i < numTotalWhite; i++){
            whiteCardPhraseList.push(i + 1);
        }

        // initialize white card generation
        if (fMode){
            // there should be a one for each "good" white card phrase generator
            // whiteCardPhraseListWeights = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
            for (var i = 0; i < numGoodWhite; i++){
                whiteCardPhraseListWeights.push(1);
            }
        } else {
            // fill the array with 1s
            // this may be adjusted later
            whiteCardPhraseList.forEach(type => {
                whiteCardPhraseListWeights.push(1);
            });
        }

        // generate the weighted list
        for (var i = 0; i < whiteCardPhraseList.length; i++){
            var multiples = whiteCardPhraseListWeights[i] * 100;
            for (var j = 0; j < multiples; j++){
                whiteCardWeightedPhraseList.push(whiteCardPhraseList[i]);
            }
        }

        // matches with each case
        for (var i = 0; i < numTotalBlack; i++){
            blackCardPhraseList.push(i + 1);
        }

        if (fMode){
            for (var i = 0; i < numGoodBlack; i++){
                blackCardPhraseListWeights.push(1);
            }
        } else {
            // fill the array with 1s
            // this may be adjusted later
            blackCardPhraseList.forEach(type => {
                blackCardPhraseListWeights.push(1);
            });
        }

        // populate weighted black card list
        for (var i = 0; i < blackCardPhraseList.length; i++){
            var multiples = blackCardPhraseListWeights[i] * 100;
            for (var j = 0; j < multiples; j++){
                blackCardWeightedPhraseList.push(blackCardPhraseList[i]);
            }
        }
    }

    genWhiteCard() {
        var cardText = '';
        var phrase = [];

        var phraseType = whiteCardWeightedPhraseList[this.genRandNum(whiteCardWeightedPhraseList.length)];
        // phraseType = 14;

        switch(phraseType){
            // good
            case 1: {
                phrase.push(this.genRand(people) + "'s");
                phrase.push(this.genRand(adjectives));
                phrase.push(this.genRand(nouns));
                break;
            }
            // good
            case 2: {
                var randAdj = this.genRand(adjectives);
                phrase.push(this.determineAAn(randAdj));
                phrase.push(randAdj, this.genRand(nouns));
                break;
            }
            // good
            case 3: {
                var adj = this.genRand(adjectives);
                phrase.push(this.determineAAn(adj));
                phrase.push(adj);
                phrase.push(this.genRand(nouns));
                phrase.push(this.genRand(nouns));
                break;
            }
            // good
            case 4: {
                phrase.push(this.genRand(adjectives));
                phrase.push(this.genRand(pluralNouns));
                break;
            }
            // good
            case 5: {
                phrase.push(this.genRand(quantities));
                phrase.push(this.genRand(pluralNouns));
                break;
            }
            // good
            case 6: {
                phrase.push(this.genRand(people));
                break;
            }
            // good
            case 7: {
                phrase.push(this.genRand(people) + "\'s");
                phrase.push(this.genRand(nouns));
                break;
            }
            // good
            case 8: {
                phrase.push(this.genRand(pluralNouns));
                break;
            }
            // good
            case 9: {
                phrase.push(this.genRand(gerunds));
                phrase.push(this.genRand(people));
                phrase.push('with');
                var item = this.genRand(nouns);
                phrase.push(this.determineAAn(item));
                phrase.push(item);
                break;
            }
            // good
            case 10: {
                phrase.push(this.genRand(nouns));
                phrase.push(this.genRand(pluralNouns));
                break;
            }
            // good
            case 11: {
                phrase.push(this.genRand(abstractNouns));
                break;
            }
            // good
            case 12: {
                phrase.push(this.genRand(peoplePlural));
                break;
            }
            // good
            case 13: {
                phrase.push(this.genRand(adjectives));
                phrase.push(this.genRand(peoplePlural));
                break;
            }

            default: { 
                phrase.push('ERROR');
                break;
            }
        }

        // put together phrase
        for (var i = 0; i < phrase.length; i++){
            if (i < phrase.length - 1){
                cardText += (phrase[i] + " "); 
            } else {
                cardText += phrase[i];
            }
        }
        cardText += '.';

        // capitalize first letter
        cardText = cardText.charAt(0).toUpperCase() + cardText.slice(1);

        return cardText;  
    }

    genBlackCard() {
        var numCardsNeeded = 1;
        var blank = '____________';
        var cardText = '';
        var phraseType = blackCardWeightedPhraseList[this.genRandNum(blackCardWeightedPhraseList.length)];

        // this allows testing of a specific phrase type
        // phraseType = 29;

        var phrase = [];

        switch (phraseType){
            // good
            case 1: {
                phrase.push('something that makes');
                phrase.push(this.genRand(events));
                phrase.push('more');
                phrase.push(this.genRand(adjectives));
                phrase.push('is');
                phrase.push(blank);
                break;
            }
            // good
            case 2: {
                phrase.push(this.genRand(events));
                phrase.push('would be better with');
                phrase.push(blank);
                break;
            }
            // good
            case 3: {
                phrase.push(this.genRand(pastEvents));
                phrase.push('would have been better with');
                phrase.push(blank);
                break;
            }
            // good
            case 4: {
                phrase.push('the thing that ruined');
                phrase.push(this.genRand(pastEvents));
                phrase.push('was');
                phrase.push(blank);
                break;
            }
            // good
            case 5: {
                phrase.push('what is');
                phrase.push(this.genRand(people) + '\'s');
                phrase.push('guilty pleasure?');
                break;
            }
            
            // good
            case 6: {
                phrase.push(this.genRand(peoplePlural));
                phrase.push('like');
                phrase.push(blank);
                break;
            }
            // good
            case 7: {
                phrase.push('what\'s there a ton of in');
                var place = this.genRand(places);
                phrase.push(this.determineAAn(place));
                phrase.push(place + '?');
                break;
            }
            // good
            case 8: {
                phrase.push('why does');
                phrase.push(this.genRand(people));
                phrase.push('feel');
                phrase.push(this.genRand(adjectives) + '?');
                break;
            }
            // good
            case 9: {
                phrase.push('why am I');
                phrase.push(this.genRand(adjectives) + '?');
                break;
            }
            
            // good
            case 10: {
                phrase.push('what helps');
                phrase.push(this.genRand(people));
                phrase.push('relax?');
                break;
            }
            // good
            case 11: {
                phrase.push('what is');
                phrase.push(this.genRand(people));
                phrase.push('hiding from me?');
                break;
            }
            // good
            case 12: {
                phrase.push('what are');
                phrase.push(this.genRand(peoplePlural));
                phrase.push('hiding from me?');
                break;
            }
            // good
            case 13: {
                phrase.push(this.genRand(peoplePlural));
                phrase.push('hate him. Why?');
                break;
            }
            // good
            case 14: {
                phrase.push('this simple trick will make');
                phrase.push(this.genRand(peoplePlural));
                phrase.push('hate you. What is it?');
                break;
            }
            // good
            case 15: {
                phrase.push('I hate');
                phrase.push(this.genRand(peoplePlural) + '.');
                phrase.push('Why?');
                break;
            }
            // good
            case 16: {
                phrase.push('why do I hate');
                phrase.push(this.genRand(people) + '?');
                break;
            }
            // good
            case 17: {
                phrase.push('why do I relate with');
                phrase.push(this.genRand(peoplePlural));
                phrase.push('so much?');
                break;
            }
            // good
            case 18: {
                phrase.push('all');
                phrase.push(this.genRand(peoplePlural));
                phrase.push('need');
                phrase.push(blank);
                phrase.push('to survive');
                break;
            }
            // good
            case 19: {
                phrase.push('nothing makes');
                phrase.push(this.genRand(peoplePlural));
                phrase.push(this.genRand(emotions));
                phrase.push('than');
                phrase.push(blank);
                break;
            }
            // good
            case 20: {
                var food = this.genRand(foodSingular).trim();
                phrase.push(food);
                phrase.push('pairs');
                phrase.push('well with');
                phrase.push(blank);
                break;
            }
            // good
            case 21: {
                var food = this.genRand(foodPlural).trim();
                phrase.push(food);
                phrase.push('pair');
                phrase.push('well with');
                phrase.push(blank);
                break;
            }
            // good
            case 22: {
                phrase.push('nothing makes me');
                phrase.push(this.genRand(emotions));
                phrase.push('than');
                phrase.push(blank);
                break;
            }
            // good
            case 23: {
                phrase.push('what doesn\'t');
                phrase.push(this.genRand(people));
                phrase.push('understand?');
                break;
            }
            // good
            case 24: {
                phrase.push('what is');
                phrase.push(this.genRand(people));
                phrase.push('thinking about right now?');
                break;
            }
            // good
            case 25: {
                phrase.push('what did');
                phrase.push(this.genRand(people));
                phrase.push('eat for dinner?');
                break;
            }
            // good
            case 26: {
                phrase.push(this.genRand(people) + '\'s');
                phrase.push('next hit single just dropped. It\'s titled:');
                phrase.push(blank);
                break;
            }
            // good
            case 27: {
                phrase.push('what makes');
                phrase.push(this.genRand(people));
                phrase.push('so');
                phrase.push(this.genRand(adjectives) + '?');
                break;
            }
            default: {
                phrase.push('ERROR');
                break;
            }
        }   

        // put together phrase
        for (var i = 0; i < phrase.length; i++){
            if (i < phrase.length - 1){
                cardText += (phrase[i] + " "); 
            } else {
                cardText += phrase[i];
            }
        }
        if (cardText.charAt(cardText.length - 1) != '?'){
            cardText += '.';
        }
        
        // capitalize first letter
        cardText = cardText.charAt(0).toUpperCase() + cardText.slice(1);

        var bCard = new BlackCard(cardText, numCardsNeeded);
        return bCard;
    }

    genRandNum(length) {
        return Math.floor(Math.random() * (length));
    }

    genRand(type){
        return type[this.genRandNum(type.length)];
    }

    determineAAn (nextWord){
        if (vowUseA.includes(nextWord.charAt(0))){
            return('a');
        } else if (vowels.includes(nextWord.charAt(0))){
            return('an');
        } else { return('a'); }
    }
}

module.exports = CardGen;