(function(){
  'use strict';
  angular.module('mksense.scene')
  .controller('SceneController', [
    '$scope','$log','$stateParams','mkSocket','$state','$http','MKConfig','$window','$location',
    function(
      $scope,$log,$stateParams,mkSocket,$state,$http,MKConfig,$window,$location
    ){

      var logger=$log.getInstance('SCENE-CONTROLLER');////
      var visualTypeToViewsMap={
        grid:'scene.swiper2d',
        //grid:'scene.grid', 
        particle:'scene.grid',
        fisheye:'scene.swiper1d'
      }

      $scope.mobileInfo={
        addressId:$stateParams.addressId,
        exhibitionId:$stateParams.exhibitionId,
        sceneId:$stateParams.sceneId,
        visualId:'null',
        screenIndex:parseInt($stateParams.screenIndex)
      };

      $scope.mobileInfo.socketRooms={
        exhibition:$scope.mobileInfo.addressId+'_'+$scope.mobileInfo.exhibitionId ,
        scene:$scope.mobileInfo.addressId+'_'+$scope.mobileInfo.exhibitionId+'_'+$scope.mobileInfo.sceneId,
        screen:$scope.mobileInfo.addressId+'_'+$scope.mobileInfo.exhibitionId+'_'+$scope.mobileInfo.sceneId+'_'+$scope.mobileInfo.screenIndex
      }

      logger.debug('MobileInfo',$scope.mobileInfo);

      if($scope.socket.id){
        $scope.mobileInfo.mobileId=$scope.socket.id; 
        socketConnect();
      }else{
        $scope.socket.on('connect',socketConnect);
      }
      $scope.socket.on('reconnect',socketConnect);
      $scope.socket.on('mobileInResponse',mobileInResponse);
      $scope.socket.on('mobileActionResponse',mobileActionResponse);

      $scope.mobileAction=$scope.$on('mobileAction',function(event,data){
        logger.debug('Send action data',data);
        sendToScene('mobileAction',data);
      });

      $scope.mobileArtObject=$scope.$on('artObject',function(event,data){
        $scope.artObject=data; 
      });

      $scope.mobileComment=$scope.$on('mobileComment',function(event,data){
        logger.debug('mobileComment',data);
        $http.post(MKConfig.cmsServer+$scope.mobileInfo.exhibitionId+'/'+$scope.mobileInfo.sceneId+'/'+$scope.mobileInfo.visualId+'/'+$scope.artObject.id+'/comment',data)
        .then(function successCallback(response) {
          $scope.$broadcast('mobileCommentResponse',response);
        }, function errorCallback(response) {
          $scope.$broadcast('mobileCommentResponse',response);
        });
        sendToScreen('mobileComment',data); 
      });

      $scope.mobileLike=$scope.$on('mobileLike',function(event,data){
        logger.debug('mobileLike');
        $http.post(MKConfig.cmsServer+$scope.mobileInfo.exhibitionId+'/'+$scope.mobileInfo.sceneId+'/'+$scope.mobileInfo.visualId+'/'+$scope.artObject.id+'/like')
        .then(function successCallback(response) {
          $scope.$broadcast('mobileLikeResponse',response);
        }, function errorCallback(response) {
          $scope.$broadcast('mobileLikeResponse',response);
        });
        sendToScreen('mobileLike'); 
      });


      function socketConnect(){
        logger.debug('Socket connected',$scope.mobileInfo);
        $scope.mobileInfo.mobileId=$scope.socket.id; 
        $scope.socket.emit('mobileIn',$scope.mobileInfo);
      }

      function mobileInResponse(payload){
        logger.debug('mobileInResponse',payload);
        $scope.mobileInfo.visualId=payload.visualId?payload.visualId:'null';
        $state.go(visualTypeToViewsMap[payload.visualType]);
        $scope.mobileInResponse=payload;
        $scope.$broadcast('mobileInResponse',payload);
      }

      function mobileActionResponse(payload){
        logger.debug('mobileActionResponse',payload);
        $scope.$broadcast('mobileActionResponse',payload);
      }


      function sendToExhibition(eventName,payload){
        if(!$scope.mobileInfo.socketRooms || !$scope.mobileInfo.socketRooms.exhibition){
          logger.error('exhibition room is not existed for sending message');
          return;
        }
        sendMobileMessage($scope.mobileInfo.socketRooms.exhibition,eventName,payload);
      }

      function sendToScene(eventName,payload){
        if(!$scope.mobileInfo.socketRooms || !$scope.mobileInfo.socketRooms.scene){
          logger.error('scene room is not existed for sending message');
          return;
        }
        sendMobileMessage($scope.mobileInfo.socketRooms.scene,eventName,payload);
      }


      function sendToScreen(eventName,payload){
        if(!$scope.mobileInfo.socketRooms || !$scope.mobileInfo.socketRooms.screen){
          logger.error('screen room is not existed for sending message');
          return;
        }
        sendMobileMessage($scope.mobileInfo.socketRooms.screen,eventName,payload);
      }

      function sendMobileMessage(to,eventName,payload){
        $scope.socket.emit('mobileMessage',{
          to:to,
          eventName:eventName,
          payload:{
            payload:payload,
            mobileInfo:$scope.mobileInfo
          }
        }); 
      }


    }]);
}());
