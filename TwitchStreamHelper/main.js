'use strict';
var Alexa = require('alexa-sdk');

var APP_ID = "amzn1.ask.skill.1e642b50-3370-407a-be32-1f9e667c06f9";
var SKILL_NAME = "Twitch Stream Helper";
var WELCOME_MESSAGE = "Welcome to the Stream Helper Skill.";
var HELP_MESSAGE = "You can say is the stream live, or, you can say exit... What can I help you with?";
var HELP_REPROMPT = "What can I help you with?";
var DIDNT_UNDERSTAND_MESSAGE = "I'm sorry, I didn't understand that. Try again.";
var STOP_MESSAGE = "Goodbye!";
var LIVE_MESSAGE = "The stream you asked about is currently live and streaming.";
var DOWN_MESSAGE = "The stream is not live.";

var accountLinked = false;
var outputMsg = "";
var accessToken = "";
var userName = "";



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
    
    'isStreamLive': function() {
        if(!accountLinked) {
            setUserInfo(this.event.session.user.accessToken);
        }        
        
        
        getStreamLiveStatus( (myResult) => {               
            if(myResult) {
                outputMsg = LIVE_MESSAGE;
            }
            else {
                outputMsg = DOWN_MESSAGE;
            }
            outputMsg += "Your username is: " + userName + ".";
            this.emit(':tell', outputMsg);            
        });
    },
    'getFollowerCount': function() {
        if(!accountLinked) {           
            setUserInfo(this.event.session.user.accessToken);
        }
        
        getStreamInfo("followers", (response) => {
            var responseData = JSON.parse(response);
            var cardContent = "Follower count: ";
                        
            if(responseData == null) {
                outputMsg = "There was a problem with getting the data please try again.";
            }
            else {
                var followers = responseData.followers;
                outputMsg = "You have " + followers + " followers.";
                cardContent += followers;
            }
            outputMsg += " Your username is " + userName + ". Access token is " + accessToken;
            
            var cardTitle = "Followers";
            
            this.emit(':tellWithCard', outputMsg, cardTitle, cardContent);
        });
    },
    'getViewerCount': function () {
        if(!accountLinked) {
            setUserInfo(this.event.session.user.accessToken);
        }
        
        getStreamInfo("viewers", (response) => {
           var responseData = JSON.parse(response);
           var cardContent = "Viewer count: ";
           
           if(responseData == null) {
               outputMsg = "There was a problem getting the data please try again.";
               cardContent = "Error";
           }
           else if(responseData.stream == null) {
               outputMsg = "There are 0 viewers because the stream is not live.";
               cardContent += "0";
           }
           else {
               var viewerCount = responseData.stream.viewers;
               outputMsg = "You currently have " + viewerCount + " viewers.";
               cardContent += viewerCount;
           }
           
           var cardTitle = "Viewers";
           
           this.emit(':tellWithCard', outputMsg, cardTitle, cardContent);
        });
    },
    'getSubscriberCount': function () {
        if(!accountLinked) {
            setUserInfo(this.event.session.user.accessToken);
        }
        
        getStreamInfo("subscribers", (response) => {
           var responseData = JSON.parse(response);
           var cardContent = "Subscriber count: ";
           
           if(responseData == null) {
               outputMsg = "There was a problem getting the data please try again.";
               cardContent = "Error";
           }           
           else {
               var subscriberCount = responseData._total - 1;
               outputMsg = "You currently have " + subscriberCount + " subscribers.";
               cardContent += subscriberCount;
           }
           
           var cardTitle = "Subscribers";
           
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
    'Unhandled': function() {
        this.emit(':ask', DIDNT_UNDERSTAND_MESSAGE, HELP_REPROMPT);
    },
    'CatchAll': function() {
        this.emit(':ask', DIDNT_UNDERSTAND_MESSAGE, HELP_REPROMPT);
    }
};

//=========================================================================================================================================
// Helper functions 
//=========================================================================================================================================

var https = require('https');

//Gets the status of whether your stream is live or not
function getStreamLiveStatus(callback) {
   
    var options = {
        host: 'api.twitch.tv',
        port: 443,
        path: '/kraken/streams/' + userName + '?client_id=3nevz99m02nwt62pto6ez57f3lms4o',
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

//Gets the info of your stream depending on the arg you give it
//Can get counts for followers, viewers, subscribers, also gets  you username
function getStreamInfo(info, callback) {
    var path = "";
    switch(info) {
        case "followers":
            path = '/kraken/channels/' + userName + '?oauth_token=' + accessToken;
            break;
        case "viewers":
            path = '/kraken/streams/' + userName + '?oauth_token=' + accessToken;
            break;
        case "subscribers":
            path = '/kraken/channels/' + userName + '/subscriptions?oauth_token=' + accessToken;
            break;
        case "username":
            path = '/kraken?oauth_token=' + accessToken;
            break;
        default:
            path = '/kraken/channels/' + userName + '?oauth_token=' + accessToken;
            break;
    }

    var options = {
        host: 'api.twitch.tv',
        port: 443,
        path: path,
        method: 'GET',
    };

    var req = https.request(options, res => {       
        res.setEncoding('utf8');
        var returnData = "";

        res.on('data', chunk => {
            returnData += chunk;
        });

        res.on('end', () => { 
            callback(returnData);
        });

    });
    req.end();
};

//Updates variables with your accessToken and username
function setUserInfo(token) {
    if(!token) { //this might not work
            this.emit(':tellWithLinkAccountCard', 'to start using this skill please use the companion app to authenticate with your Twitch account. And then try again.');
            return;
    }
    else {
        accountLinked = true;
        accessToken = token;       
        
        //get the username        
        getStreamInfo("username", (response) => {
            var responseData = JSON.parse(response);
                                    
            if(responseData) {
                userName = responseData.token.user_name;                
            } 
            else {
                console.log("THERE WAS ERROR");
            }
        });        
    }
}

