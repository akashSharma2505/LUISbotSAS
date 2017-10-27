/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/
var util = require('util');
var documentdb = require('documentdb');
var restify = require('restify');
var builder = require('botbuilder');
var azure = require('botbuilder-azure'); 

// Azure storage block

// Table storage
var tableName = "UserData"; // You define
var storageName = "luisbotstorage"; // Obtain from Azure Portal
var storageKey = "WXUxzDEQdb3JOwKEdqiai9giXLCNPsczFToHeaxSJjzDE+8hwgCa2Ll2RLS4ufplN+njRVobq2IZGle48QlCTg=="; // Obtain from Azure Portal


var azureTableClient = new azure.AzureTableClient(tableName, storageName, storageKey);

var tableStorage = new azure.AzureBotStorage({gzipData: false}, azureTableClient);

// azure storage block END

var url = require('url');
var fs = require('fs');
var speechService = require('./speech-service.js');
// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    stateEndpoint: process.env.BotStateEndpoint,
    openIdMetadata: process.env.BotOpenIdMetadata
});
// speech control 


// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector)
.set('storage', tableStorage);
// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

// Azure DocumentDb State Store

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
bot.recognizer(new builder.LuisRecognizer(LuisModelUrl));
var intents = new builder.IntentDialog({ recognizers: [recognizer] })
/*
.matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
*/

    .onDefault((session) => {

    if (session.message != null) {
        // A Card's Submit Action obj was received
        
        processSubmitAction(session, session.message.value);
        return;
    }
    //    builder.Prompts.text(session, intents);
})
    .matches('Taxi.Book',(session) => {
        session.userData.userName = "Sharma Akash";
    var card = {
        'contentType': 'application/vnd.microsoft.card.adaptive',
        'content': {
            '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
            'type': 'AdaptiveCard',
            'version': '1.0',
            'body': [
                {
                    'type': 'Container',
                    'speak': '<s>Hello!</s><s>Are you looking for a flight or a hotel?</s>',
                    'items': [
                        {
                            'type': 'ColumnSet',
                            'columns': [
                                {
                                    'type': 'Column',
                                    'size': 'auto',
                                    'items': [
                                        {
                                            'type': 'Image',
                                            'url': 'http://gototheedge.co.uk/wp-content/uploads/2011/06/SAS-Logo.jpg',
                                            'size': 'large',
                                            'style': 'person'
                                        }
                                    ]
                                },
                                {
                                    'type': 'Column',
                                    'size': 'stretch',
                                    'items': [
                                        {
                                            'type': 'TextBlock',
                                            'text': 'Hello!',
                                            'weight': 'bolder',
                                            'isSubtle': true
                                        },
                                        {
                                            'type': 'TextBlock',
                                            'text': 'Are you looking for a flight or a hotel?',
                                            'wrap': true
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            'actions': [
                
                // Hotels Search form
                {
                    'type': 'Action.ShowCard',
                    'title': 'Hotels',
                    'speak': '<s>Hotels</s>',
                    'card': {
                        'type': 'AdaptiveCard',
                        'body': [
                            {
                                'type': 'TextBlock',
                                'text': 'Welcome to the Hotels finder!',
                                'speak': '<s>Welcome to the Hotels finder!</s>',
                                'weight': 'bolder',
                                'size': 'large'
                            },
                            {
                                'type': 'TextBlock',
                                'text': 'Please enter your destination:'
                            },
                            {
                                'type': 'Input.Text',
                                'id': 'destination',
                                'speak': '<s>Please enter your destination</s>',
                                'placeholder': 'Miami, Florida',
                                'style': 'text'
                            },
                            {
                                'type': 'TextBlock',
                                'text': 'When do you want to check in?'
                            },
                            {
                                'type': 'Input.Date',
                                'id': 'checkin',
                                'speak': '<s>When do you want to check in?</s>'
                            },
                            {
                                'type': 'TextBlock',
                                'text': 'How many nights do you want to stay?'
                            },
                            {
                                'type': 'Input.Number',
                                'id': 'nights',
                                'min': 1,
                                'max': 60,
                                'speak': '<s>How many nights do you want to stay?</s>'
                            }
                        ],
                        'actions': [
                            {
                                'type': 'Action.Submit',
                                'title': 'Search',
                                'speak': '<s>Search</s>',
                                'data': {
                                    'type': 'hotelSearch'
                                }
                            }
                        ]
                    }
                },
                {
                    'type': 'Action.ShowCard',
                    'title': 'Flights',
                    'card': {
                        'type': 'AdaptiveCard',
                        "body": [
                            {
                                'type': 'TextBlock',
                                'text': 'Welcome to the Flight finder!',
                                'speak': '<s>Welcome to the Flight finder!</s>',
                                'weight': 'bolder',
                                'size': 'large'
                            },
                            {
                                "type": "TextBlock",
                                "text": "from"
                            },
                            {
                                "type": "Input.Text",
                                "id": "Placefrom",
                                "placeholder": "From"
                            },
                            {
                                "type": "TextBlock",
                                "text": "To"
                            },
                            {
                                "type": "Input.Text",
                                "id": "Placeto",
                                "placeholder": "To"
                            },
                            {
                                'type': 'TextBlock',
                                'text': 'When do you want to fly ?'
                            },
                            {
                                'type': 'Input.Date',
                                'id': 'flyDate',
                                'speak': '<s>When do you want to fly ?</s>'
                            }
                        ],
                        "actions": [
                            {
                                "type": "Action.Submit",
                                "title": "Search",
                                "data": {
                                    "type": "flightSearch"
                                }
                            }
                        ]
                    }
                }
            ]
        }
    };
session.send(session.userData.userName);
    var msg = new builder.Message(session)
        .addAttachment(card);
    session.send(msg);
})

.matches('Flight.Discounts',(session) => {
    var msg = new builder.Message(session);
    msg.attachmentLayout(builder.AttachmentLayout.carousel);
    msg.attachments([
        new builder.HeroCard(session)
            .title("Offers and Discounts")
            .subtitle("Offer 1")
            .text("10% off on the normal price on economoy booking")
            .images([builder.CardImage.create(session, 'http://petersapparel.parseapp.com/img/whiteshirt.png')])
            .buttons([
                builder.CardAction.imBack(session, "You opted for Offer 1", "Select")
            ]),
              new builder.HeroCard(session)
            .title("Offers and Discounts")
            .subtitle("Offer 2")
            .text("15% off on the normal price on Business class bookings")
            .images([builder.CardImage.create(session, 'http://petersapparel.parseapp.com/img/whiteshirt.png')])
            .buttons([
                builder.CardAction.imBack(session, "You opted for Offer 2", "Select")
            ]),
              new builder.HeroCard(session)
            .title("Offers and Discounts")
            .subtitle("Offer 3")
            .text("25% off on the normal price on in January")
            .images([builder.CardImage.create(session, 'http://petersapparel.parseapp.com/img/whiteshirt.png')])
            .buttons([
                builder.CardAction.imBack(session, "You opted for Offer 3", "Select")
            ])
    ]);
     session.send(msg).endDialog();
});

////

bot.dialog('hotels-search', require('./hotels-search'));

bot.dialog('flight-search', require('./flight-search'));

// Help
bot.dialog('support', require('./support'))
    .triggerAction({
    matches: [/help/i, /support/i, /problem/i]
});

// log any bot errors into the console
bot.on('error', function (e) {
    console.log('And error ocurred', e);
});
// Display Welcome card with Hotels and Flights search options
  

bot.dialog('/', intents);
function processSubmitAction(session, value) {
    var defaultErrorMessage = 'Please complete all the search parameters';
    switch (value.type) {
        case 'hotelSearch':
            // Search, validate parameters
            if (validateHotelSearch(value)) {
                // proceed to search
                session.beginDialog('hotels-search', value);
            } else {
                session.send(defaultErrorMessage);
            }
            break;

        case 'hotelSelection':
            // Hotel selection
            sendHotelSelection(session, value);
            break;

        case 'flightSearch':
            // Hotel selection
            if (validateFlightSearch(value, session)) {
                // proceed to search
                session.beginDialog('flight-search', value);
            } else {
                session.send(defaultErrorMessage);
            }
            break;
        default:
            // A form data was received, invalid or incomplete since the previous validation did not pass
            session.send(defaultErrorMessage);
    }
}

function validateHotelSearch(hotelSearch) {
    if (!hotelSearch) {
        return false;
    }

    // Destination
    var hasDestination = typeof hotelSearch.destination === 'string' && hotelSearch.destination.length > 3;

    // Checkin
    var checkin = Date.parse(hotelSearch.checkin);
    var hasCheckin = !isNaN(checkin);
    if (hasCheckin) {
        hotelSearch.checkin = new Date(checkin);
    }

    // Nights
    var nights = parseInt(hotelSearch.nights, 10);
    var hasNights = !isNaN(nights);
    if (hasNights) {
        hotelSearch.nights = nights;
    }

    return hasDestination && hasCheckin && hasNights;
}

function sendHotelSelection(session, hotel) {
    var description = util.format('%d stars with %d reviews. From $%d per night.', hotel.rating, hotel.numberOfReviews, hotel.priceStarting);
    var card = {
        'contentType': 'application/vnd.microsoft.card.adaptive',
        'content': {
            'type': 'AdaptiveCard',
            'body': [
                {
                    'type': 'Container',
                    'items': [
                        {
                            'type': 'TextBlock',
                            'text': hotel.name + ' in ' + hotel.location,
                            'weight': 'bolder',
                            'speak': '<s>' + hotel.name + '</s>'
                        },
                        {
                            'type': 'TextBlock',
                            'text': description,
                            'speak': '<s>' + description + '</s>'
                        },
                        {
                            'type': 'Image',
                            'size': 'auto',
                            'url': hotel.image
                        },
                        {
                            'type': 'ImageSet',
                            'imageSize': 'medium',
                            'separation': 'strong',
                            'images': hotel.moreImages.map((img) => ({
                                'type': 'Image',
                                'url': img
                            }))
                        }
                    ],
                    'selectAction': {
                        'type': 'Action.OpenUrl',
                        'url': 'https://dev.botframework.com/'
                    }
                }
            ]
        }
    };

    var msg = new builder.Message(session)
        .addAttachment(card);

    session.send(msg);
}

function validateFlightSearch(flightSearch, session) {
    if (!flightSearch) {
        return false;
    }

    // Destination
    var hasDestination = typeof flightSearch.Placeto === 'string' && flightSearch.Placeto.length > 3;

    // Checkin
    var flyDate = Date.parse(flightSearch.flyDate);
    var hasDate = !isNaN(flyDate);
    if (hasDate) {
        hasDate.flightDate = new Date(flyDate);
    }

    return hasDestination && hasDate;
}
