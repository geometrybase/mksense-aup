(function() {
  'use strict';
  angular.module('mksense.scene')
  .controller('SceneController', [
    '$scope', '$state','$stateParams','$log','$http','mkConfig','$rootScope','$localStorage',
    function controller(
      $scope, $state,$stateParams,$log,$http,mkConfig,$rootScope,$localStorage
    ){
      var logger=$log.getInstance('SceneController');
      var exhibitionId=$stateParams.exhibitionId;
      var sceneId=$stateParams.sceneId;
      logger.debug('initial scene',sceneId);

      if($rootScope.socketRooms.exhibition)
        joinScene($rootScope.socketRooms.exhibition+'_'+sceneId);

      $scope.$on('joinExhibition',function(event,exhibitionRoom){
        if(!$rootScope.socketRooms.scene)
          joinScene($rootScope.socketRooms.exhibition+'_'+sceneId);
      });

      $rootScope.socket.on('joinScene',joinSceneCallback)
      $rootScope.socket.on('joinSceneError',joinSceneErrorCallback);

      function joinScene(room){
        $rootScope.socketRooms.scene=room; 
        $rootScope.socket.emit('joinScene',room); 
      }
      function joinSceneCallback(room){
        logger.debug('join scene room',room);
        $scope.$broadcast('joinScene',room);
      }
      function joinSceneErrorCallback(error){
        $rootScope.socketRooms.scene=null;
        logger.error('join scene room error',error);
      }

      $scope.exhibitionId=exhibitionId;

      if($localStorage[exhibitionId+'_'+sceneId]){
          $scope.scene=$localStorage[exhibitionId+'_'+sceneId];
          $scope.$broadcast('scene',$scope.scene);
          logger.debug('scene data',$scope.scene);
      }else{
        $http.get(mkConfig.cmsServer+'exhibition/'+exhibitionId+'/scene/'+sceneId)
        .then(function(response) {
          $scope.scene=response.data;
          $localStorage[exhibitionId+'_'+sceneId]=$scope.scene;
          $scope.$broadcast('scene',$scope.scene);
          logger.debug('scene data',$scope.scene);
        });
      }

      $scope.$on('$destroy',function(event){
        logger.debug('leave scene room',$rootScope.socketRooms.scene);
        $rootScope.socket.removeListener('joinScene',joinSceneCallback);
        $rootScope.socket.removeListener('joinSceneError',joinSceneErrorCallback);
        $rootScope.socket.emit('leaveRoom',$rootScope.socketRooms.scene);
        logger.debug('destroy scene',sceneId); 
      });

    }]);

}());
