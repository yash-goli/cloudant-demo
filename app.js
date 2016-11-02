/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    user = require('./routes/user'),
    http = require('http'),
    path = require('path'),
    fs = require('fs');

var app = express();

var db;

var cloudant;

var fileToUpload;

var dbCredentials = {
    'dbName': 'tasks_db',
    'username': '97dd7a29-ac9b-443e-8fa1-fd57af804432-bluemix',
    'password': '12dd59f1901807991774297b9a2cba8efd5099127aa2cc1de1ea85281052a6f8',
    'host': '97dd7a29-ac9b-443e-8fa1-fd57af804432-bluemix.cloudant.com',
    'port': 443,
    'url': 'https://97dd7a29-ac9b-443e-8fa1-fd57af804432-bluemix:12dd59f1901807991774297b9a2cba8efd5099127aa2cc1de1ea85281052a6f8@97dd7a29-ac9b-443e-8fa1-fd57af804432-bluemix.cloudant.com'
};

var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var multipart = require('connect-multiparty')
var multipartMiddleware = multipart();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/style', express.static(path.join(__dirname, '/views/style')));

// development only
if ('development' == app.get('env')) {
    app.use(errorHandler());
}

function initDBConnection() {

    if (process.env.VCAP_SERVICES) {
        var vcapServices = JSON.parse(process.env.VCAP_SERVICES);
        // Pattern match to find the first instance of a Cloudant service in
        // VCAP_SERVICES. If you know your service key, you can access the
        // service credentials directly by using the vcapServices object.
        for (var vcapService in vcapServices) {
            if (vcapService.match(/cloudant/i)) {
                dbCredentials.host = vcapServices[vcapService][0].credentials.host;
                dbCredentials.port = vcapServices[vcapService][0].credentials.port;
                dbCredentials.user = vcapServices[vcapService][0].credentials.username;
                dbCredentials.password = vcapServices[vcapService][0].credentials.password;
                dbCredentials.url = vcapServices[vcapService][0].credentials.url;

                cloudant = require('cloudant')(dbCredentials.url);

                // check if DB exists if not create
                cloudant.db.create(dbCredentials.dbName, function(err, res) {
                    if (err) { console.log('could not create db ', err); }
                });

                db = cloudant.use(dbCredentials.dbName);
                break;
            }
        }
        if (db == null) {
            console.warn('Could not find Cloudant credentials in VCAP_SERVICES environment variable - data will be unavailable to the UI');
        }
    } else {
        // console.warn('VCAP_SERVICES environment variable not set - data will be unavailable to the UI');
        // For running this app locally you can get your Cloudant credentials
        // from Bluemix(VCAP_SERVICES in "cf env"
        //     output or the Environment Variables section
        //     for an app in the Bluemix console dashboard).
        // Alternately you could point to a local database here instead of a
        // Bluemix service.
        // dbCredentials.host = "REPLACE ME";
        // dbCredentials.port = REPLACE ME;
        // dbCredentials.user = "REPLACE ME";
        // dbCredentials.password = "REPLACE ME";
        // dbCredentials.url = "REPLACE ME";

        cloudant = require('cloudant')(dbCredentials.url);

        // check
        // if DB exists
        // if not create
        // cloudant.db.create(dbCredentials.dbName, function(err, res) {
        //     if (err) { console.log('could not create db ', err); }
        // });

        db = cloudant.use(dbCredentials.dbName);

        db.list(function(err, body) {
          if (!err)
            console.log(body);
        });

        db.view('givenmonth', 'given_month', function(err, body) {
          // if (!err) {
          body.rows.forEach(function(doc) {
              console.log(doc.key);
          });
          // }
          console.log(err);
        });
        db.viewWithList('givenmonth', 'given_month', 'my_list', function(err, body) {
              if (!err) {
                console.log(body);
              }
            });

        var createDatabase = function(callback) {
  console.log("Creating database '" + dbname  + "'");
  cloudant.db.create(dbname, function(err, data) {
    console.log("Error:", err);
    console.log("Data:", data);
    db = cloudant.db.use(dbname);
    callback(err, data);
  });
};

// create a document
var createDocument = function(callback) {
  console.log("Creating document 'mydoc'");
  // we are specifying the id of the document so we can update and delete it later
  db.insert({ _id: "mydoc", a:1, b: "two"}, function(err, data) {
    console.log("Error:", err);
    console.log("Data:", data);
    callback(err, data);
  });
};

// read a document
var readDocument = function(callback) {
  console.log("Reading document 'mydoc'");
  db.get("mydoc", function(err, data) {
    console.log("Error:", err);
    console.log("Data:", data);
    // keep a copy of the doc so we know its revision token
    doc = data;
    callback(err, data);
  });
};

// update a document
var updateDocument = function(callback) {
  console.log("Updating document 'mydoc'");
  // make a change to the document, using the copy we kept from reading it back
  doc.c = true;
  db.insert(doc, function(err, data) {
    console.log("Error:", err);
    console.log("Data:", data);
    // keep the revision of the update so we can delete it
    doc._rev = data.rev;
    callback(err, data);
  });
};

// deleting a document
var deleteDocument = function(callback) {
  console.log("Deleting document 'mydoc'");
  // supply the id and revision to be deleted
  db.destroy(doc._id, doc._rev, function(err, data) {
    console.log("Error:", err);
    console.log("Data:", data);
    callback(err, data);
  });
};

// deleting the database document
var deleteDatabase = function(callback) {
  console.log("Creating database '" + dbname  + "'");
  cloudant.db.destroy(dbname, function(err, data) {
    console.log("Error:", err);
    console.log("Data:", data);
    callback(err, data);
  });
};
    }
}

initDBConnection();

app.get('/', function (req, res) {
    var teams = {};
    var p = new Promise(function (resolve, reject) {
        db.list(function (err, body) {
            if (!err) {
                if (body.total_rows) {
                    resolve(body.rows);
                } 
            } else {
                reject(err);
            }
        });
    });
    
    p.then(function (data) {
        var map = data.map(function (item) {
            return new Promise(function (resolve, reject) {
                db.get(item.id, {revs_info: true}, function (err, doc) {
                    if (err) reject(err);
                    else {
                        var obj = {};
                        obj[doc.team_name] = doc.team;
                        resolve(obj);
                    }
                });
            });
        });
        Promise.all(map).then(function (objs) {
            res.render('index.html', { data: objs[0] });
        });
    }, function (data) {
        console.log(err);
    });
});

app.get('/api/v1/teams', function (req, res) {
    db.list(function (err, body) {
        if (!err) {
            if (body.total_rows) {
                body.rows.forEach(function (item) {
                    db.get(item.id, {revs_info: true}, function (err, doc) {
                        console.log(doc)
                    });
                });
            }
        }
    });
});

app.post('/api/v1/tasks/create', function (req, res) {
    db.insert(data, data.id, function (err, body) {
        if (!err) {
            res.send(body);
        } 
    });
});

http.createServer(app).listen(app.get('port'), '0.0.0.0', function() {
    console.log('Express server listening on port ' + app.get('port'));
});
