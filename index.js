var path = require('path');
var spawn = require('child_process').spawn;
var headless = exports;

function findFreeServernum(servernum, callback) {
  path.exists('/tmp/.X' + servernum + '-lock', function(exists) {
    if(exists) {
      servernum++;
      findFreeServernum(servernum, callback);
      return;
    }
    callback(servernum);
  });
}

headless.startXvfb = function (startnum, callback) {
  if (!callback) {
    callback = startnum;
    startnum = 99;
  }

  findFreeServernum(startnum, function(servernum) {
    var childProcess = spawn('Xvfb', [':' + servernum]);
    // assume starting Xvfb takes less than 500 ms and continue if it hasn't
    // exited during that time
    var timeout = setTimeout(function() {
      callback(null, childProcess, servernum);
    }, 500);

    // if Xvfb exits prematurely the servernum wasn't valid.
    // Happens if there's already an X-server running on @servernum but no file was created in /tmp
    childProcess.on('exit', function() {
      clearTimeout(timeout);
      servernum++;
      headless.startXvfb(servernum, callback);
    });
  });
}
