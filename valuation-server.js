var http    = require('http'),
    express = require('express'),
    app     = express(),
    libxmljs= require('libxmljs');

var zwid = 'X1-ZWz1dp4jgzyih7_axb7v';

app.configure(function() {

    // simple logger
    app.use(function(req, res, next){
    	console.log('%s %s', req.method, req.url);
	    next();
    });

    app.use(express.compress());
    // app.use(express.cookieParser('xxx secret'));
    // app.use(express.cookieSession());
    // app.use(express.bodyParser());
    // app.use(app.router);

});

app.get('/propertySearch', function(req, client) {
	var ec = encodeURIComponent;
	var q = "?zws-id="+ec(zwid)+"&address="+ec(req.query.address)+
								"&citystatezip="+ec(req.query.citystatezip);
	var options = {
	  host: 'www.zillow.com',
	  path: '/webservice/GetSearchResults.htm' + q
	};

	var req = http.get(options, function(res) {
	  console.log('STATUS: ' + res.statusCode);
	  console.log('HEADERS: ' + JSON.stringify(res.headers));

	  // Buffer the body entirely for processing as a whole.
	  var bodyChunks = [];
	  res.on('data', function(chunk) {
	    // You can process streamed parts here...
	    bodyChunks.push(chunk);
	  }).on('end', function() {
	    var body = Buffer.concat(bodyChunks);
	    console.log('BODY: ' + body);

	    var xmlDoc = libxmljs.parseXml(body);
	    var out = JSON.stringify(xmlDoc);

	    client.status(200).set('Content-Type', 'text/html').send(out);

	    // ...and/or process the entire body here.
	  })
	});

	req.on('error', function(e) {
	  console.log('ERROR: ' + e.message);
	  client.status(200).set('Content-Type', 'text/html').send('fail');
	});
});

app.get('/propertyDetail', function(req, res) {
	var uri = "http://www.zillow.com/webservice/GetZestimate.htm?zws-id="+zwid+"&zpid="+req.query.zpid;

	http.get(encodeURIComponent(uri), function(res){
		console.log(res);
	    res.status(200).set('Content-Type', 'text/html').send('ok');
	});
});


var server = http.createServer(app);
server.listen(8080);
module.exports = server;

