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
    dbName: 'my_sample_db'
};

var DB = {
    team: 'master_db',
    task: 'tasks_db'
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

                // // check if DB exists if not create
                // cloudant.db.create(dbCredentials.dbName, function(err, res) {
                //     if (err) { console.log('could not create db ', err); }
                // });

                //db = cloudant.use(dbCredentials.dbName);
                break;
            }
        }
        // if (db == null) {
        //     console.warn('Could not find Cloudant credentials in VCAP_SERVICES environment variable - data will be unavailable to the UI');
        // }
    } else {
        console.warn('VCAP_SERVICES environment variable not set - data will be unavailable to the UI');
        // For running this app locally you can get your Cloudant credentials 
        // from Bluemix (VCAP_SERVICES in "cf env" output or the Environment 
        // Variables section for an app in the Bluemix console dashboard).
        // Alternately you could point to a local database here instead of a 
        // Bluemix service.
        //dbCredentials.host = "REPLACE ME";
        //dbCredentials.port = REPLACE ME;
        //dbCredentials.user = "REPLACE ME";
        //dbCredentials.password = "REPLACE ME";
        dbCredentials.url = "https://97dd7a29-ac9b-443e-8fa1-fd57af804432-bluemix:12dd59f1901807991774297b9a2cba8efd5099127aa2cc1de1ea85281052a6f8@97dd7a29-ac9b-443e-8fa1-fd57af804432-bluemix.cloudant.com";

        cloudant = require('cloudant')(dbCredentials.url);

        // check if DB exists if not create
        //cloudant.db.create(dbCredentials.dbName, function (err, res) {
        //    if (err) { console.log('could not create db ', err); }
        //});
    }
}

initDBConnection();

function myAsync(fn) {
    var promise = new Promise(fn);
    return promise;
}

function getTasks(req, res) {
    var start_date, end_date, now;
    var db = cloudant.use(DB.task);
    var params = req.query;
    var excludeDesginDoc = function(data) {
        return data.filter(function(item) {
            return !~item.id.indexOf('_design');
        });
    };

    myAsync(function(success, error) {
        db.view('getData', 'get-data',function(err, body) {
            if (err) error(err);
            else {
                success(body.rows);
            }
        });
    }).then(function(data) {
        return data.map(function(item) {
            delete item.value._id;
            delete item.value._rev;
            return item.value;
        });
    }).then(function(data) {
        if (!(params.hasOwnProperty('is_admin') && params.is_admin === 'true')) {
            if (params.hasOwnProperty('lan_id')) {
                data = data.filter(function(item) {
                    return params.lan_id === item.lan_id;
                });

                if (params.hasOwnProperty('date')) {
                    now = new Date(params.date);
                    data = data.filter(function(item) {
                        var date = new Date(item.date);
                        return params.lan_id === item.lan_id && +now === +date;
                    });
                }
            } else {
                res.status(404).send({'error': 'data not available'})
            }
        }

        if (params.hasOwnProperty('start_date') && params.hasOwnProperty('end_date')) {
            start_date = new Date(params.start_date);
            end_date = new Date(params.end_date);
            data = data.filter(function(item) {
                var date = new Date(item.date);
                return start_date <= date && end_date >= date;
            });
        }
        res.send(data);
    }).catch(function(data) {
        console.log(data);
    });
}

function createTasks(req, res) {
    var db = cloudant.use(DB.task);
    var tasks = req.body;
    var map = tasks.tasks.map(function(item) {
        return myAsync(function(success, error) {
            db.insert(item, function(err, body) {
                if (err) error(err);
                else success(body);
            });
        });
    });
    Promise.all(map).then(function(data) {
        res.send(data);
    }, function(data) {
        console.log(data);
    });
}

function addTeamTasks(req, res) {
    var db = cloudant.use(DB.team);
    var data = req.body;
    var type = req.route.path.split('/').slice(-1)[0];

    myAsync(function(success, error) {
        db.get('thinksters', function(err, body) {
            if (err) error(err);
            else success(body);
        });
    }).then(function(team) {
        if (type === 'team') {
            team.team.push(data);
        } else {
            team.standard_tasks.push(data.name);
        }
        return myAsync(function(success, error) {
            db.insert(team, function(err, obj) {
                if (err) error(err);
                else success(obj);
            });
        });
    }, function(data) {
        console.log(data);
    }).then(function(data) {
        res.send(data);
    }, function(data) {
        console.log(data);
    });
}

function indexPage(req, res) {
    var teams = {};
    var db = cloudant.use(DB.team);
    myAsync(function(resolve, reject) {
        db.view('teamData', 'team-data',function(err, body) {
            if (err) reject(err);
            else {
                resolve(body.rows[0]);
            }
        });
    }).then(function(data) {
        data = data.value;
        delete data._id;
        delete data._rev;
        res.render('index.html', { data: data });
    }, function(data) {
        console.log(err);
    });
}

app.get('/', indexPage);
app.get('/api/v1/tasks', getTasks);
app.post('/api/v1/tasks/create', createTasks);
app.post('/api/v1/add/task', addTeamTasks);
app.post('/api/v1/add/team', addTeamTasks);

http.createServer(app).listen(app.get('port'), '0.0.0.0', function() {
    console.log('Express server listening on port ' + app.get('port'));
});
