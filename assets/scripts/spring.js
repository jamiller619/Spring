(function(window, document) {
  "use strict";

  if (!String.prototype.format) {
    String.prototype.format = function() {
      var args = arguments;
      return this.replace(/{(\d+)}/g, function(match, number) { 
        return typeof args[number] != 'undefined'
          ? args[number]
          : match
        ;
      });
    };
  }

  function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  var Spring = Spring || {};

  Spring.Unsplash = {
    url: 'https://source.unsplash.com/{0}',
    init: function() {
      var bgUrl = this.url.format(window.innerWidth + 'x' + window.innerHeight);

      document.body.style.backgroundImage = 'url({0})'.format(bgUrl);
    }
  };

  Spring.TimePiece = (function() {

    var currentMinutes;
    
    var secondsInHour = 60 * 60,
        secondsInDay = secondsInHour * 12,
        timeClasses = ['zero','one','two','three','four','five','six','seven','eight','nine'];

    var timePiece = document.getElementById('timepiece'),
        digital = document.getElementById('digital');

    var els = {
      minute: timePiece.querySelector('.minutes'),
      minuteHand: timePiece.querySelector('.minute-hand'),
      hour: timePiece.querySelector('.hour'),
      digitalHours: digital.querySelector('.hour'),
      digitalMinutes: digital.querySelector('.minutes'),
      digitalAmPm: digital.querySelector('.am-pm'),
      digitalDate: digital.querySelector('.date')
    };

    function setRotation(el, deg) {
      el.style.transform = 'rotate({0}deg)'.format(deg);
    }

    function drawText(word) {
      var fragment = document.createDocumentFragment();

      for(var i=0; i<word.length; i++) {
        var span = document.createElement('span');
        span.textContent = word[i];
        span.className = timeClasses[~~word[i]];
        fragment.appendChild(span);
      }
      return fragment;
    }

    function emptyNode(node) {
      while(node.lastChild) {
        node.removeChild(node.lastChild);
      }
      return node;
    }

    function drawTime(hours, minutes, seconds) {
      var minutesInSeconds = (minutes + (seconds/60)) * 60,
          hoursInSeconds = (hours + (minutes/60)) * secondsInHour,
          amPm = hours > 11 ? 'PM' : 'AM',
          displayHours = (hours % 12 == 0 ? 12 : hours % 12).toString(),
          displayMinutes = minutes >= 10 ? minutes.toString() : '0' + minutes;

      var minuteDegrees = (minutesInSeconds / secondsInHour) * 360;

      setRotation(els.minute, minuteDegrees);
      setRotation(els.minuteHand, minuteDegrees);
      setRotation(els.hour, (hoursInSeconds / secondsInDay) * 360);

      if(minutes != currentMinutes) {
        emptyNode(els.digitalHours).appendChild(drawText(displayHours));
        emptyNode(els.digitalMinutes).appendChild(drawText(displayMinutes));

        els.digitalAmPm.textContent = amPm;

        currentMinutes = minutes;
      }
    }

    function drawDate(day, date, month) {
      var months = ['January','February','March','April','May','June','July','August','September','October','November','December'],
          days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
          displayDate = '{0}, {1} {2}'.format(days[day], months[month], date);
          
      els.digitalDate.textContent = displayDate;
    }

    function init() {
      var now = new Date(),
          seconds = now.getSeconds(),
          minutes = now.getMinutes(),
          hours = now.getHours(),
          day = now.getDay(),
          date = now.getDate(),
          month = now.getMonth();

      drawTime(hours, minutes, seconds);
      drawDate(day, date, month);

      requestAnimationFrame(init);
    }

    function initGradients() {
      var minuteGradient = new ConicGradient({
        stops: 'rgba(0,215,255,1), rgba(0,215,255,.1)',
        size: 210
      });

      var hourGradient = new ConicGradient({
        stops: 'rgba(255,215,0,1), rgba(255,215,0,.1)',
        size: 210
      })

      els.minute.style.backgroundImage = 'url({0})'.format(minuteGradient.png);
      els.hour.style.backgroundImage = 'url({0})'.format(hourGradient.png);
    }

    return {
      init: init,
      initGradients: initGradients,
      drawCustomTime: function(hours, minutes) {
        drawTime(hours, minutes, 0);

        var d = new Date();
        drawDate(d.getDay(), d.getDate(), d.getMonth());
      }
    }
  })();

  Spring.init = function() {
    var param = getParameterByName('t');

    //this.Unsplash.init();
    document.body.style.backgroundImage = 'url(https://hd.unsplash.com/photo-1432256851563-20155d0b7a39)';
    this.TimePiece.initGradients();

    if(param) {
      var time = param.split(':');
      this.TimePiece.drawCustomTime(~~time[0], ~~time[1]);
    } else {
      this.TimePiece.init();
    }
  };

  Spring.init();

})(window, document);