var express = require('express');
var path = require('path');
//var http = require('http');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var solrQueryBuilder = require('solr-query-builder');
var solrClient = require('solr-client');

var router = express.Router();

var path = __dirname + '/pages/';
var clients = [];
var solr_host = "hdpmaster02.ecubecenter.net";
var solr_port = 8983;
var solr_core = "/solr";
var solr_collection = "Rio2016";

router.use('/', function (req, res, next) {
    console.log('/', + req.method);
    next();
});

router.get('/', function (req, res) {
    res.sendFile(path + 'index.html');
});

app.use('/', router);

// ---- socket ------------------------------------

io.sockets.on('connection', function (socket) {
    var address = socket.handshake.address;
    console.info('Client connesso con ip ' + address);
    clients.push(socket);

    socket.on('query', function(query2) {
    var qb = new solrQueryBuilder();
    cltSolr = solrClient.createClient(solr_host, solr_port, solr_collection, solr_core);
        //var query = 'q=*%3A*&rows=0&wt=json&indent=true';
        console.log(query2);
        qb.any({
            text_t: query2
        }, {contains: true});
        var query = cltSolr.createQuery().q(qb.build()).start(0).rows(10);
        console.log(query);
        cltSolr.get('select', query, function(err, obj){
            if(err){
                console.log(err);
            }else{
                var result = JSON.parse(JSON.stringify(obj));
                console.log(result.response);
            }
        });
        var query2 = '';
        var qb = '';
    });
    socket.on('disconnect', function() {
        var index = clients.indexOf(socket);
        if (index != -1) {
            clients.splice(index, 1);
            console.info('Client con ip ' + address + ' disconnesso!!! ');
        }
    });
});


http.listen(8090);

