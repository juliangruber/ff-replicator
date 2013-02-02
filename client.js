window.onerror = alert

/**
 * module dependencies
 */

var Model = require('scuttlebutt/model')
var reconnect = require('reconnect')
var shoe = require('shoe')

/**
 * replication
 */

var model = new Model()

reconnect(function (stream) {
  var ms = model.createStream()
  ms.pipe(stream).pipe(ms)
}).connect('/sock')

/**
 * initialize components
 */

addInput('input')
addInput('input2')
addGauge('gauge')
addGauge('gauge2')

/**
 * components
 */

function addInput (name) {
  var el = document.createElement('input')

  var lastValue
  el.addEventListener('keyup', function (ev) {
    if (el.value == lastValue) return
    model.set(name, lastValue = el.value)
  })

  model.on('update', function (kv) {
    if (kv[0] == name) {
      el.value = kv[1]
    }
  })
  
  document.body.appendChild(document.createTextNode(name))
  document.body.appendChild(el)
  document.body.appendChild(document.createElement('br'))
}

function addGauge (name) {
  var el = document.createElement('div')
  el.className = 'scale'
  var meter = document.createElement('div')
  meter.className = 'meter'
  var count = document.createElement('div')
  count.className = 'count'
  el.appendChild(meter)
  el.appendChild(count)
  
  var handle = update(el)
  el.addEventListener('mousedown', handle)
  el.addEventListener('touchstart', handle)
  
  el.addEventListener('mousedown', onMouseDown)
  el.addEventListener('touchstart', onMouseDown)
  
  function onMouseDown(e) {
    window.addEventListener('mousemove', handle, false)
    window.addEventListener('touchmove', handle, false)

    window.addEventListener('mouseup', onMouseUp, false)
    window.addEventListener('touchend', onMouseUp, false)
    
    function onMouseUp(e) {
      window.removeEventListener('mousemove', handle)
      window.removeEventListener('touchmove', handle)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchend', onMouseUp)
    }
  }
  
  function update(el) {
    return function(e) {
      if (e.layerY < 0) return
      window.el = el
      el.querySelector('.meter').style.marginTop = e.layerY+'px'
      model.set(name, 100 - e.layerY)
    }
  }
  
  model.on('update', function (kv) {
    if (kv[0] == name) {
      el.querySelector('.meter').style.marginTop = (100-kv[1])+'px'
    }
  })
  
  document.body.appendChild(document.createTextNode(name))
  document.body.appendChild(el)
  document.body.appendChild(document.createElement('br'))
}

/**
 * make it installable
 */

if (navigator.mozApps) {
  var request = navigator.mozApps.getSelf();
  var that = this;
  request.onsuccess = function () {
     if (!this.result) {
        alert("uninstalled");
        that.installUrl = (
           location.href.substring(0, location.href.lastIndexOf("/")) +
           "/manifest.webapp"
        );
        that.doIt = function() {
           //*/ alert("Faking install from " + that.installUrl);
           try {
              var req2 = navigator.mozApps.install(that.installUrl);
              req2.onsuccess = function(data) {
                 alert("installed");
                 //*/ alert("Bingo!");
              };
              req2.onerror = function() {
                 that.error = this.error;
                 alert("failed");
              };
           }catch (error) {
              that.error = error;
              alert("failed");
           }
        };
     }else {
        alert("installed");
     }
  };
  request.onerror = function (error) {
     that.error = error;
     alert("failed");
  };
  var el = document.createElement('a')
  el.innerHTML = 'install'
  el.addEventListener('click', function () {
    that.doIt()
    return false
  })
  document.body.appendChild(el)
}