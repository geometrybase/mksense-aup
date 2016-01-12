(function() {
  'use strict';
  angular.module('mksense.core.models')
  .factory('CSS3DObject',[
    'THREE',
    function(
      THREE
    ){
      function CSS3DObject( element ) {
        THREE.Object3D.call( this );
        this.element = element;
        this.element.css('position','absolute');
        this.addEventListener( 'removed', function ( event ) {
          if ( this.element.parent() !== null ) {
            this.element.remove();
          }
        });
      };
      CSS3DObject.prototype = Object.create( THREE.Object3D.prototype );
      CSS3DObject.prototype.constructor = CSS3DObject;
      return CSS3DObject;
    }
  ]);

}());
