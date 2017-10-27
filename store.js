var Promise = require('bluebird');
var http = require('http');
var https = require('https');
var util = require('util');
var _ = require('lodash');


 
module.exports = {
    searchHotels: function (destination, checkInDate, checkOutDate) {
        return new Promise(function (resolve) {

            // Filling the hotels results manually just for demo purposes
            var hotels = [];
            for (var i = 1; i <= 6; i++) {
                hotels.push({
                    name: 'Hotel ' + i,
                    location: destination,
                    rating: Math.ceil(Math.random() * 5),
                    numberOfReviews: Math.floor(Math.random() * 5000) + 1,
                    priceStarting: Math.floor(Math.random() * 450) + 80,
                    image: 'https://placeholdit.imgix.net/~text?txtsize=35&txt=Hotel+' + i + '&w=500&h=260',
                    moreImages: [
                        'https://placeholdit.imgix.net/~text?txtsize=65&txt=Pic+1&w=450&h=300',
                        'https://placeholdit.imgix.net/~text?txtsize=65&txt=Pic+2&w=450&h=300',
                        'https://placeholdit.imgix.net/~text?txtsize=65&txt=Pic+3&w=450&h=300',
                        'https://placeholdit.imgix.net/~text?txtsize=65&txt=Pic+4&w=450&h=300'
                    ]
                });
            }

            hotels.sort(function (a, b) { return a.priceStarting - b.priceStarting; });

            // complete promise with a timer to simulate async response
            setTimeout(function () { resolve(hotels); }, 1000);
        });
    },
    
    searchFlights: function (destination, Date, Origin) {
        
var headers = {
    'Content-Type': 'application/json'    
  };
var options = {
    host : 'apiu.flysas.com', // here only the domain name
    port: 443,  
    path : '/uat1/offers/flightproducts?adt=1&outDate=201710190000&bookingFlow=REVENUE&lng=GB&pos=LU&channel=web&from=ARN&to=CDG', // the rest of the url with parameters if needed
    method : 'GET', // do GET
    headers: headers
  };
           return new Promise(function (resolve) {
         //this is the call
         var flights;
var request = https.get(options, function(res){
   var body = "";
   res.on('data', function(data) {
      body += data;
      //flights=body;
   });
   res.on('end', function() {
   flights=JSON.parse(body);
    setTimeout(function () { resolve(flights); }, 1000);
    //here we have the full response, html or json object
    //  console.log(body);
   });
   res.on('error', function(e) {
      console.log("Got error: " + e.message);
   });
	});
 request.end();
        // var flights = require("./flightsDetails.json");
         
        
           });
        
        }
   
             
};
