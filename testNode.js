'use strict';

var https = require('https');

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
            
            // console.log("data has ended, so result is: ", location);
            cb(location);
        });

    }).on('error', function(e){
        console.log('Error: ' + e);
    });
}




getCatFacts(function(data){
    // console.log("inside the main fn call itself. Lat/long is: ", data);
    getLocation(data, function(res){
        console.log("inside the second fn call. Location is: ", res);
    });

});
// this.emit(':tell', getCatFacts(function(data){
//               var text = data
//                           .facts;
//                       })
//                   );//"this" is not correct here, the scope is weird
