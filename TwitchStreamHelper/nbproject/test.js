// //Example date format: 2017-09-17T18:14:54Z
// var d = "2017-09-17T18:14:54Z";
// var startDate = new Date(d);
// console.log("Start date" + startDate);
//
// var date = new Date();
// var currentDate = date.getUTCFullYear() + "-" + (date.getUTCMonth() + 1) + "-" +  date.getUTCDate() + "T" + date.getUTCHours() + ":" + date.getUTCMinutes() +":" + date.getUTCSeconds() + "Z";
// var newerDate = new Date(currentDate);
// console.log("Current date: " + currentDate);
// console.log("newer date:" + newerDate);
//
// var t = new Date();
// console.log("T: " + t);
//
// var diff = new Date(t.getTime() - startDate.getTime());
// console.log("diff day: M " + diff.getUTCMonth() + " d " + diff.getUTCDate())
// console.log("diff: H " + diff.getUTCHours() + " M "+ diff.getUTCMinutes());



var d = "2017-09-17T18:14:54Z";
var startDate = new Date(d);
var currentDate = new Date();
console.log("StartDate: " + startDate);
console.log("CurrentDate: " + currentDate);

//this is correct
var totalMins = Math.floor((currentDate - startDate) / (1000*60));
var mins = totalMins % 60;
var hrs = Math.floor(totalMins / 60);

if(hrs >= 23 && mins >= 59) {
    console.log("Live for over 24 hours");
}
else {
    console.log("hrs: " + hrs + " mins:" + mins);
    console.log("mins: " + mins);

    var utc = new Date();
    var loc = new Date();

    console.log("UTC: " + utc.getUTCHours());
    console.log("loc: " + loc.getHours());
}

//Will need to check to see what timezone lambda grabs UTC or local