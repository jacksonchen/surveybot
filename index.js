var Nightmare = require('nightmare');
var sem = require('semaphore')(5);
var counter = 1;
var n = 10000; // Change iterations here

var yolo = function(sem) {
  var nightmare = new Nightmare()
    .goto("https://docs.google.com/forms/d/1kkBTU_DWRGD2fKkDPhKDxQEjPRIwjjFnmmF_NJf0LV8/viewform")
    .click('span.ss-choice-item-control input[id="group_1494608824_7"]')
    .click('input[type="submit"]')
    .run(function(err, nightmare) {
      if (err) return console.log(err);
      console.log("Submitted " + counter + " times!");
      counter = counter + 1;
      if (counter == (n)) {
        console.log("exiting")
        process.exit();
      }
      // setTimeout(function() {
        sem.leave();
      // }, 50);
    })
    .end();
}

for (var i = 1; i < n; i++) {
  sem.take(function() {
    yolo(sem);
  });
}
