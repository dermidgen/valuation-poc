var http    = require('http'),
	https    = require('https'),
    express = require('express'),
    app     = express(),
    xml2js	= require('xml2js'),
    mailtemp= require('./autoresponse.json'),
    nano	= require('nano')('http://localhost:5984');

var parser = new xml2js.Parser();
var zwid = 'X1-ZWz1dp4jgzyih7_axb7v';

var properties = nano.use('properties');

var cacheProperty = function(property) {
	console.log('caching property',property.zpid);
	properties.get(property.zpid[0], function(err, body){
		if (err) {
			console.log('creating new property record')
			properties.insert(property, property.zpid[0], function(err, body){
				if (!err) console.log('property cached');
				else console.log('error caching property');
			});
		} else {
			console.log('property exists');
			// TODO: update property
		}
	})
}

var saveLead = function() {

};

var sendMail = function(){

	console.log('sending autoresponse');

	var post_data = (JSON.stringify(mailtemp));

	var options = {
		host: 'mandrillapp.com',
		port: 443,
		path: '/api/1.0/messages/send.json',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
        	'Content-Length': post_data.length
		}
	};

	var req = https.request(options, function(res){
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
		  console.log('Response: ' + chunk);
		});
	});
	req.write(post_data);
	req.end();
};

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
	  // console.log('STATUS: ' + res.statusCode);
	  // console.log('HEADERS: ' + JSON.stringify(res.headers));

	  var bodyChunks = [];
	  res.on('data', function(chunk) {
	    bodyChunks.push(chunk);
	  }).on('end', function() {
	    var body = Buffer.concat(bodyChunks);
		parser.parseString(body, function (err, result) {
		    // console.dir(result);
		    var property = result["SearchResults:searchresults"].response[0].results[0].result[0]
		    cacheProperty(property);

		    client.status(200).set('Content-Type', 'text/html').send(result);
		    sendMail();
		    console.log('Done');
		});
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

