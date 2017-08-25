'use strict';
var Alexa = require('alexa-sdk');



//=========================================================================================================================================
//TODO: The items below this comment need your attention.
//=========================================================================================================================================

//Replace with your app ID (OPTIONAL).  You can find this value at the top of your skill's page on http://developer.amazon.com.  
//Make sure to enclose your value in quotes, like this: var APP_ID = "amzn1.ask.skill.bb4045e6-b3e8-4133-b650-72923c5980f1";
var APP_ID = "amzn1.ask.skill.1e642b50-3370-407a-be32-1f9e667c06f9";

var SKILL_NAME = "Twitch Stream Helper";
var WELCOME_MESSAGE = "Welcome to the Stream Helper Skill.";
var HELP_MESSAGE = "You can say is the stream live, or, you can say exit... What can I help you with?";
var HELP_REPROMPT = "What can I help you with?";
var STOP_MESSAGE = "Goodbye!";
var LIVE_MESSAGE = "The stream you asked about is currently live and streaming.";
var DOWN_MESSAGE = "The stream is not live.";


//=========================================================================================================================================
//Editing anything below this line might break your skill.  
//=========================================================================================================================================
exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    //Probably dont need this
    // 'NewSession': function () {
    //   var accessToken = this.event.session.user.accessToken;
    //   if(accessToken) {
    //       console.log("HAVE ACCESS TOKEN: " + accessToken);
    //   }
    //   else {
    //       this.emit(':tell', "You don't have an accessToken, you need to link your account with Twitch.");
    //   }
    // },
    'LaunchRequest': function () {
        if(this.event.session.user.accessToken === undefined) {
            this.emit(':tellWithLinkAccountCard', 'to start using this skill please use the companion app to authenticate with your Twitch account. And then try again.');
            return;
        }
        else {
            this.emit('tell:', "Welcome user your accesstoken is already set");
        }
        //this.emit('isStreamLive');
    },
    'isStreamLive': function() {
            httpsGet( (myResult) => {               
                //console.log("received : " + myResult);
                if(myResult !== null) {
                    this.emit(':tell', LIVE_MESSAGE);
                }
                else {
                    this.emit(':tell', DOWN_MESSAGE);
                }
            }
        );
    },
    'AMAZON.HelpIntent': function () {
        var speechOutput = HELP_MESSAGE;
        var reprompt = HELP_REPROMPT;
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', STOP_MESSAGE);
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', STOP_MESSAGE);
    },
};


//Helper functions
var https = require('https');

function httpsGet(callback) {
    // Update these options with the details of the web service you would like to call
    var options = {
        host: 'api.twitch.tv',
        family: 4,
        port: 443,
        path: '/kraken/streams/backsh00ter?client_id=3nevz99m02nwt62pto6ez57f3lms4o',
        method: 'GET',
    };

    var req = https.request(options, res => {       
        res.setEncoding('utf8');
        var returnData = "";

        res.on('data', chunk => {
            returnData = returnData + chunk;
        });

        res.on('end', () => {
            var result = JSON.parse(returnData);
            if(result.stream !== null) {
                console.log("NOT NULL");
            }
            else {
                console.log("ITS NULL");
            }

            callback(result.stream);  // this will execute whatever function the caller defined, with one argument

        });

    });
    req.end();
}

function getFollowerCount(callback) {
    // Update these options with the details of the web service you would like to call
    //TODO: update path w/ var for username and auth token
    var options = {
        host: 'api.twitch.tv',
        family: 4,
        port: 443,
        path: '/kraken/channels/backsh00ter?oauth_token=kf0s375j6kxppkoj2c0ss7pq6aqbpl',
        method: 'GET',
    };

    var req = https.request(options, res => {       
        res.setEncoding('utf8');
        var returnData = "";

        res.on('data', chunk => {
            returnData = returnData + chunk;
        });

        res.on('end', () => {
            var result = JSON.parse(returnData);
            if(result.followers !== null) {
                console.log("followers not found");
            }
            else {
                console.log("Follower count: " + result.followers);
            }

            callback(result.stream);  // this will execute whatever function the caller defined, with one argument

        });

    });
    req.end();
}

