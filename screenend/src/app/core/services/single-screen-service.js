(function() {
  'use strict';

  angular.module('mksense.core.services')
  .factory('SingleScreenService',[
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
          $log.info(scope.socket);
          scope.screenInfo=screenInfo;

          scope.$on('$destroy',function(){
            $log.info('destroy scope and socket');
            scope.socket.removeAllListeners();
            scope.socket.disconnect(true); 
          });

          scope.$on('$viewContentLoaded', function() {  
            $log.info('$viewContentLoaded, get screen info');
            scope.screenInfo.screenWidth=element.innerWidth;
            scope.screenInfo.screenHeight=element.innerHeight;
            scope.screenInfo.zone={
              width:element.innerWidth,
              height:element.innerHeight
            }; 
            scope.screenInfo.screenPosition={x:0,y:0};
            if(scope.socket){
              scope.$broadcast('screenInfoUpdate',scope.screenInfo)
            }
          });

          scope.socket.on('connect',function(){
            $log.info('screen-'+scope.screenInfo.screenNumber+'\'s socket connected');
            if(scope.screenInfo.screenWidth&&scope.screenInfo.screenHeight){
              $timeout.cancel(scope.joinVisual);
              scope.joinVisual=$timeout(function(){
                scope.$broadcast('screenInfoUpdate',scope.screenInfo)
                $log.info('emit join visual event');
                scope.socket.emit('joinVisual',scope.screenInfo);
              },100)
            }
          });

          scope.socket.on('reconnect',function(){
            $log.info('reconnect'); 
          });

          $window.onresize=function(){
            $log.info('window resize, update broadcast screenInfoUpdate');
            scope.screenInfo.screenWidth=element.innerWidth;
            scope.screenInfo.screenHeight=element.innerHeight;
            scope.screenInfo.zone={
              width:element.innerWidth,
              height:element.innerHeight
            }; 
            scope.screenInfo.screenPosition={x:0,y:0};
            if(scope.socket){
              scope.$broadcast('screenInfoUpdate',scope.screenInfo)
            }
          }

          scope.socket.on('reconnect',function(){
            $log.info(scope.screenInfo.screenNumber+'\'s socket reconnected');
          });

        }
      }
    }
  ]);

}());
