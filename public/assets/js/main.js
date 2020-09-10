
$(document).ready(function () {

    /*EVENT LISTENERS*/
    document.getElementById("btnNxtForecast").addEventListener('click', displayNextDaysForecast); //add listener for the button pressed
    document.getElementById('btnMnSearch').addEventListener('click', manualSearch); //add listener to manual search button

    //add listener to manual metric and
    document.getElementById('tMetric').addEventListener('click', toggleUnits);
    document.getElementById('tImperial').addEventListener('click', toggleUnits);
    /***VARIABLES AND REFERENCES***/

    var time, hh, mm; //variable time hours and minutes
    var timer = ""; //reference variable for the timeout object
    var backdropTimer = ""; //backdrop timer(interval) variable reference
    var clockDisplay = $('#clockDisplay'); //reference variable for the clock display
    var dateDisplay = $('#dateDisplay'); //date display
    var locationDisplay = $('#curLocationDisplay'); //current location display
    var location = ""; //location variable city,country
    var countryCode = ""; // country code
    var zipCode = ""; // zip code
    var weatherDisplay = $('#weather-data'); //weather display
    var tempDisplay = $('#tempDisplay'); //temperature display
    var humidDisplay = $('#humidDisplay'); //humidity display
    var windDisplay = $('#windDisplay'); //wind speed display
    var longitude = ''; //map coordinate of user location
    var latitude = ''; //map coordinate of user location
    var weatherTimer = ''; //used in function timeout and intervals
    var intervalStarted = false; //used to determine if the local weather check has started(checks every minute atm)

    var body = $('body'); //ref variable, for the page body, used in setting the right backdrop

    var localWeatherData = ''; //object holder for local weather data
    var forecastTimer = ''; //ref variable for forecast timeout/interval(id)
    var forecastIntervalStarted = false; //ref variable for forecast start update check
    var forecastItems = []; //array - holds the forecast data objects
    var btnNxtForecast = $('#btnNxtForecast'); //ref variable, button to show the next days forecast
    var nxtForecastContainer = $('#nextForecast-container'); //ref variable, container for the forecast list items
    var nxtForecastContents = $('#nxt-forecast-contents'); //container for the next days forecast data

    var chckboxMISystem = $('#chckMISystem'); // checkbox/toggle for unit system(metric/imperial)
    var units = 'metric'; // unit system

    var txtBoxZip = $('#txtBoxZCode');
    var txtBoxCountry = $('#txtBoxCCode');


    /**Static values for conversion and lookup**/
    var backdrops = { dawn: 'backdrop-dawn', morning: 'backdrop-morning', mid: 'backdrop-midday', dusk: 'backdrop-dusk', night: 'backdrop-night' }; //backdrop class list
    var months = { 0: 'Jan', 1: 'Feb', 2: 'Mar', 3: 'Apr', 4: 'May', 5: 'Jun', 6: 'Jul', 7: 'Aug', 8: 'Sept', 9: 'Oct', 10: 'Nov', 11: 'Dec' }; //list of months in a year
    /*
    * GET THE CURRENT TIME ON WHEN THE PAGE LOAD
    * GET CURRENT LOCATION BASE ON IP(IP-API)
    *
    */
    initAll(); //initialise all necessary functions

    /*
    * Initialization
    * start clock
    * get current location base on ip
    * get local weather
    */
    function initAll()
    {
        resetClockTimer(); //reset timeout object if any
        resetWeatherTimer(); //reset weather timeout/intervals
        getCurrentLocation(); //get location via html 5 geolocate/ip-api
        startClock(); // start a new timeout and get the current time
        getLocalWeather(); //get local weather data
        //getNextDaysForecast(false); //get local weather forecast for the next few days
    }

    /**Get location**/
    /*
                       * use geolocation otherwise
                       * use manual search by clicking the cogwheel
                       */
    function getCurrentLocation()
    {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(displayCurrentLocation, errorHandling);
        } else {
            locationDisplay.text('browser support N/A');
            console.log("Geolocation is not supported by this browser.");
        }
    }

    /*
      * update and display the users current location
      */
    function displayCurrentLocation(data)
    {
        if (data['status'] === 'success')
        {
            location = data['city'] + ', ' + data['country'];
            zipCode = data['zip'];
            longitude = data['lon'];
            latitude = data['lat'];
            countryCode = data['countryCode'];
        } else
        if (data['cod'] == '200')
        {
            if (data.hasOwnProperty('city'))
            {
                location = data['city']['name'] + ', ' + data['city']['country'];
            } else

            {
                location = data['name'] + ', ' + data['sys']['country'];
            }

        } else
        if (data && data.coords !== null)
        {

            if (longitude === '' && latitude === '') {
                console.log(data.coords.longitude);
                longitude = data.coords.longitude;
                latitude = data.coords.latitude;
            }
        } else

        {
            location = 'Location unavailable';
        }
        locationDisplay.text(location);
    }

    /*GET THE CURRENT TIME*/

    function startClock()
    {
        timer = setTimeout(updateClockDisplay, 500); //start clock
        setBackdrop(); //set backdrop on page load
        backdropTimer = setTimeout(setBackdrop, 360000); //set interval to check for the right backdrop every hour
    }

    /*
      * Reset timer and clear the interval by its ID
      */
    function resetClockTimer()
    {
        updateClockDisplay(); //make sure the current time is display when page load

        if (timer !== "")
        {
            clearTimeout(backdropTimer);
            clearTimeout(timer);
            timer = "";
        }
    }

    /*
      * Reset timer and clear the interval by its ID
      */
    function resetWeatherTimer()
    {
        if (weatherTimer !== "")
        {
            clearTimeout(forecastTimer);
            clearTimeout(weatherTimer);
            weatherTimer = "";
            forecastTimer = "";
        }
    }

    /*
      * Get the current time by Date object
      */
    function getTime()
    {
        time = new Date();

        hh = time.getHours();
        mm = time.getMinutes();

        displayCurrentDate(time); //update current date display

        return (hh < 10 ? '0' + hh : hh) + ':' + (mm < 10 ? '0' + mm : mm);
    }

    /*
      * Get current date and update display
      * format: MM, dd YYYY
      */
    function displayCurrentDate(date)
    {
        dateDisplay.text( date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear());
    }

    /*
      * Update clock display
      *
      */
    function updateClockDisplay()
    {
        clockDisplay.text(getTime());
        timer = setTimeout(updateClockDisplay, 500); //set another timeout to update the clock display
    }

    /*
      * Get local weather
      * send api request to get local weather
      * param - country code and zip code
      */
    function getLocalWeather()
    {
        if (latitude === '' && longitude === '')
        {
            weatherTimer = setTimeout(getLocalWeather, 60000);
            return;
        } else

        {
            clearTimeout(weatherTimer);

            if (!intervalStarted)
            {
                weatherTimer = setTimeout(getLocalWeather, 60000);
                intervalStarted = true;
            }
        }

        $.getJSON('https://lying-stream.glitch.me/api/weather', { coords: { lat: latitude, lon: longitude } }, function (data) {console.log(data);}).done(storeLocalWeatherData).fail(errorHandling);
        weatherTimer = setTimeout(getLocalWeather, 60000);
    }

    /*
      * Manually search for weather data
      * using ZIP-code and Country-Code
      */
    function manualSearch(event)
    {
        event.stopPropagation(); //stops dropdown-menu from closing

        resetWeatherTimer();

        zipCode = txtBoxZip.val();
        countryCode = txtBoxCountry.val();
        location = zipCode.trim() + ',' + countryCode.trim();

        if (zipCode !== '' && countryCode !== '')
        {
            getNextDaysForecast(true);
        }
    }

    /*
      * Get forecast data for the next few days
      * Call api to get forecast data
      * data will be listed below the todays current weather forecast(user clicks how does tomorrow looks?)
      */
    function getNextDaysForecast(isManual)
    {
        clearTimeout(forecastTimer);

        if (location === '')
        {

            forecastTimer = setTimeout(function () {getNextDaysForecast(isManual);}, 30000);
            return;
        } else

        {

            if (!forecastIntervalStarted && !isManual)
            {
                forecastTimer = setTimeout(function () {getNextDaysForecast(isManual);}, 1080000);
                forecastIntervalStarted = true;
            }
        }

        if (isManual)
        {
            $.getJSON('https://lying-stream.glitch.me/api/weather', { zip: location }, function () {}).done(function (data) {storeForecastData(data, isManual);}).fail(errorHandling);
        } else

        {
            $.getJSON('https://lying-stream.glitch.me/api/weather', { forecast: true, coords: { lat: latitude, lon: longitude } }, function () {}).done(function (data) {storeForecastData(data, isManual);}).fail(errorHandling);
            forecastTimer = setTimeout(function () {getNextDaysForecast(isManual);}, 1080000);
        }
    }

    function errorHandling(jqXHR, textStatus, errorThrown)
    {

    } //console.log('Data unavailable');

    /*
    * Forecast item object
    */
    var ForecastItem = function (newDate, newIcon, newDesc, newTemp, newHumid, newSpeed, newUnits)
    {
        var date = new Date(newDate);
        var icon = newIcon;
        var description = newDesc;
        var temperature = newTemp;
        var humidity = newHumid;
        var wind = newSpeed;
        var units = newUnits || 'metric';

        this.getDate = function () {return date;};
        this.setDate = function (newDate) {date = newDate;};
        this.getIcon = function () {return icon;};
        this.setIcon = function (newIcon) {icon = newIcon;};
        this.getDescription = function () {return description;};
        this.setDescription = function (newDesc) {description = newDesc;};
        this.getTemperature = function () {return units === 'metric' ? temperature + ' ' + String.fromCharCode(176) + 'C' : this.convertToFahrenheit(temperature) + String.fromCharCode(176) + 'F';};
        this.setTemperature = function (newTemp) {temperature = newTemp;};
        this.getHumidity = function () {return humidity + ' %';};
        this.setHumidity = function (newHumid) {humidity = newHumid;};
        this.getWind = function () {return units === 'metric' ? wind + ' m/s' : this.convertToMPH(wind) + ' mph';};
        this.setWind = function (newSpeed) {description = newSpeed;};
        this.getUnits = function () {return units;};
        this.setUnits = function (newUnits) {units = newUnits;};

        this.condenseDate = function ()
        {
            return date.getDate() + ' ' + months[date.getMonth()];
        };

        this.getForecastTime = function ()
        {
            return (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
        };

        this.convertToMPH = function (val)
        {
            val = val * 2.24;
            return Math.floor(val) + '.' + Math.round(val % 1 * 10);
        };

        this.convertToFahrenheit = function (val)
        {
            val = val * (9 / 5) + 32;
            return Math.floor(val) + '.' + Math.round(val % 1 * 10);
        };
    };

    /*
       * Get the data store in the forecast array
       * and appends html elements to display the data
       */
    function displayForecast()
    {
        if (forecastItems.length > 0)
        {
            nxtForecastContents.empty();

            for (var i = 0; i < forecastItems.length; i++)
            {if (window.CP.shouldStopExecution(0)) break;

                forecastItems[i].setUnits(units); //use to update chosen unit system

                var html = '<div class=\"row nxt-forecast-item\"><div class=\"col-xs-6 col-lg-3\"><div><h3>' + forecastItems[i].condenseDate() + '</h3><p>' + forecastItems[i].getForecastTime() + '</p></div></div> <div class=\"col-xs-6 col-lg-2\"><div><h4><img src=\"' + forecastItems[i].getIcon() + '\"></img></h4><p>' + forecastItems[i].getDescription() + '</p></div></div> <div class=\"col-xs-4 col-lg-2\"><div><h4 class=\"disp-label\">Temp</h4><p>' + forecastItems[i].getTemperature() + '</p></div></div> <div class=\"col-xs-4 col-lg-2\"><div><h4 class=\"disp-label\">Humidity</h4><p>' + forecastItems[i].getHumidity() + '</p></div></div> <div class=\"col-xs-4 col-lg-2\"><div><h4 class=\"disp-label\">Wind</h4><p>' + forecastItems[i].getWind() + '</p></div></div> </div><hr/>';

                nxtForecastContents.append(html);
            }window.CP.exitedLoop(0);
        }
    }

    /*
      * Api callback function
      * stores results in an array of objects type(ForecastItems)
      */
    function storeForecastData(data, isManual)
    {
        var list = [];
        if (data['cod'] == '200')
        {
            list = data['list'];
            forecastItems = [];

            for (var i = 0; i < list.length; i++)
            {if (window.CP.shouldStopExecution(1)) break;
                var item = new ForecastItem(list[i]['dt_txt'].replace(/[-]/g, '/'), list[i]['weather'][0]['icon'], list[i]['weather'][0]['description'], list[i]['main']['temp'], list[i]['main']['humidity'], list[i]['wind'] === null ? 0 : list[i]['wind']['speed'], units);
                forecastItems.push(item);
            }window.CP.exitedLoop(1);

            if (isManual)
            {
                displayCurrentLocation(data);
                localWeatherData = forecastItems[0];
                localWeatherData.setUnits(units);
                displayLocalWeather(localWeatherData);
                displayForecast();
            }
        }
    }

    /*
      * Api callback function
      * stores results in an objects type(ForecastItems)
      */
    function storeLocalWeatherData(data)
    {

        if (data && !data.error)
        {
            console.log(data);
            displayCurrentLocation(data); //display location{city, country}

            localWeatherData = new ForecastItem(data.dt, data.icon, data.description, data.temp, data.humidity, data.wind.speed, data.units);

            displayLocalWeather(localWeatherData); //display data

        } else

        {
            weatherDisplay.text('N/A');
        }
    }
    /*
      * Display local weather
      */
    function displayLocalWeather(data)
    {
        weatherDisplay.empty();

        var html = '<p><img src=\"' + data.getIcon() + '\">' + data.getDescription() + '</img></p>';
        weatherDisplay.append(html); //append html

        /*humidity, temperature, wind */
        tempDisplay.text(data.getTemperature());
        humidDisplay.text(data.getHumidity());
        windDisplay.text(data.getWind());

    }

    /*
      * set backdrop class according to the time
      */
    function setBackdrop()
    {
        clearTimeout(backdropTimer);
        removeBackdrop(); //remove the backdrop class if set already before updating

        if (hh >= 5 && hh <= 6)
        {
            body.addClass(backdrops['dawn']);
        } else
        if (hh > 6 && hh <= 10)
        {
            body.addClass(backdrops['morning']);
        } else
        if (hh > 10 && hh < 16)
        {
            body.addClass(backdrops['mid']);
        } else
        if (hh >= 16 && hh <= 18)
        {
            body.addClass(backdrops['dusk']);
        } else
        if (hh > 18 && hh < 24)
        {
            body.addClass(backdrops['night']);
        } else

        {
            body.addClass(backdrops['night']);
        }

        backdropTimer = setTimeout(setBackdrop, 360000);
    }

    /*
      * remove backdrop class if found in the body
      */
    function removeBackdrop()
    {
        /*remove any backdrop class found in the body*/
        body.removeClass(function (index, css) {
            return (css.match(/((backdrop)(-\w+))/g) || []).join('');
        });
    }


    /**Next Days Forecast**/

    function displayNextDaysForecast()
    {
        closeNxtDaysDispForecast();
    }

    var isHidden = true; //determines if the forecast list container is hidden
    /*
    * Toggles forecast list container's visibility
    * show/hide
    */
    function closeNxtDaysDispForecast()
    {
        displayForecast();
        nxtForecastContainer.slideToggle('slow');
        /*if(!isHidden)
                                                  {
                                                    nxtForecastContainer.hide();
                                                    isHidden = true;
                                                  }
                                                  else
                                                  {
                                                    displayForecast(); //get and display forecast data if the container is visible
                                                    nxtForecastContainer.show();
                                                    isHidden = false;
                                                  }*/
    }

    /*
      * Toggle between metric and imperial units
      */
    function toggleUnits(e)
    {
        var id = e.target.id;

        if (id === 'tMetric')
        {
            units = 'metric';
        } else

        {
            units = 'imperial';
        }

        /*update display with chosen unit system*/
        if (forecastItems.length > 0)
        {
            displayForecast();
        }

        if (localWeatherData !== '')
        {
            localWeatherData.setUnits(units);
            displayLocalWeather(localWeatherData);
        }
    }
});