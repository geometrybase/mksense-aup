(function(){
  'use strict';
  angular.module('mksense.visuals')
  .directive('mksenseSubscriber',[
    'THREE','CSS3DObject','CSS3DRenderer','_','$log','$timeout','TWEEN',
    function(
      THREE,CSS3DObject,CSS3DRenderer,_,$log,$timeout,TWEEN
    ){
      return {
        transclude:false,
        restrict:'EA',
        templateUrl:'/visuals/subscriber/subscriber.html',
        link:function(scope,element){

          var logger=$log.getInstance('SUBSCRIBER-DIRECTIVE');
          var random= new Math.seedrandom('mksenseSubscriber');

          element.css('width',scope.screenInfo.width+"px");
          element.css('height',scope.screenInfo.height+"px");
          element.css('display','none');
          element.css('transition','opacity 2s cubic-bezier(0.55, 0.06, 0.68, 0.19)');
          scope.css3dScene = new THREE.Scene();
          scope.artObjects=[];
          scope.css3dTargets=[];
          scope.css3dObjects=[];
          scope.renderer=new CSS3DRenderer();
          scope.renderer.domElement.css('position','absolute');
          scope.renderer.domElement.css('height',Math.floor(scope.screenInfo.height*0.7)+'px');
          element.append(scope.renderer.domElement);

          scope.$on('fadeIn',function(){
            element.css('opacity','1');
            cancelAnimationFrame(scope.tweenAnimationId);
            transform(TWEEN.Easing.Cubic.InOut);
          });

          scope.$on('fadeOut',function(){
            element.css('opacity','0');
            $timeout(function(){
              cancelAnimationFrame(scope.tweenAnimationId);
              TWEEN.removeAll();
              scope.$emit('fadeOutDone');
            },3000);
          });

          scope.$on('$destroy',function(){
            cancelAnimationFrame(scope.tweenAnimationId);
          });

          scope.$on('pubsub',function(event,data){
            console.log(data);
            if(scope.isMaster){
              if(data.type==='actionEntry')
                addArtObject(data.payload);
              scope.$emit('sync',{type:'data',name:'syncData',payload:data.payload});
            }
          });

          scope.$on('syncData',function(event,payload){
              addArtObject(payload);
          });

          function addArtObject(artObject){
            logger.debug(artObject);
            var imageHeight=scope.screenInfo.zoneHeight;
            var imageWidth=Math.floor(scope.screenInfo.zoneHeight/artObject.cover.height*artObject.cover.width);
            console.log(imageWidth);
            var element=angular.element('<img src="'+artObject.cover.url+'?imageView2/2/h/'+imageHeight+'" />'); 
            element.addClass('element');
            element.css('height',imageHeight+'px');
            element.css('width',imageWidth+'px');
            var object = new CSS3DObject(element);
            scope.css3dObjects.unshift(object);
            scope.css3dTargets.unshift(scope.configs.gap/2);
            object.position.x=-imageWidth-scope.configs.gap;
            object.height=imageHeight;
            object.width=imageWidth;
            scope.css3dScene.add(object);
            var offset=imageWidth+scope.configs.gap;
            scope.css3dTargets.forEach(function(e,i){
              if(i!==0)scope.css3dTargets[i]+=offset;
            });
            transform(TWEEN.Easing.Cubic.InOut);
          }


          function render(){
            scope.renderer.render(scope.css3dScene,scope.screenInfo);
          }

          function transform(easing){

            function tweenAnimate(){
              scope.tweenAnimationId=requestAnimationFrame(tweenAnimate)
              TWEEN.update();
            }

            TWEEN.removeAll();
            var objects=scope.css3dObjects;
            var targets=scope.css3dTargets;
            console.log(targets);
            var duration=5000;
            objects.forEach(function(object,index){
              var target=targets[index];
              logger.debug(target);
              if(!_.isNumber(target))return;
              new TWEEN.Tween( object.position )
              .to( { x:target, y: 0,z: 0 }, duration)
              .easing(easing)
              .start();
            });
            new TWEEN.Tween({})
            .to( {}, duration)
            .onUpdate(render)
            .onComplete(function(){
              cancelAnimationFrame(scope.tweenAnimationId);
            })
            .start();

            cancelAnimationFrame(scope.tweenAnimationId);
            tweenAnimate();
          }


          //end link function
        }
      }
    }]);
}());
