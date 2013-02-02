window.onerror = alert

/**
 * module dependencies
 */

var Model = require('scuttlebutt/model')
var reconnect = require('reconnect')
var shoe = require('shoe')
var h = require('h')

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
  var el = h('input')

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
  
  document.body.appendChild(document.createTextNode(name + ' '))
  document.body.appendChild(el)
  document.body.appendChild(h('br'))
}

function addGauge (name) {
  var el = h('div.scale')
  var meter = h('div.meter')
  var count = h('div.count')
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
      meter.style.marginTop = e.layerY+'px'
      model.set(name, 100 - e.layerY)
    }
  }
  
  model.on('update', function (kv) {
    if (kv[0] == name) {
      meter.style.marginTop = (100-kv[1])+'px'
    }
  })
  
  document.body.appendChild(document.createTextNode(name + ' '))
  document.body.appendChild(el)
  document.body.appendChild(h('br'))
}

/**
 * make it installable
 */

if (navigator.mozApps) {
  document.body.appendChild(h('button', 'install', {
    click : navigator.mozApps.install.bind(
      navigator.mozApps,
      location.href.substring(0, location.href.lastIndexOf("/")) + '/manifest.webapp'
    )
  }))
}