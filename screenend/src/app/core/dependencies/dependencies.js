/**
 * Generic models angular module initialize. This module contains all 3rd party dependencies that application needs to
 * actually work.
 *
 * Also note that this module have to be loaded before any other application modules that have dependencies to these
 * "core" modules.
 */
(function() {
  'use strict';

  angular.module('mksense.core.dependencies', [
    'ngStorage',
    'wu.masonry',
    'ui.router',
    'hmTouchEvents',
    'toastr',
    'monospaced.qrcode',
    'btford.socket-io'
  ]);

  angular.module('mksense.core.dependencies')
  .factory('mkConfig',[
    '$window',
    function($window){
      return $window.mkConfig; 
    }
  ]);

  angular.module('mksense.core.dependencies')
  .factory('uuid',[
    '$window',
    function($window){
      return $window.uuid; 
    }
  ]);

  angular.module('mksense.core.dependencies')
  .factory('_',[
    '$window',
    function($window){
      return $window._; 
    }
  ]);

  angular.module('mksense.core.dependencies')
  .factory('LZString',[
    '$window',
    function($window){
      return $window.LZString; 
    }
  ]);

  angular.module('mksense.core.dependencies')
  .factory('io',[
    '$window',
    function($window){
      return $window.io; 
    }
  ]);

  angular.module('mksense.core.dependencies')
  .factory('Peer',[
    '$window',
    function($window){
      return $window.Peer; 
    }
  ]);

  angular.module('mksense.core.dependencies')
  .factory('d3',[
    '$window',
    function($window){
      return $window.d3; 
    }
  ]);

  angular.module('mksense.core.dependencies')
  .factory('PIXI',[
    '$window',
    function($window){
      return $window.PIXI; 
    }
  ]);

  angular.module('mksense.core.dependencies')
  .factory('Stats',[
    '$window',
    function($window){
      return $window.Stats; 
    }
  ]);

  angular.module('mksense.core.dependencies')
  .factory('THREE',[
    '$window',
    function($window){
      return $window.THREE; 
    }
  ]);

  angular.module('mksense.core.dependencies')
  .factory('TWEEN',[
    '$window',
    function($window){
      return $window.TWEEN; 
    }
  ]);

  angular.module('mksense.core.dependencies')
  .factory('EventEmitter',[
    '$window',
    function($window){
      return $window.EventEmitter; 
    }
  ]);

  angular.module('mksense.core.dependencies')
  .factory('domtoimage',[
    '$window',
    function($window){
      return $window.domtoimage; 
    }
  ]);

  angular.module('mksense.core.dependencies')
  .factory('limitLoop',[
    '$window',
    function($window){
      var limitLoop = function (fn, fps) {
        var then = Date.now();
        fps = fps || 60;
        var interval = 1000 / fps;
        return (function loop(time){
          requestAnimationFrame(loop);
          var now = Date.now();
          var delta = now - then;
          if (delta > interval) {
            then = now - (delta % interval);
            fn();
          }
        }(0));
      };
      return limitLoop; 
    }
  ]);

}());
