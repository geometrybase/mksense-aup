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
    'ui.router',
    'toastr',
    'monospaced.qrcode',
    'btford.socket-io',
    'ngAnimate',
    'angular-gestures'
  ]);

  //angular.module('mksense.core.dependencies')
  //.factory('Modernizr',[
    //'$window',
    //function($window){
      //return $window.Modernizr; 
    //}
  //]);

  angular.module('mksense.core.dependencies')
  .factory('io',[
    '$window',
    function($window){
      return $window.io; 
    }
  ]);

  angular.module('mksense.core.dependencies')
  .factory('Swiper',[
    '$window',
    function($window){
      return $window.Swiper; 
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
  .factory('Hammer',[
    '$window',
    function($window){
      return $window.Hammer; 
    }
  ]);

  angular.module('mksense.core.dependencies')
  .factory('_',[
    '$window',
    function($window){
      return $window._; 
    }
  ]);

}());
