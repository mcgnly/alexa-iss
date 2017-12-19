'use strict';
var Alexa = require('alexa-sdk'),
    https = require('https');
var APP_ID = "";  // TODO replace with your app ID (OPTIONAL).

var languageStrings = {
    "en-US": {
        "translation": {
            "SKILL_NAME" : "Space Station Finder",
            "GET_FACT_MESSAGE" : "The international Space station is currently over: ",
            "HELP_MESSAGE" : "You can say where is the space station, or, you can say exit... What can I help you with?",
            "HELP_REPROMPT" : "What can I help you with?",
            "STOP_MESSAGE" : "Goodbye!",
            "NO_LOCATION" : "a spot in the ocean without an address"
        },
    "de-DE": {
        "translation": {
            "SKILL_NAME" : "Space Station Finder",
            "GET_FACT_MESSAGE" : "Die internationale Weltraumstation ist gerade über: ",
            "HELP_MESSAGE" : "Du kannst fragen wo ist die Weltraumstation, oder, du kannst sagen Exit... was kann ich für dich tun?",
            "HELP_REPROMPT" : "was kann ich für dich tun?",
            "STOP_MESSAGE" : "Tschuss!",
            "NO_LOCATION" : "über der Ozean, ohne Addresse"
        }
}};

var globalContext;

exports.handler = function(event, context, callback) {
    globalContext = context;
    var alexa = Alexa.handler(event, context);//Alexa comes from the sdk
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.emit('locateIss');
    },
    'GetLocationIntent': function () {
        this.emit('locateIss');
    },
    'locateIss': function() {


        var getUrl= function(){
            return "https://api.wheretheiss.at/v1/satellites/25544";
            // 40.714224,-73.961452&key=
            // 16.806297,149.477956
            // return 'https://maps.googleapis.com/maps/api/geocode/json?latlng=40.714224,-73.961452&key=AIzaSyBHijbVuHaoz5QMqWtw5JS_iIzHOamNyeg';
        };
        var getCatFacts = function(callback){
            console.log("-----------------");
            https.get(getUrl(), function(res){
                var body = '';
                res.on('data', function(data){
                    body += data;
                });

                res.on('end', function(){
                    var result = JSON.parse(body);
                    let latLong = result.latitude.toString() + ',' + result.longitude.toString();
                    callback(latLong);
                });

            }).on('error', function(e){
                console.log('Error: ' + e);
            });
        };

        function getLocation(latLong, cb){
            var url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latLong + '&key=AIzaSyBHijbVuHaoz5QMqWtw5JS_iIzHOamNyeg';
            https.get(url, function(res){
                var body = '';
                res.on('data', function(data){
                    body += data;
                });

                res.on('end', function(){
                    var result = JSON.parse(body);
                    if (result.results.length === 0 ) {
                        var location = this.t("NO_LOCATION");
                    } else { 
                        var location = result.results[0].formatted_address;
                    }
                    
                    cb(location);
                    globalContext.succeed();
                });

            }).on('error', function(e){
                console.log('Error: ' + e);
                globalContext.done(null, 'FAILURE');
            });
        }

        var self = this;
        
        getCatFacts(function(data){
            getLocation(data, function(res){
                self.emit(':tell', this.t("GET_FACT_MESSAGE") + res);
            });
        })
        


    },
    'AMAZON.HelpIntent': function () {
        var speechOutput = this.t("HELP_MESSAGE");
        var reprompt = this.t("HELP_MESSAGE");
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t("STOP_MESSAGE"));
        // this.emit(':tell', "Goodbye.");
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t("STOP_MESSAGE"));
    },
    'Unhandled': function() {
        this.emit(':ask', this.t("HELP_REPROMPT"), this.t("HELP_MESSAGE"));
    }

};
