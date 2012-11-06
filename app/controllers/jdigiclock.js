var http = require('http');
var xml2js = require('xml2js');

exports.proxy = function(req, res, next) {

	var location = req.query.location;
	var metric = Number(req.query.metric);
	var parser = new xml2js.Parser();
	
	var options = {
	  host: 'wwwa.accuweather.com',
	  port: 80,
	  path: '/adcbin/forecastfox/weather_data.asp?location='+location+'&metric='+metric
	};

	http.get(options, function(response) {
		var resBody = '';
	  	response.on('data', function (chunk) {
			resBody += chunk;
	  	});
	  	response.on('end', function () {

	    	parser.parseString(resBody, function (err, result) {

		        var xml = result['adc_database'];
		        var weather = {};
		    	weather['city']      = xml.local[0].city[0];
				weather['curr_temp'] = Number(xml.currentconditions[0].temperature[0]);
				weather['curr_text'] = xml.currentconditions[0].weathertext[0];
				weather['curr_icon'] = Number(xml.currentconditions[0].weathericon[0]);
				
				var day = 5;
				weather['forecast'] = [];
				for (var i = 0; i < day; i++) {
					weather['forecast'][i] = {};
				    weather['forecast'][i]['day_date']  = xml.forecast[0].day[i].obsdate[0];
				    weather['forecast'][i]['day_text']  = xml.forecast[0].day[i].daytime[0].txtshort[0];
				    weather['forecast'][i]['day_icon']  = Number(xml.forecast[0].day[i].daytime[0].weathericon[0]);
				    weather['forecast'][i]['day_htemp'] = Number(xml.forecast[0].day[i].daytime[0].hightemperature[0]);
				    weather['forecast'][i]['day_ltemp'] = Number(xml.forecast[0].day[i].daytime[0].lowtemperature[0]);
				}
				res.json( weather );
		    });
	  	});
	});
};