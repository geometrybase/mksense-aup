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
          scope.renderer.domElement.style.height=Math.floor(scope.screenInfo.height*0.7)+'px';
          element.append(scope.renderer.domElement);

          scope.status="PENDING";

          scope.$on('fadeIn',function(event,index){
            element.css('opacity','1');
            logger.debug('fade in');
            logger.debug(index,scope.index);
            logger.debug(scope.status);
            if(scope.index !== index)
              return;
            if(scope.status === "PLAY")
              return;
            scope.status="PLAY";
            logger.debug('Catch fadeIn event');
            cancelAnimationFrame(scope.animateId);
            //animate();
          });

          scope.$on('fadeOut',function(event,index){
            if(scope.index !== index)
              return;
            if(scope.status==="FADEOUT")
              return;
            scope.status="FADEOUT";
            logger.debug('Catch fadeOut event for index',index);
            element.css('opacity','0');
            $timeout(function(){
              cancelAnimationFrame(scope.animateId);
              scope.$emit('fadeOutDone',index);
            },5000);
          });

          scope.$on('$destroy',function(){
            cancelAnimationFrame(scope.animateId);
          });


          scope.$on('pubsub',function(event,data){
            if(scope.isMaster){
              //scope.$emit('syncData',data);
              addArtObject(data);
            }
          });

          scope.$on('syncData',function(event,message){
            if(message.index === scope.index){
              addArtObject(message.data.payload);
            }
          });

          function addArtObject(artObject){
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

          function animate(){
            scope.animateId=requestAnimationFrame(animate)
            TWEEN.update();
            //render();
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
            var duration=2000;
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
