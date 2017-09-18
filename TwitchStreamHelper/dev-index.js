'use strict';
var Alexa = require('alexa-sdk');

var APP_ID = "amzn1.ask.skill.1e642b50-3370-407a-be32-1f9e667c06f9";
var SKILL_NAME = "Stream Helper";
var WELCOME_MESSAGE = "Welcome to the Stream Helper Skill. You can ask me questions about your viewers, followers or subscribers. What would you like to know?";
var HELP_MESSAGE = "You can say how many followers do I have, or, you can say exit... What can I help you with?";
var HELP_REPROMPT = "What can I help you with?";
var DIDNT_UNDERSTAND_MESSAGE = "I'm sorry, I didn't understand that. Try again.";
var STOP_MESSAGE = "Goodbye!";
var LIVE_MESSAGE = "Yes, the stream is <phoneme alphabet='ipa' ph='l aɪ v'>live</phoneme>.";
var DOWN_MESSAGE = "The stream is not live.";

var outputMsg = "";
var accessToken = "";
var userName = "";



//=========================================================================================================================================
// Handlers  
//=========================================================================================================================================
exports.handler = function (event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.emit(':ask', WELCOME_MESSAGE, HELP_MESSAGE);
    },
    'isStreamLive': function () {
        if (!this.event.session.user.accessToken) { //this might not work
            this.emit(':tellWithLinkAccountCard', 'to start using this skill please use the companion app to authenticate with your Twitch account. And then try again.');
            return;
        }

        getStreamInfo("live", (response) => {
            var responseData = JSON.parse(response);

            if (responseData == null) {
                outputMsg = "There was a problem with getting the data please try again.";
            } else {

                if (responseData.stream !== null) {
                    console.log("Stream is live");
                    outputMsg = LIVE_MESSAGE;
                } else {
                    console.log("Stream is not live");
                    outputMsg = DOWN_MESSAGE;
                }
            }

            this.emit(':tell', outputMsg);
        });

    },
    'getFollowerCount': function () {
        if (!this.event.session.user.accessToken) { //this might not work
            this.emit(':tellWithLinkAccountCard', 'to start using this skill please use the companion app to authenticate with your Twitch account. And then try again.');
            return;
        }

        accessToken = this.event.session.user.accessToken;

        setUserInfo((info) => {
            getStreamInfo("basicInfo", (response) => {
                var responseData = JSON.parse(response);
                var cardContent = "Follower count: ";

                if (responseData == null) {
                    outputMsg = "There was a problem with getting the data please try again.";
                    cardContent = "Error";
                } else {
                    var followers = responseData.followers;
                    outputMsg = "You have " + followers + " followers.";
                    cardContent += followers;
                }

                var cardTitle = "Followers";

                this.emit(':tellWithCard', outputMsg, cardTitle, cardContent);
            });
        });
    },
    'getViewerCount': function () {
        if (!this.event.session.user.accessToken) {
            this.emit(':tellWithLinkAccountCard', 'to start using this skill please use the companion app to authenticate with your Twitch account. And then try again.');
            return;
        }

        accessToken = this.event.session.user.accessToken;

        setUserInfo((info) => {
            getStreamInfo("viewers", (response) => {
                var responseData = JSON.parse(response);
                var cardContent = "Viewer count: ";

                if (responseData == null) {
                    outputMsg = "There was a problem with getting the data please try again.";
                    cardContent = "Error";
                } else if (responseData.stream == null) {
                    outputMsg = "You have 0 viewers, the stream is not live.";
                    cardContent += "0";
                } else {
                    var viewerCount = responseData.stream.viewers;
                    outputMsg = "You currently have " + viewerCount + " viewers.";
                    cardContent += viewerCount;
                }

                var cardTitle = "Viewers";

                this.emit(':tellWithCard', outputMsg, cardTitle, cardContent);
            });
        });

    },
    'getSubscriberCount': function () {
        if (!this.event.session.user.accessToken) {
            this.emit(':tellWithLinkAccountCard', 'to start using this skill please use the companion app to authenticate with your Twitch account. And then try again.');
            return;
        }

        accessToken = this.event.session.user.accessToken;

        setUserInfo((info) => {
            getStreamInfo("subscribers", (response) => {
                if(response.indexOf("_total") == -1) {
                    console.log("Not a subscriber ");
                    outputMsg = "You are not a Twitch partner or affiliate.";
                    cardContent = "You are not a Twitch partner or affiliate.";
                }
                else {
                    var responseData = JSON.parse(response);
                    var cardContent = "Subscriber count: ";
                    console.log(responseData);
                    if (responseData == null) {
                        outputMsg = "There was a problem with getting the data please try again.";
                        cardContent = "Error";
                    } else if(responseData.status == "422") {
                        outputMsg = "You are not a Twitch partner or affiliate.";
                        cardContent = "You are not a Twitch partner or affiliate.";
                    } else {
                        var subscriberCount = responseData._total - 1;
                        outputMsg = "You currently have " + subscriberCount + " subscribers.";
                        cardContent += subscriberCount;
                    }
                }
                var cardTitle = "Subscribers";

                this.emit(':tellWithCard', outputMsg, cardTitle, cardContent);
            });
        });
    },
    'getLastSubscriber': function () {
        if (!this.event.session.user.accessToken) {
            this.emit(':tellWithLinkAccountCard', 'to start using this skill please use the companion app to authenticate with your Twitch account. And then try again.');
            return;
        }

        accessToken = this.event.session.user.accessToken;

        setUserInfo((info) => {
            getStreamInfo("subscribers", (response) => {
                if(response.indexOf("_total") == -1) {
                    console.log("Not a subscriber ");
                    outputMsg = "You are not a Twitch partner or affiliate.";
                    cardContent = "You are not a Twitch partner or affiliate.";
                }
                else {
                    var responseData = JSON.parse(response);
                    var cardContent = "Last subscriber: ";
                    console.log(responseData);
                    if (responseData == null) {
                        outputMsg = "There was a problem with getting the data please try again.";
                        cardContent = "Error";
                    } else if(responseData.status == "422") {
                        outputMsg = "You are not a Twitch partner or affiliate.";
                        cardContent = "You are not a Twitch partner or affiliate.";
                    } else {
                        var subscriberCount = responseData._total - 1; //Counts self as subscriber
                        if(subscriberCount == 0) {
                            outputMsg = "You don't have any subscribers.";
                            cardContent += "No subscribers";
                        }
                        else {
                            var lastSubscriber = responseData.subscriptions[subscriberCount].user.display_name;
                            outputMsg = "Your last subscriber was " + lastSubscriber;
                            cardContent += lastSubscriber;
                        }
                    }
                }
                var cardTitle = "Subscribers";

                this.emit(':tellWithCard', outputMsg, cardTitle, cardContent);
            });
        });
    },
    'getLastFollower': function() {
        if (!this.event.session.user.accessToken) { //this might not work
            this.emit(':tellWithLinkAccountCard', 'to start using this skill please use the companion app to authenticate with your Twitch account. And then try again.');
            return;
        }

        accessToken = this.event.session.user.accessToken;

        setUserInfo((info) => {
            getStreamInfo("followers", (response) => {
                var responseData = JSON.parse(response);
                var cardContent = "Last Follower: ";

                if (responseData == null) {
                    outputMsg = "There was a problem with getting the data please try again.";
                    cardContent = "Error";
                } else {
                    var lastFollower = responseData.follows[0].user.display_name;
                    outputMsg = "Your last follower was " + lastFollower;
                    cardContent += lastFollower;
                }

                var cardTitle = "Followers";

                this.emit(':tellWithCard', outputMsg, cardTitle, cardContent);
            });
        });
    },
    'getStreamUpTime': function() {
        if (!this.event.session.user.accessToken) { //this might not work
            this.emit(':tellWithLinkAccountCard', 'to start using this skill please use the companion app to authenticate with your Twitch account. And then try again.');
            return;
        }

        accessToken = this.event.session.user.accessToken;

        setUserInfo((info) => {
            getStreamInfo("live", (response) => {
                var responseData = JSON.parse(response);

                        if (responseData == null) {
                            outputMsg = "There was a problem with getting the data please try again.";
                        } else {
                            if (responseData.stream == null) {
                                console.log("Stream is not live");
                                outputMsg = "<prosody rate=\"fast\">Silly goose!</prosody> Your stream isn't <phoneme alphabet='ipa' ph='l aɪ v'>live</phoneme>.";
                            } else {
                                var streamStart = responseData.stream.created_at;
                                var startDate = new Date(streamStart);
                                var currentDate = new Date();
                                console.log("StartDate: " + startDate);
                                console.log("CurrentDate: " + currentDate);

                                var totalMins = Math.floor((currentDate - startDate) / (1000*60));
                                var mins = totalMins % 60;
                                var hrs = Math.floor(totalMins / 60);

                                if(hrs >= 23 && mins >= 59) {
                                    console.log("Live for over 24 hours");
                                    outputMsg = "Your stream has been <phoneme alphabet='ipa' ph='l aɪ v'>live</phoneme> for more than 24 hours.";
                                }
                                else {
                                    outputMsg = "Your stream has been <phoneme alphabet='ipa' ph='l aɪ v'>live</phoneme> for " + hrs + " hours and " + mins + " minutes.";
                                    console.log("Your stream has been live for: " + hrs + " hours and " + mins + " minutes.");
                                }
                            }
                        }

                        this.emit(':tell', outputMsg);
            });
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
    'Unhandled': function () {
        this.emit(':ask', DIDNT_UNDERSTAND_MESSAGE, HELP_REPROMPT);
    },
    'CatchAll': function () {
        this.emit(':ask', DIDNT_UNDERSTAND_MESSAGE, HELP_REPROMPT);
    }
};

//=========================================================================================================================================
// Helper functions 
//=========================================================================================================================================

var https = require('https');

//Gets the info of your stream depending on the arg you give it
//Can get counts for followers, viewers, subscribers, also gets  you username
function getStreamInfo(info, callback) {
    var path = "";
    switch (info) {
        case "basicInfo":
            path = '/kraken/channels/' + userName + '?oauth_token=' + accessToken;
            break;
        case "followers":
            path = '/kraken/channels/' + userName + '/follows?oauth_token=' + accessToken;
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
        case "live":
            path = '/kraken/streams/' + userName + '?client_id=3nevz99m02nwt62pto6ez57f3lms4o';
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
function setUserInfo(callback) {
    //get the username        
    getStreamInfo("username", (response) => {
        var responseData = JSON.parse(response);

        if (responseData) {
            userName = responseData.token.user_name;
        } else {
            console.log("There was an error getting user name.");
        }
        callback(userName);
    });
};
