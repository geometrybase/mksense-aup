(function(){
  'use strict';

    angular.module('mksense.visuals.three')
    .controller('ThreeController', [
      '$scope',
      'mkSocket',
      '$log',
      '$window',
      '$stateParams',
      '$timeout',
      function(
        $scope,
        mkSocket,
        $log,
        $window,
        $stateParams,
        $timeout
      ){

        var screenInfo={};
        screenInfo.screenNumber=$stateParams.screenNumber;
        screenInfo.screenId='three-'+screenInfo.screenNumber;
        screenInfo.visualId='three';
        $scope.socket=new mkSocket();

        $scope.navigation=function(dir){
          $log.debug(dir);
          var data={
            mobileId:screenInfo.mobileId,
            screenId:screenInfo.screenId,
            visualId:screenInfo.visualId,
            index:$scope.layoutInfo.index,
          };
          switch(dir){
            case 'up':
              data.event={deltaX:0,deltaY:-1};
              break;
            case 'right':
              data.event={deltaX:1,deltaY:0};
              break;
            case 'down':
              data.event={deltaX:0,deltaY:1};
              break;
            default:
              data.event={deltaX:-1,deltaY:0};
          } 
          $scope.socket.emit('action',{
            name:'mobileAction',
            data:data,
            to:screenInfo.visualId
          });
        }

        $scope.onHammer=function(event){
          console.log(event.type);

          if(event.type==='tap'){
            toastr.info('tap');
            $log.info('aaaaaa');
            $scope.xpoint= event.center.x;
            $scope.ypoint= event.center.y;
          }


          if(event.type==='swipe'){
            toastr.info('swipe');
            $log.info('aaaaaa');
            $scope.socket.emit('action',{
              name:'mobileAction',
              data:{
                mobileId:screenInfo.mobileId,
                screenId:screenInfo.screenId,
                visualId:screenInfo.visualId,
                index:$scope.layoutInfo.index,
                event:event
              },
              to:screenInfo.visualId
            });
          }
        };

        $scope.socket.on('connect',function(){
          screenInfo.mobileId=$scope.socket.id;
          $timeout(function(){
            $scope.socket.emit('joinScreen',screenInfo);
          },0);
        });

        $scope.socket.on('joinScreen',function(data){
          if(screenInfo.mobileId==data.mobileId){
          }
        });

        $scope.socket.on('layoutInfo',function(layoutInfo){
          if(layoutInfo){
            $log.debug(layoutInfo);
            $scope.layoutInfo=layoutInfo;
            $scope.cover=layoutInfo.image;
            $scope.$apply();
          }else{
            $timeout(function(){
              $scope.socket.emit('joinScreen',screenInfo);
            },3000);
          }
        });

      }]);

}());
