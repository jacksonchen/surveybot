var Nightmare = require('nightmare');
var sem = require('semaphore')(1);
var philsem = require('semaphore')(1);
var request = require('request');
var cheerio = require('cheerio');
var _ = require('lodash');
var counter = 1;

var yolo = function(text, callback) {
  var nightmare = new Nightmare()
    // .goto("https://docs.google.com/forms/d/108-02nRNhbeycU4MRjd3CeR5rNBVXvlZ0NLwZQBx-9M/viewform?usp=send_form")
    // .type('textarea[name="entry.1342734250"]', text)
    .goto("https://docs.google.com/forms/d/1dhALobG0RMe7ESPSdpTVnfbccPxF1uQQkmvgsVbjkSI/viewform")
    .type('textarea[name="entry.300495425"]', text)
    .click('input[type="submit"]')
    .run(function(err, nightmare) {
      if (err) return console.log(err);
      console.log("Submitted " + counter + " times!");
      counter = counter + 1;
      var delay = (Math.pow((Math.random() * 180000) + 1000, 2)/267000) + 45000;
      console.log("Waiting " + delay + " ms to send again.");
      setTimeout(function() {
        callback();
      }, delay);
    })
    .end();
}

var philosopher = function(philLink, philName, callback) {
  request(philLink, function(error, response, html) {
    $ = cheerio.load(html);
    var linkArr = $('div.masonryitem div.boxyPaddingBig span.bqQuoteLink a');
    var philCounter = 0;

    _.forEach(linkArr, function(link) {
      sem.take(function() {
        var quote = '\"' + link.children[0].data + '\" - ' + philName;
        console.log(quote);
        yolo(quote, function() {
          sem.leave();
          if (philCounter >= linkArr.length - 1) {
            callback();
          }
          philCounter = philCounter + 1;
        });
      })
    })

  })
}

var philosophers = function() {
  var url = "http://www.brainyquote.com/profession/philosopher_quotes";

  request(url, function(error, response, html) {
    $ = cheerio.load(html);
    var linkArr = $('tbody tr td a');

    _.forEach(linkArr, function(link) {
      philsem.take(function() {
        var philLink = "http://www.brainyquote.com" + link.attribs.href;
        var philName = link.children[0].data.replace(/\n/g, '');
        console.log("========Adding quotes from " + philName + "==========");
        philosopher(philLink, philName, function() {
          philsem.leave();
        });
      })
    })

  })
}

philosophers();
