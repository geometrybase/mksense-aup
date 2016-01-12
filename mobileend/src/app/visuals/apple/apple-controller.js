(function(){
  'use strict';

    angular.module('mksense.visuals.apple')
    .controller('AppleController', [
      '$scope',
      'mkSocket',
      '$log',
      '$window',
      '$stateParams',
      '$timeout',
      '$state',
      '$rootScope',
      '$interval',
      function(
        $scope,
        mkSocket,
        $log,
        $window,
        $stateParams,
        $timeout,
        $state,
        $rootScope,
        $interval
      ){

        var screenInfo={};
        screenInfo.screenNumber=$stateParams.screenNumber;
        screenInfo.screenId='apple-'+screenInfo.screenNumber;
        screenInfo.visualId='apple';
        if(!$rootScope.socket){
          $log.info('create new socket!');
          $rootScope.socket=new mkSocket();
        }else{
          $log.info('use old socket');
          screenInfo.mobileId=$rootScope.socket.id;
          $rootScope.socket.emit('query',{to:screenInfo.screenId,name:'queryLayoutInfo',data:screenInfo});
        }
        $log.info($scope.socket);

        $rootScope.socket.on('screenPing',function(screenInfo){
          $log.info('ping from screen',screenInfo.screenId);
          $scope.lastPing=Date.now(); 
        });

        $scope.online=true;
        $rootScope.socket.on('connect',function(){
          $log.info('socket connected.');
          screenInfo.mobileId=$scope.socket.id;
          $scope.lastPing=Date.now();
          $scope.pingTimer=$interval(function(){
            $log.debug('ping screen');
            $rootScope.socket.emit('action',{
              name:'mobilePing',
              data:{
                mobileId:screenInfo.mobileId,
                screenId:screenInfo.screenId,
                visualId:screenInfo.visualId,
              },
              to:screenInfo.screenId
            });
            if(Date.now()-$scope.lastPing>5000){
              $scope.online=false; 
            }else{
              $scope.online=true; 
            }
          },1000);
          $timeout(function(){
            $scope.socket.emit('joinScreen',screenInfo);
          },0);
        });

        $rootScope.socket.on('joinScreen',function(data){
          $log.info('joined to screen');
        });

        $rootScope.socket.on('layoutInfo',function(layoutInfo){
          $log.info('get layout info');
          if(layoutInfo){
            $log.debug(layoutInfo);
            $scope.layoutInfo=layoutInfo;
            $scope.$apply();
          }else{
            $timeout(function(){
              $scope.socket.emit('joinScreen',screenInfo);
            },3000);
          }
        });

        $scope.sendComment=function(comment){
          $log.info(comment); 
          $timeout(function(){
            if($scope.layoutInfo){
              screenInfo.comment=comment;
              screenInfo.product=$scope.layoutInfo.product;
              $scope.socket.emit('data',{to:screenInfo.visualId,name:'fakeNews',data:screenInfo});
            }else{
              screenInfo.comment=comment;
              $scope.socket.emit('data',{to:screenInfo.visualId,name:'fakeNews',data:screenInfo});
            }
            $state.go('visuals.apple.done',{screenNumber:screenInfo.screenNumber})
          },0);
        };

      }]);

}());
