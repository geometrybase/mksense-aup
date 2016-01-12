(function(){
  'use strict';

  angular.module('mksense.visuals.qrcode')
  .controller('QrcodeController', [
    '$scope',
    'mkSocket',
    '$log',
    '$window',
    '$stateParams',
    '$timeout',
    '$interval',
    '$state',
    function(
      $scope,
      mkSocket,
      $log,
      $window,
      $stateParams,
      $timeout,
      $interval,
      $state
    ){

      if (screenfull.enabled) {
          screenfull.request();
      }


      var screenInfoGrid={};
      screenInfoGrid.screenNumber=$stateParams.screenNumber;
      screenInfoGrid.screenId='grid-'+screenInfoGrid.screenNumber;
      screenInfoGrid.visualId='grid';
      var screenInfoApple={};
      screenInfoApple.screenNumber=$stateParams.screenNumber;
      screenInfoApple.screenId='apple-'+screenInfoApple.screenNumber;
      screenInfoApple.visualId='apple';

      $scope.socket=new mkSocket();
      $scope.online=true;

      $scope.socket.on('disconnect',function(){
        $scope.online=false;
      });

      $scope.last='';
      $scope.socket.on('qrcodePing',function(screenInfo){
        //$log.info('ping from screen',screenInfo.screenId);
        if(screenInfo.visualId==='apple'){
          if($scope.last!=='apple'){
            $scope.url='http://123.57.158.231:30001/index.html#/visuals/apple/'+$stateParams.screenNumber; 
            $scope.urlVersion=Math.floor($scope.url.length/4);
            $scope.name="Apple comments";
            $scope.last='apple'; 
          }
        }else if(screenInfo.visualId==='grid'){
          if($scope.last!=='grid'){
            $scope.url='http://123.57.158.231:30001/index.html#/visuals/grid/'+$stateParams.screenNumber; 
            $scope.urlVersion=Math.floor($scope.url.length/4);
            $scope.name="Apple products";
            $scope.last='grid';
          }
        }else{
          $scope.url=undefined; 
        }
        $scope.lastPing=Date.now(); 
        //$log.info($scope.url)
      });

      $scope.socket.on('connect',function(){
        screenInfoGrid.mobileId=$scope.socket.id;
        screenInfoApple.mobileId=$scope.socket.id;
        $scope.lastPing=Date.now();
        $scope.pingTimer=$interval(function(){
          $scope.socket.emit('action',{
            name:'qrcodePing',
            to:screenInfoApple.screenId,
            data:screenInfoApple 
          });
          $scope.socket.emit('action',{
            name:'qrcodePing',
            to:screenInfoGrid.screenId,
            data:screenInfoGrid
          });
          if(Date.now()-$scope.lastPing>5000){
            $scope.online=false; 
          }else{
            $scope.online=true; 
          }
        },1000);
      });

    }]);

}());
