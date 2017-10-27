var util = require('util');
var _ = require('lodash');
var builder = require('botbuilder');
var Store = require('./store');

module.exports = function search(session, hotelSearch) {
    var destination = hotelSearch.destination;
    var checkIn = hotelSearch.checkin;
    var checkOut = checkIn.addDays(hotelSearch.nights);

    session.send(
        'Ok. Searching for Hotels in %s from %d/%d to %d/%d...',
        destination,
        checkIn.getMonth() + 1, checkIn.getDate(),
        checkOut.getMonth() + 1, checkOut.getDate());

    // Async search
    Store
        .searchHotels(destination, checkIn, checkOut)
        .then(function (hotels) {
            // Results
            console.log(hotels);
            var title = util.format('I found in total %d hotels for your dates:', hotels.length);

            var rows = _.chunk(hotels, 3).map(group =>
                ({
                    'type': 'ColumnSet',
                    'columns': group.map(asHotelItem)
                }));
 
            var card = {
                'contentType': 'application/vnd.microsoft.card.adaptive',
                'content': {
                    'type': 'AdaptiveCard',
                    'body': [
                        {
                            'type': 'TextBlock',
                            'text': title,
                            'size': 'extraLarge',
                            'speak': '<s>' + title + '</s>'
                        }
                    ].concat(rows)
                }
            };

            var msg = new builder.Message(session);
            msg.attachmentLayout(builder.AttachmentLayout.carousel);
            var len;
            var card1;
            for(len = 0; len < hotels.length; len++)
 {
     card1 =  {
                'contentType': 'application/vnd.microsoft.card.adaptive',
                'content': {
                    'type': 'AdaptiveCard',
                    'body': [
                        {
                            'type': 'TextBlock',
                            'text': hotels[len].name,
                            'size': 'extraLarge',
                            'speak': '<s>' + title + '</s>'
                        },
                        {
                            'type':'Image',
                            "url": hotels[len].image,
                            "size":"200px",
                            "selectAction": {                           
                              'type': 'Action.Submit',
                                'data': _.extend({ type: 'hotelSelection' }, hotels[len])
      }
                        }
                    ]
                }
            };
            msg.addAttachment(card1);
                
                
 } 
              
                
            session.send(msg);
        });

    session.endDialog();
};

// Helpers
function asHotelItem(hotel) {
    return {
        'type': 'Column',
        'size': '20',
        'items': [
            {
                'type': 'TextBlock',
                'horizontalAlignment': 'center',
                'wrap': false,
                'weight': 'bolder',
                'text': hotel.name,
                'speak': '<s>' + hotel.name + '</s>'
            },
            {
                'type': 'Image',
                'size': 'auto',
                'url': hotel.image
            }
        ],
        'selectAction': {
            'type': 'Action.Submit',
            'data': _.extend({ type: 'hotelSelection' }, hotel)
        }
    };
}

Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};