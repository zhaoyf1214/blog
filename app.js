var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');
var multer = require('multer');

var routes = require('./routes/index');

var settings = require('./settings');

var fs = require('fs');
var accessLog = fs.createWriteStream('access.log',{flags: 'a'});
var errorLog = fs.createWriteStream('error.log', {flags: 'a'});

var app = express();


app.set('port', process.env.PORT || 8888);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(multer({
  dest:'./public/images',//上传路径
  rename: function (fieldname,filename){//修改原有文件的文件名（保持原有文件名不变）
    return filename;
  }
}));
app.use(flash());
//将log打印至终端
// app.use(logger('dev'));
//将log保存至文件access.log中
app.use(logger({stream: accessLog}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function (err, req, res, next) {
  var meta = '[' + new Date() + ']' + req.url + '\n';
  console.log('eeeeeeeeeee');
  errorLog.write(meta + err.stack + '\n');
  next();
});

app.use(session({
  secret: settings.cookieSecret,
  key: settings.db,//cookie name
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
  store: new MongoStore({
    db: settings.db,
    host: settings.host,
    port: settings.port
  })
}));

routes(app);
app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
})


module.exports = app;
