(function() {
  'use strict';

  angular.module('mksense.core.services')
  .factory('VisualService',[
    'mkSocket',
    '$window',
    '$log',
    '$timeout',
    function(
      mkSocket,
      $window,
      $log,
      $timeout
    ){
      return {
        initVisual:function(scope,screenInfo,element){

          var Socket=mkSocket();
          scope.socket=Socket;
          scope.screenInfo=screenInfo;

          scope.$on('$destroy',function(){
            $log.info('destroy scope and socket');
            scope.socket.removeAllListeners();
            scope.socket.disconnect(); 
          });

          scope.$on('$viewContentLoaded', function() {  
            scope.screenInfo.screenWidth=element.innerWidth;
            scope.screenInfo.screenHeight=element.innerHeight;
            if(scope.screenInfo.screenId){
              $timeout.cancel(scope.joinVisual);
              scope.joinVisual=$timeout(function(){
                $log.info('Emit join visual event');
                scope.socket.emit('joinVisual',scope.screenInfo);
              },100)
            }
          });

          scope.socket.on('connect',function(){
            $log.info('screen-'+scope.screenInfo.screenNumber+'\'s socket connected');
            if(scope.screenInfo.screenWidth&&scope.screenInfo.screenHeight){
              $timeout.cancel(scope.joinVisual);
              scope.joinVisual=$timeout(function(){
                scope.socket.emit('joinVisual',scope.screenInfo);
              },100)
            }
          });

          $window.onresize=function(){
            scope.screenInfo.screenWidth=element.innerWidth;
            scope.screenInfo.screenHeight=element.innerHeight;
            $timeout.cancel(scope.updateVisual);
            scope.updateVisual=$timeout(function(){
              scope.socket.emit('updateVisual',scope.screenInfo);
            },100)
            //$timeout.cancel(scope.windowResize);
            //scope.windowResize=$timeout(function(){
              //if(scope.socket.id){
                //scope.socket.disconnect();
              //}
              //scope.socket.connect();
            //},100);
          }

          scope.socket.on('reconnect',function(){
            $log.info(scope.screenInfo.screenNumber+'\'s socket reconnected');
            $timeout.cancel(scope.joinVisual);
            scope.joinVisual=$timeout(function(){
              scope.socket.emit('joinVisual',scope.screenInfo);
            },100)
          });

          scope.socket.on('screenInfo',function(){
            $log.info(scope.screenInfo.screenId+' is queryed for screen data');
            scope.socket.emit('screenInfo',scope.screenInfo);
          });

          scope.socket.on('screenInfos',function(screenInfos){
            $log.info(scope.screenInfo.screenId+' got all screen infos');
            var screens=[];
            for(var i in screenInfos){
              screens.push(screenInfos[i]); 
            }
            screens.sort(function(a,b){
              return a.screenNumber>b.screenNumber; 
            }); 
            var x=0;
            var y=0;
            var maxScreenHeight=0;
            var maxScreenWidth=0;
            var screenPosition={x:0,y:0};
            screens.forEach(function(s,index){
              if(s.screenId===scope.screenInfo.screenId){
                screenPosition.x=x; 
              }
              x+=s.screenWidth;
              if(maxScreenWidth<s.screenWidth){
                maxScreenWidth=s.screenWidth;
              }
              if(maxScreenHeight<s.screenHeight){
                maxScreenHeight=s.screenHeight;
              }
            });
            scope.screenInfo.zone={
              width:x,
              height:maxScreenHeight
            }; 
            scope.screenInfo.screenPosition=screenPosition;
            scope.$broadcast('screenInfoUpdate',scope.screenInfo)
          });
        }
      }
    }
  ]);

}());
