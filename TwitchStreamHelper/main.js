'use strict';
var Alexa = require('alexa-sdk');

var APP_ID = "amzn1.ask.skill.1e642b50-3370-407a-be32-1f9e667c06f9";
var SKILL_NAME = "Twitch Stream Helper";
var WELCOME_MESSAGE = "Welcome to the Stream Helper Skill.";
var HELP_MESSAGE = "You can say is the stream live, or, you can say exit... What can I help you with?";
var HELP_REPROMPT = "What can I help you with?";
var STOP_MESSAGE = "Goodbye!";
var LIVE_MESSAGE = "The stream you asked about is currently live and streaming.";
var DOWN_MESSAGE = "The stream is not live.";

var outputMsg = "";


//=========================================================================================================================================
// Handlers  
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
            getStreamLiveStatus( (myResult) => {               
                if(myResult) {
                    this.emit(':tell', LIVE_MESSAGE);
                }
                else {
                    this.emit(':tell', DOWN_MESSAGE);
                }
            }
        );
    },
    'getFollowerCount': function() {
        getStreamInfo( (response) => {
            var responseData = JSON.parse(response);
            var cardContent = "Follower count: \n";
                        
            if(responseData == null) {
                outputMsg = "There was a problem with getting the data please try again.";
            }
            else {
                var followers = responseData.followers;
                outputMsg = "You have " + followers + " followers.";
                cardContent += followers;
            }
            
            var cardTitle = "Followers";
            
            this.emit(':tellWithCard', outputMsg, cardTitle, cardContent);
        });
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

//=========================================================================================================================================
// Helper functions 
//=========================================================================================================================================

var https = require('https');

function getStreamLiveStatus(callback) {
    // Update these options with the details of the web service you would like to call
    var options = {
        host: 'api.twitch.tv',
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
            var status = false;
            var result = JSON.parse(returnData);            
            if(result.stream !== null) {
                console.log("Stream is live");
                status = true;
            }
            else {
                console.log("Stream is not live");
                status = false;
            }
            callback(status);  // this will execute whatever function the caller defined, with one argument
        });
    });
    req.end();
};

function getStreamInfo(callback) {
    // https://api.twitch.tv/kraken/channels/backsh00ter?oauth_token=kf0s375j6kxppkoj2c0ss7pq6aqbpl
    var options = {
        host: 'api.twitch.tv',
        port: 443,
        path: '/kraken/channels/backsh00ter?oauth_token=kf0s375j6kxppkoj2c0ss7pq6aqbpl',
        method: 'GET',
    };

    var req = https.request(options, res => {       
        res.setEncoding('utf8');
        var returnData = "";

        res.on('data', chunk => {
            returnData += chunk;
        });

        res.on('end', () => { 
            console.log(returnData);
            callback(returnData);
        });

    });
    req.end();
};
