var express       = require('express');
var exitLogRouter = require('./ExitLogRouter');

var backend = express();

//to serve static files such as images, CSS files, and JavaScript files
backend.use('/exitlog_dev', express.static('frontend'));
//mount route handler
backend.use('/exitlog_dev', exitLogRouter);

backend.listen(3000, () => {
    console.log('exitlog_dev backend is listening on port 3000!');
});