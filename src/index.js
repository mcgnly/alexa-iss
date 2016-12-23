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
            "STOP_MESSAGE" : "Goodbye!"
        }
}};

exports.handler = function(event, context, callback) {
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
                    // console.log("data has ended, so result is: ", latLong);
                    callback(latLong);
                });

            }).on('error', function(e){
                console.log('Error: ' + e);
            });
        };

        function getLocation(latLong, cb){
        //     var url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latLong;
            var url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latLong + '&key=AIzaSyBHijbVuHaoz5QMqWtw5JS_iIzHOamNyeg';
        //     console.log('url is ', url);
            https.get(url, function(res){
                var body = '';
                res.on('data', function(data){
                    body += data;
                });

                res.on('end', function(){
                    var result = JSON.parse(body);
                    if (result.results.length === 0 ) {
                        var location = 'somewhere over the ocean';
                    } else { 
                        var location = result.results[0].formatted_address;
                    }
                    
                    console.log("data has ended, so result is: ", location);
                    cb(location);
                });

            }).on('error', function(e){
                console.log('Error: ' + e);
            });
        }




        

    // 'LocateISS': function () {
    //     var getUrl= function(){
    //         return "http://api.wheretheiss.at/v1/satellites/25544";
    //     };
    //     var getLocation = function(){
    //       http.get(getUrl(), function(res){
    //         var body = '';

    //         res.on('data', function(data){
    //           body += data;
    //         });

    //         res.on('end', function(){
    //           var result = JSON.parse(body);
    //           var text = result.facts[0];
    //           console.log('the space station is at: ', text);
    //           return text;
    //         });

    //       }).on('error', function(e){
    //       });
    //     };



        this.emit(':tell', 
            getCatFacts(function(data){
                getLocation(data, function(res){
                    console.log("inside the second fn call. Location is: ", res);
                    return res;
                });
            })
        );


    },
    'AMAZON.HelpIntent': function () {
        var speechOutput = this.t("HELP_MESSAGE");
        var reprompt = this.t("HELP_MESSAGE");
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        // this.emit(':tell', this.t("STOP_MESSAGE"));
        this.emit(':tell', "Goodbye.");
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', "Goodbye.");
    },
    'Unhandled': function() {
        this.emit(':ask', 'Sorry, I didn\'t get that.', 'Try asking for a fact.');
    }

};
