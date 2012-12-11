/*
 * jDigiClock plugin 2.1
 *
 * http://www.radoslavdimov.com/jquery-plugins/jquery-plugin-digiclock/
 *
 * Copyright (c) 2009 Radoslav Dimov
 *
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */


(function($) {
    $.fn.extend({

        jdigiclock: function(options) {

            var defaults = {
                clockImagesPath: 'img/jdigiclock/clock/',
                weatherImagesPath: 'img/jdigiclock/weather/',
                lang: 'en',
                am_pm: false,
                weatherLocationCode: 'EUR|BG|BU002|BOURGAS',
                weatherMetric: 'C',
                weatherUpdate: 0,
                proxyType: 'php',
                proxyUrl: '',
                dayCallback: null,
                loadedCallback: null
            };

            var regional = [];
            regional['en'] = {
                monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
            }


            var options = $.extend(defaults, options);

            return this.each(function() {
                
                var $this = $(this);
                var o = options;
                $this.clockImagesPath = o.clockImagesPath;
                $this.weatherImagesPath = o.weatherImagesPath;
                $this.lang = regional[o.lang] == undefined ? regional['en'] : regional[o.lang];
                $this.am_pm = o.am_pm;
                $this.weatherLocationCode = o.weatherLocationCode;
                $this.weatherMetric = o.weatherMetric == 'C' ? 1 : 0;
                $this.weatherUpdate = o.weatherUpdate;
                $this.proxyType = o.proxyType;
                $this.proxyUrl = o.proxyUrl;
                $this.dayCallback = o.dayCallback;
                $this.loadedCallback = o.loadedCallback;
                $this.currDate = '';
                $this.timeUpdate = '';


                var html = '<div class="jdigiclock_plugin_container">';
                html    += '<div class="jdigiclock_digital_container">';
                html    += '<div class="jdigiclock_clock"></div>';
                html    += '<div class="jdigiclock_weather"></div>';
                html    += '</div>';
                html    += '<div class="jdigiclock_forecast_container"></div>';
                html    += '</div>';

                $this.html(html);

                $this.displayClock($this);

                $this.displayWeather($this);               

                var panel_pos = ($('.jdigiclock_plugin_container > div').length - 1) * 500;
            });
        }
    });

    $.fn.displayClock = function(el) {
        $.fn.getTime(el);
        setTimeout(function() {$.fn.displayClock(el)}, $.fn.delay());
    }

    $.fn.displayWeather = function(el) {
        $.fn.getWeather(el);
        if (el.weatherUpdate > 0) {
            setTimeout(function() {$.fn.displayWeather(el)}, (el.weatherUpdate * 60 * 1000));
        }
    }

    $.fn.delay = function() {
        var now = new Date();
        var delay = (60 - now.getSeconds()) * 1000;
        
        return delay;
    }

    $.fn.getTime = function(el) {
        var now = new Date();
        var old = new Date();
        old.setTime(now.getTime() - 60000);
        
        var now_hours, now_minutes, old_hours, old_minutes, timeOld = '';
        now_hours =  now.getHours();
        now_minutes = now.getMinutes();
        old_hours =  old.getHours();
        old_minutes = old.getMinutes();

        if (el.am_pm) {
            var am_pm = now_hours > 11 ? 'pm' : 'am';
            now_hours = ((now_hours > 12) ? now_hours - 12 : now_hours);
            old_hours = ((old_hours > 12) ? old_hours - 12 : old_hours);
        } 

        now_hours   = ((now_hours <  10) ? "0" : "") + now_hours;
        now_minutes = ((now_minutes <  10) ? "0" : "") + now_minutes;
        old_hours   = ((old_hours <  10) ? "0" : "") + old_hours;
        old_minutes = ((old_minutes <  10) ? "0" : "") + old_minutes;
        // date
        el.currDate = el.lang.dayNames[now.getDay()] + ',&nbsp;' + now.getDate() + '&nbsp;' + el.lang.monthNames[now.getMonth()];
        // time update
        el.timeUpdate = el.currDate + ',&nbsp;' + now_hours + ':' + now_minutes;

        var firstHourDigit = old_hours.substr(0,1);
        var secondHourDigit = old_hours.substr(1,1);
        var firstMinuteDigit = old_minutes.substr(0,1);
        var secondMinuteDigit = old_minutes.substr(1,1);
        
        timeOld += '<div class="jdigiclock_hours"><div class="line"></div>';
        timeOld += '<div class="jdigiclock_hours_bg"><img src="' + el.clockImagesPath + 'clockbg1.png" /></div>';
        timeOld += '<img src="' + el.clockImagesPath + firstHourDigit + '.png" class="jdigiclock_fhd first_digit" />';
        timeOld += '<img src="' + el.clockImagesPath + secondHourDigit + '.png" class="jdigiclock_shd second_digit" />';
        timeOld += '</div>';
        timeOld += '<div class="jdigiclock_minutes"><div class="line"></div>';
        if (el.am_pm) {
            timeOld += '<div class="jdigiclock_am_pm"><img src="' + el.clockImagesPath + am_pm + '.png" /></div>';
        }
        timeOld += '<div class="jdigiclock_minutes_bg"><img src="' + el.clockImagesPath + 'clockbg1.png" /></div>';
        timeOld += '<img src="' + el.clockImagesPath + firstMinuteDigit + '.png" class="jdigiclock_fmd first_digit" />';
        timeOld += '<img src="' + el.clockImagesPath + secondMinuteDigit + '.png" class="jdigiclock_smd second_digit" />';
        timeOld += '</div>';

        el.find('.jdigiclock_clock').html(timeOld);

        // set minutes
        if (secondMinuteDigit != '9') {
            firstMinuteDigit = firstMinuteDigit + '1';
        }

        if (old_minutes == '59') {
            firstMinuteDigit = '511';
        }

        setTimeout(function() {
            $('.jdigiclock_fmd').attr('src', el.clockImagesPath + firstMinuteDigit + '-1.png');
            $('#minutes_bg img').attr('src', el.clockImagesPath + 'clockbg2.png');
        },200);
        setTimeout(function() { $('.jdigiclock_minutes_bg img').attr('src', el.clockImagesPath + 'clockbg3.png')},250);
        setTimeout(function() {
            $('.jdigiclock_fmd').attr('src', el.clockImagesPath + firstMinuteDigit + '-2.png');
            $('.jdigiclock_minutes_bg img').attr('src', el.clockImagesPath + 'clockbg4.png');
        },400);
        setTimeout(function() { $('.jdigiclock_minutes_bg img').attr('src', el.clockImagesPath + 'clockbg5.png')},450);
        setTimeout(function() {
            $('.jdigiclock_fmd').attr('src', el.clockImagesPath + firstMinuteDigit + '-3.png');
            $('.jdigiclock_minutes_bg img').attr('src', el.clockImagesPath + 'clockbg6.png');
        },600);

        setTimeout(function() {
            $('.jdigiclock_smd').attr('src', el.clockImagesPath + secondMinuteDigit + '-1.png');
            $('.jdigiclock_minutes_bg img').attr('src', el.clockImagesPath + 'clockbg2.png');
        },200);
        setTimeout(function() { $('.jdigiclock_minutes_bg img').attr('src', el.clockImagesPath + 'clockbg3.png')},250);
        setTimeout(function() {
            $('.jdigiclock_smd').attr('src', el.clockImagesPath + secondMinuteDigit + '-2.png');
            $('.jdigiclock_minutes_bg img').attr('src', el.clockImagesPath + 'clockbg4.png');
        },400);
        setTimeout(function() { $('.jdigiclock_minutes_bg img').attr('src', el.clockImagesPath + 'clockbg5.png')},450);
        setTimeout(function() {
            $('.jdigiclock_smd').attr('src', el.clockImagesPath + secondMinuteDigit + '-3.png');
            $('.jdigiclock_minutes_bg img').attr('src', el.clockImagesPath + 'clockbg6.png');
        },600);

        setTimeout(function() {$('.jdigiclock_fmd').attr('src', el.clockImagesPath + now_minutes.substr(0,1) + '.png')},800);
        setTimeout(function() {$('.jdigiclock_smd').attr('src', el.clockImagesPath + now_minutes.substr(1,1) + '.png')},800);
        setTimeout(function() { $('.jdigiclock_minutes_bg img').attr('src', el.clockImagesPath + 'clockbg1.png')},850);

        // set hours
        if (now_minutes == '00') {
           
            if (el.am_pm) {
                if (now_hours == '00') {                   
                    firstHourDigit = firstHourDigit + '1';
                    now_hours = '12';
                } else if (now_hours == '01') {
                    firstHourDigit = '001';
                    secondHourDigit = '111';
                } else {
                    firstHourDigit = firstHourDigit + '1';
                }
            } else {
                if (now_hours != '10') {
                    firstHourDigit = firstHourDigit + '1';
                }

                if (now_hours == '20') {
                    firstHourDigit = '1';
                }

                if (now_hours == '00') {
                    firstHourDigit = firstHourDigit + '1';
                    secondHourDigit = secondHourDigit + '11';
                }
            }

            setTimeout(function() {
                $('.jdigiclock_fhd').attr('src', el.clockImagesPath + firstHourDigit + '-1.png');
                $('.jdigiclock_hours_bg img').attr('src', el.clockImagesPath + 'clockbg2.png');
            },200);
            setTimeout(function() { $('.jdigiclock_hours_bg img').attr('src', el.clockImagesPath + 'clockbg3.png')},250);
            setTimeout(function() {
                $('.jdigiclock_fhd').attr('src', el.clockImagesPath + firstHourDigit + '-2.png');
                $('.jdigiclock_hours_bg img').attr('src', el.clockImagesPath + 'clockbg4.png');
            },400);
            setTimeout(function() { $('.jdigiclock_hours_bg img').attr('src', el.clockImagesPath + 'clockbg5.png')},450);
            setTimeout(function() {
                $('.jdigiclock_fhd').attr('src', el.clockImagesPath + firstHourDigit + '-3.png');
                $('.jdigiclock_hours_bg img').attr('src', el.clockImagesPath + 'clockbg6.png');
            },600);

            setTimeout(function() {
            $('.jdigiclock_shd').attr('src', el.clockImagesPath + secondHourDigit + '-1.png');
            $('.jdigiclock_hours_bg img').attr('src', el.clockImagesPath + 'clockbg2.png');
            },200);
            setTimeout(function() { $('.jdigiclock_hours_bg img').attr('src', el.clockImagesPath + 'clockbg3.png')},250);
            setTimeout(function() {
                $('.jdigiclock_shd').attr('src', el.clockImagesPath + secondHourDigit + '-2.png');
                $('.jdigiclock_hours_bg img').attr('src', el.clockImagesPath + 'clockbg4.png');
            },400);
            setTimeout(function() { $('.jdigiclock_hours_bg img').attr('src', el.clockImagesPath + 'clockbg5.png')},450);
            setTimeout(function() {
                $('.jdigiclock_shd').attr('src', el.clockImagesPath + secondHourDigit + '-3.png');
                $('.jdigiclock_hours_bg img').attr('src', el.clockImagesPath + 'clockbg6.png');
            },600);

            setTimeout(function() {$('.jdigiclock_fhd').attr('src', el.clockImagesPath + now_hours.substr(0,1) + '.png')},800);
            setTimeout(function() {$('.jdigiclock_shd').attr('src', el.clockImagesPath + now_hours.substr(1,1) + '.png')},800);
            setTimeout(function() { $('.jdigiclock_hours_bg img').attr('src', el.clockImagesPath + 'clockbg1.png')},850);
        }
    }

    $.fn.getWeather = function(el) {

        el.find('.jdigiclock_weather').html('<p class="loading">Update Weather ...</p>');
        el.find('.jdigiclock_forecast_container').html('<p class="loading">Update Weather ...</p>');
        var metric = el.weatherMetric == 1 ? 'C' : 'F';
        var proxy = '';

        if (el.proxyUrl != '') {
            proxy = el.proxyUrl;
        } else {
            switch (el.proxyType) {
                case 'php':
                    proxy = 'lib/proxy/php/proxy.php';
                break;
                case 'asp':
                    proxy = 'lib/proxy/asp/WeatherProxy.aspx';
                break;
            }
        }
        var url = proxy + '?location=' + el.weatherLocationCode + '&metric=' + el.weatherMetric;
        $.getJSON(url, function(data) {

            el.find('.jdigiclock_weather .loading, .jdigiclock_forecast_container .loading').hide();

            var curr_temp = ''; //<p class="temp">' + data.curr_temp + '&deg;<span class="metric">' + metric + '</span></p>';

            // el.find('.jdigiclock_weather').css('background','url(' + el.weatherImagesPath + data.curr_icon + '.png) 50% 100% no-repeat');
            // var weather = '<div id="local"><p class="city">' + data.city + '</p><p>' + data.curr_text + '</p></div>';
            if (el.dayCallback) {
                el.dayCallback(el.currDate);
            }
            /*var weather = '<div id="temp"><p id="date">' + el.currDate + '</p>' + curr_temp + '</div>';
            el.find('.jdigiclock_weather').html(weather);*/

            // forecast
            /*el.find('.jdigiclock_forecast_container').append('<div id="current"></div>');
            var curr_for = curr_temp + '<p class="high_low">' + data.forecast[0].day_htemp + '&deg;&nbsp;/&nbsp;' + data.forecast[0].day_ltemp + '&deg;</p>';
            curr_for    += '<p class="city">' + data.city + '</p>';
            curr_for    += '<p class="text">' + data.forecast[0].day_text + '</p>';
            el.find('#current').css('background','url(' + el.weatherImagesPath + data.forecast[0].day_icon + '.png) 50% 0 no-repeat').append(curr_for);*/

            el.find('.jdigiclock_forecast_container').append('<div class="forecast-hit"></div>');
            //data.forecast.shift();
            for (var i in data.forecast) {
                var d_date = new Date(data.forecast[i].day_date);
                var day_name = el.lang.dayNames[d_date.getDay()];
                var forecast = (i === "0") ? '<div class="hit-icon hit-current-day">' : '<div class="hit-icon">';
                forecast    += '<p>' + day_name + '</p>';
                forecast    += '<img src="' + el.weatherImagesPath + data.forecast[i].day_icon + '.png" alt="' + data.forecast[i].day_text + '" title="' + data.forecast[i].day_text + '" />';
                forecast    += '<p>' + data.forecast[i].day_htemp + '&deg;&nbsp;/&nbsp;' + data.forecast[i].day_ltemp + '&deg;</p>';
                forecast    += '</div>';
                el.find('.forecast-hit').append(forecast);
            }

            /*el.find('.jdigiclock_forecast_container').append('<div id="update"><img src="img/jdigiclock/refresh_01.png" alt="reload" title="reload" id="reload" />' + el.timeUpdate + '</div>');

            $('#reload').click(function() {
                el.find('.jdigiclock_weather').html('');
                el.find('.jdigiclock_forecast_container').html('');
                $.fn.getWeather(el);
            });*/

            if (el.loadedCallback) {
                el.loadedCallback();
            }
        });
    }

})(jQuery);