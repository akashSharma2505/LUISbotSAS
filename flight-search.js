var util = require('util');
var _ = require('lodash');
var builder = require('botbuilder');
var Store = require('./store');

module.exports = function search(session, flightSearch){
    var flyDest = flightSearch.Placeto;
    var flyOrg = flightSearch.Placefrom;
    var flydate = flightSearch.flyDate;

 session.send(
        'Ok. Searching for Flights from %s to %s on %s...',
    flyDest,
    flyOrg,
    flydate);


    // Async search
    Store
        .searchFlights(flyDest, flydate, flyOrg)
        .then(function (flights) {
            // Results
            console.log(flights);
            session.send(flights);
            
            var title = util.format('I found in total %d flights for your dates:', flights.outboundFlights.length);
session.send(title);
      
var results = flights.outboundFlights;
            var msg = new builder.Message(session);
            msg.attachmentLayout(builder.AttachmentLayout.carousel);
            var len;
            var card;
            for(len = 0; len < results.length; len++)
 {
     card =  {
                'contentType': 'application/vnd.microsoft.card.adaptive',
                'content': {
                    'type': 'AdaptiveCard',
                    'body': [
                        {
                            'type': 'TextBlock',
                            'text': "From " + results[len].origin.name + " To " + results[len].destination.name,
                            'size': 'extraLarge',
                            'speak': '<s>' + title + '</s>'
                        },
                         {
                            'type': 'TextBlock',
                            'text': "Start time is : " + results[len].startTimeInLocal + "and Reaching time is : " + results[len].endTimeInLocal,
                            'size': 'Large',
                            'speak': '<s>' + title + '</s>'
                        },
                        {
                            'type':'TextBlock',
                            'text': "Flight Number is  " + results[len].segments[0].flightNumber,
                            "size":"extraLarge",
                            "selectAction": {                           
                              'type': 'Action.Submit',
                                'data': _.extend({ type: 'flightSelection' }, results[len])
      }
                        }
                    ]
                }
            };
            msg.addAttachment(card);
                
                
 } 
              
                
            session.send(msg);
            
        });
        

        
    session.endDialog();
};


 
Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};