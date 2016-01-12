(function() {
  'use strict';
  angular.module('mksense.core.models')
  .factory('CSS3DSprite',[
    'THREE',
    'CSS3DObject',
    function(
      THREE,
      CSS3DObject
    ){

      function CSS3DSprite( element ) {
        CSS3DObject.call( this, element );
      };
      CSS3DSprite.prototype = Object.create( CSS3DObject.prototype );
      CSS3DSprite.prototype.constructor = CSS3DSprite;
      return CSS3DSprite;

    }
  ]);

}());
