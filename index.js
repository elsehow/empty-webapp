var ud = require('ud');
var h = require('virtual-dom/h')
var EE = require('events').EventEmitter
var app =  document.querySelector('#app')
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
  return {
    n: 0
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

