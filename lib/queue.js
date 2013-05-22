module.exports.up = up = function (workerFunc) {

  var self = {
      _pending: []
    , _running: 0
    , _active: false
    , _workerFunc: workerFunc
    , concurrency: 50
    , _run: function () {
        if (self._active === true) return;
        self._active = true;

        if(self._running >= self.concurrency) {
          console.log('All %d threads are busy, enqueing...', self.concurrency);
        }
        
        while(self._pending.length > 0  && self._running < self.concurrency) {
          var args = self._pending.shift();
          self._workerFunc.apply(self, args);
          self._running++;
        }

        console.log('Threads used %d/%d', self._running, self.concurrency);

        self._active = false; 
    }
    , clear: function() {
        self._pending = [];
        self._running = 0;
    }
    , enqueue: function () { 
        self._pending.push(Array.prototype.slice.call(arguments)); 
        self._run();
      }
    , pop: function () {
        console.log('A thread has finished its works and it is now available');
        if(self._running > 0) self._running--;
        if (self._running === 0 && self._pending.length === 0) {
          if(self.allDone) self.allDone();
        } else {
          self._run();
        }
      }
    , allDone: undefined
  };

  return self;
};