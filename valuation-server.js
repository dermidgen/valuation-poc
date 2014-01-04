var http    = require('http'),
    express = require('express'),
    app     = express();

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

app.get('/propertySearch', function(req, res) {
	var uri = "http://www.zillow.com/webservice/GetSearchResults.htm?zws-id="+zwid+
			"&address="+req.query.address+"&citystatezip="+req.query.citystatezip;

	console.log(encodeURIComponent(uri));

	http.get("http://www.google.com/index.html", function(res) {
		console.log("Got response: " + res.statusCode);
	}).on('error', function(e) {
		console.log("Got error: " + e.message);
	});

	http.get(encodeURIComponent(uri), function(res){
		console.log(res);
	    res.status(200).set('Content-Type', 'text/html').send('ok');
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

