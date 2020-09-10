$(document).ready(function(){

    var time, hh, mm; //variable time hours and minutes
    var timer = ""; //reference variable for the timeout object
    var backdropTimer = ""; //backdrop timer(interval) variable reference
    var clockDisplay = $('#clockDisplay'); //reference variable for the clock display
    var dateDisplay = $('#dateDisplay'); //date display
    var weatherTimer = ''; //used in function timeout and intervals
    var body = $('body'); //ref variable, for the page body, used in setting the right backdrop
    var forecastTimer = ''; //ref variable for forecast timeout/interval(id)



    /**Static values for conversion and lookup**/
    var backdrops = { dawn: 'backdrop-dawn', morning: 'backdrop-morning', mid: 'backdrop-midday', dusk: 'backdrop-dusk', night: 'backdrop-night' }; //backdrop class list
    var months = { 0: 'Jan', 1: 'Feb', 2: 'Mar', 3: 'Apr', 4: 'May', 5: 'Jun', 6: 'Jul', 7: 'Aug', 8: 'Sept', 9: 'Oct', 10: 'Nov', 11: 'Dec' }; //list of months in a year



    initAll(); //initialise all necessary functions
    function initAll()
    {
        resetClockTimer(); //reset timeout object if any
        resetWeatherTimer(); //reset weather timeout/intervals
        startClock(); // start a new timeout and get the current time
        //getNextDaysForecast(false); //get local weather forecast for the next few days
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

        hh = time.getHours()  ;
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


    function hint(response){

            var selected = "";
            var tmp_names = [];
            var names = [];
            var ids = [];
            var str = "";
            str = $('#tags').val();
            str = str.toLowerCase();
            var i=0;
            while(i<response.length){
                var tmp = response[i].name+','+response[i].country+','+response[i].id;
                var name = tmp.toLowerCase();
                if(str.length>0 && str.localeCompare(name.substring(0,str.length))==0 && $.inArray(tmp, tmp_names)==-1){
                    $('#tags').addClass('sph-widget');
                    tmp_names.push(tmp);
                    if(tmp_names.length==10){
                        break;
                    }
                }
                i++;
            }
            if(tmp_names.length != 0){
                tmp_names = tmp_names.sort();
                for(var i=0; i<tmp_names.length;i++){
                    var my_split = tmp_names[i].split(',');
                    var tmp = my_split[2];
                    ids[i] = tmp;
                    names[i] = my_split[0]+','+my_split[1];
                }
            }
            resp = names;
            $( "#tags" ).autocomplete({
                source: names,
                minLength: 0,
                delay:0,
                search: function(e,ui){
                    $('#tags').removeClass('sph-widget');
                    $(this).data("ui-autocomplete").menu.bindings = $();
                },
                select: function(e, ui){
                    selected = ui.item.value;
                    var my_id = "";
                    var i=0;
                    while(i<names.length){
                        if(names[i].localeCompare(selected)==0){
                            my_id = ids[i];
                            break;
                        }
                        i++;
                    }
                    window.location.replace('/weather/'+my_id);
                }
              }).bind('focus', function(){ $(this).autocomplete("search"); });
    }

    $.ajax({
        url: "/assets/js/cities.json",
      }).done(function(response) {

        $('#tags').on('input',function(){
            hint(response);
        });

        $('#tags').on('keydown',function(e){
            if(e.key.localeCompare("Backspace")==0){
                hint(response);
            }
        });

      });
});

$(document).ready(function(){
    $('#location_id').on('click', function(){
        if ("geolocation" in navigator){ //check geolocation available
            //try to get user current location using getCurrentPosition() method
            navigator.geolocation.getCurrentPosition(function(position){
                    console.log(position.coords.latitude+","+ position.coords.longitude);
                    window.location.replace('/'+position.coords.latitude+'/'+position.coords.longitude);
                });
        }else{
            console.log("Browser doesn't support geolocation!");
        }
    });
});