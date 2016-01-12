(function(){
  'use strict';
  angular.module('mksense.visuals')
  .directive('mksenseMarquee',[
    'THREE','CSS3DObject','CSS3DRenderer','_','Stats','$log','$timeout',
    function(
      THREE,CSS3DObject,CSS3DRenderer,_,Stats,$log,$timeout
    ){
      return {
        transclude:false,
        restrict:'EA',
        templateUrl:'/visuals/marquee/marquee.html',
        link:function(scope,element){

          var logID='mksense-marquee directive:'.toUpperCase();
          var random= new Math.seedrandom('mksenseMarquee');

          element.css('width',scope.screenInfo.width+"px");
          element.css('height',scope.screenInfo.height+"px");
          element.css('display','none');
          element.css('transition','opacity 2s cubic-bezier(0.55, 0.06, 0.68, 0.19)');
          scope.css3dScene = new THREE.Scene();
          scope.artObjects=scope.artObjects.slice(0,100);
          populateObjects();
          scope.renderer=new CSS3DRenderer();
          scope.renderer.domElement.css('position','absolute');
          element.append(scope.renderer.domElement);
          var stats=new Stats();
          stats.setMode(0); 
          stats.domElement.style.position = 'absolute';
          stats.domElement.style.left = '0px';
          stats.domElement.style.top = '0px';
          element.append(angular.element(stats.domElement));

          scope.status="PENDING";

          scope.$on('fadeIn',function(event,index){
            element.css('opacity','1');
            $log.debug(logID,'fade in');
            $log.debug(index,scope.index);
            $log.debug(scope.status);
            if(scope.index !== index)
              return;
            if(scope.status === "PLAY")
              return;
            scope.status="PLAY";
            $log.debug(logID,'Catch fadeIn event');
            if(scope.isMaster){
              cancelAnimationFrame(scope.animateId);
              animate();
            }
          });

          scope.$on('fadeOut',function(event,index){
            if(scope.index !== index)
              return;
            if(scope.status==="FADEOUT")
              return;
            scope.status="FADEOUT";
            $log.debug(logID,'Catch fadeOut event for index',index);
            element.css('opacity','0');
            $timeout(function(){
              cancelAnimationFrame(scope.animateId);
              scope.$emit('fadeOutDone',index);
            },5000);
          });

          scope.$on('$destroy',function(){
            cancelAnimationFrame(scope.animateId);
          });

          scope.$on('syncData',function(event,message){
            if(message.index === scope.index){
              scope.css3dTargets=message.data;
              animate();
            }
          });

          var frameRate=30;
          var interval =1000/frameRate;
          var then=Date.now();

          function animate(){
            if(scope.isMaster){
              scope.animateId=requestAnimationFrame(animate);
              var now=Date.now();
              var delta=now-then;
              if(delta<interval)
                return;
              then=now-delta%interval; 
            }
            stats.begin();
            scope.renderer.render(scope.css3dScene,scope.screenInfo);
            if(scope.isMaster){
              scope.endPosition-=scope.configs.speed;
              for(var i=scope.css3dTargets.length-1; i>=0; i--){
                if(scope.css3dObjects[i] !== null){
                  scope.css3dTargets[i]-=scope.configs.speed; 
                  if(scope.css3dTargets[i] < -scope.css3dObjects[i].width-scope.configs.gap){
                    scope.css3dTargets[i]=scope.endPosition+scope.configs.gap;
                    scope.endPosition=scope.endPosition+scope.configs.gap+scope.css3dObjects[i].width;
                  }
                }
              }
              scope.$emit('syncData',scope.css3dTargets);
            }
            scope.css3dObjects.forEach(function(obj,index){
              if(obj)
                obj.position.x=scope.css3dTargets[index]; 
            });
            stats.end();
          }



          function populateObjects(){
            var objects=[];
            var x=0;
            var targets=[];
            scope.artObjects.forEach(function(d){
              if(!d.cover || !d.cover.url){
                objects.push(null); 
                targets.push(null);
              }else{
                var element=angular.element('<img src="'+d.cover.url+'" />'); 
                element.addClass('element');
                element.css('height',scope.screenInfo.zoneHeight+'px');
                element.css('width',Math.floor(scope.screenInfo.zoneHeight/d.cover.height*d.cover.width)+'px');
                var object = new CSS3DObject(element);
                targets.push(x);
                object.position.x=x;
                object.height=scope.screenInfo.zoneHeight;
                object.width=scope.screenInfo.zoneHeight/d.cover.height*d.cover.width;
                x+=object.width+scope.configs.gap;
                scope.css3dScene.add(object);
                scope.endPosition=x+object.width;
                objects.push(object);
              }
            });
            scope.css3dObjects=objects;
            scope.css3dTargets=targets;
          }

          //end link function
        }
      }
    }]);
}());
