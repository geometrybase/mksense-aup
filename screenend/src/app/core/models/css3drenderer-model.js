(function() {
  'use strict';
  angular.module('mksense.core.models')
  .factory('CSS3DRenderer',[
    'THREE',
    'CSS3DObject',
    'CSS3DSprite',
    function(
      THREE,
      CSS3DObject,
      CSS3DSprite
    ){

      function CSS3DRenderer() {
        this.cache = {
          screen:{style:''},
          objects: {}
        };
        this.domElement=angular.element('<div></div>');
        this.domElement.css('overflow','hidden');
        this.cameraElement = angular.element( '<div></div>' );
        this.domElement.append( this.cameraElement );
      }

      CSS3DRenderer.prototype.setSize=function(width,height){
        this.domElement.css('width','100%'); 
        this.domElement.css('height','100%'); 
      }

      CSS3DRenderer.prototype.epsilon = function ( value ) {
        return Math.abs( value ) < 0.000001 ? 0 : value;
      };

      CSS3DRenderer.prototype.getCameraCSSMatrix = function ( matrix ) {
        var elements = matrix.elements;
        return 'matrix3d(' +
          this.epsilon( elements[ 0 ] ) + ',' +
          this.epsilon( - elements[ 1 ] ) + ',' +
          this.epsilon( elements[ 2 ] ) + ',' +
          this.epsilon( elements[ 3 ] ) + ',' +
          this.epsilon( elements[ 4 ] ) + ',' +
          this.epsilon( - elements[ 5 ] ) + ',' +
          this.epsilon( elements[ 6 ] ) + ',' +
          this.epsilon( elements[ 7 ] ) + ',' +
          this.epsilon( elements[ 8 ] ) + ',' +
          this.epsilon( - elements[ 9 ] ) + ',' +
          this.epsilon( elements[ 10 ] ) + ',' +
          this.epsilon( elements[ 11 ] ) + ',' +
          this.epsilon( elements[ 12 ] ) + ',' +
          this.epsilon( - elements[ 13 ] ) + ',' +
          this.epsilon( elements[ 14 ] ) + ',' +
          this.epsilon( elements[ 15 ] ) +
          ')';
      };

      CSS3DRenderer.prototype.getObjectCSSMatrix = function ( matrix ) {
        var elements = matrix.elements;
        return 'matrix3d(' +
          this.epsilon( elements[ 0 ] ) + ',' +
          this.epsilon( elements[ 1 ] ) + ',' +
          this.epsilon( elements[ 2 ] ) + ',' +
          this.epsilon( elements[ 3 ] ) + ',' +
          this.epsilon( elements[ 4 ] ) + ',' +
          this.epsilon( elements[ 5 ] ) + ',' +
          this.epsilon( elements[ 6 ] ) + ',' +
          this.epsilon( elements[ 7 ] ) + ',' +
          this.epsilon( elements[ 8 ] ) + ',' +
          this.epsilon( elements[ 9 ] ) + ',' +
          this.epsilon( elements[ 10 ] ) + ',' +
          this.epsilon( elements[ 11 ] ) + ',' +
          this.epsilon( elements[ 12 ] ) + ',' +
          this.epsilon( elements[ 13 ] ) + ',' +
          this.epsilon( elements[ 14 ] ) + ',' +
          this.epsilon( elements[ 15 ] ) +
          ')';
      };

      CSS3DRenderer.prototype.renderObject = function (object, screenInfo) {
        if ( object instanceof CSS3DObject ) {
          var style = this.getObjectCSSMatrix( object.matrixWorld );
          var element = object.element;
          var cachedStyle = this.cache.objects[ object.id ];
          if ( cachedStyle === undefined || cachedStyle !== style ) {
            element.css('WebkitTransform' , style);
            element.css('MozTransform' , style);
            element.css('oTransform' , style);
            element.css('transform' , style);
            this.cache.objects[ object.id ] = style;
          }
          if ( element.parent()[0] !== this.cameraElement[0]) {
            this.cameraElement.append(element);
          }
        }
        for (var i=0, l=object.children.length; i<l; i++){
          this.renderObject(object.children[i],screenInfo);
        }
      };

      CSS3DRenderer.prototype.render = function (scene, screenInfo) {
        this.domElement.css('width',screenInfo.width+'px'); 
        this.domElement.css('height',screenInfo.height+'px'); 
        scene.updateMatrixWorld();
        var style = 'translate3d(-' + screenInfo.x+ 'px, -' + (screenInfo.y) + 'px, 0)';
        if ( this.cache.screen.style !== style ) {
          this.cameraElement.css('WebkitTransform',style);
          this.cameraElement.css('MozTransform',style);
          this.cameraElement.css('oTransform',style);
          this.cameraElement.css('transform',style);
          this.cache.screen.style = style;
        }
        this.renderObject(scene, screenInfo);
      };

      return CSS3DRenderer;
    }
  ]);

}());
