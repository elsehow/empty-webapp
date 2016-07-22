var ud = require('ud');
var h = require('virtual-dom/h')
var EE = require('events').EventEmitter
var app =  document.querySelector('#app')
var level = require('level-browserify')
//var memdb = require('memdb')
//var swarmlog = require('swarmlog')
var hyperlog = require('hyperlog')
var websocket = require('websocket-stream')
var hyphy = require('hyphy')

function declare (fn, store) {
  var ml = require('main-loop')
  var l = ml(store, fn, require('virtual-dom'))
  app.innerHTML = ''
  app.appendChild(l.target)
  return l
}
//
var dispatcher = new EE()


// data structures
var store = ud.defonce(module, function () {
  var db = level('/tmp/rorrim-webui.db')
  //var db = memdb()
  //var log = hyperlog({
  //  keys: require('./keys.json'),
  //  sodium: require('chloride/browser'),
  //  db: db,
  //  valueEncoding: 'json',
  //  hubs: [ 'https://signalhub.mafintosh.com' ]
  //})
  var log = hyperlog(db, {
    valueEncoding: 'json'
  })
  var stream = websocket('ws://localhost:5000')
  stream.pipe(log.replicate()).pipe(stream)

  return {
    log: log,
    n: 0,
  }
}, 'store')


// view logic

var render = ud.defn(module, function (state) {

  return h('div', [
    h('h1', `clicked ${state.n} times`),
    h('button', { onclick: handleClick }, 'click !')
  ])

  function handleClick (ev) {
    dispatcher.emit('button-click', ev)
  }

})

// actions
function actions (loop) {
  dispatcher.on('button-click', (ev) => {
    store.n = store.n+1
    loop.update(store)
  })
}


var loop = declare(render, store)
actions(loop)
hyphy(store.log).log('WILL VIEW THIS SOON!')

// replicate swarmlog
