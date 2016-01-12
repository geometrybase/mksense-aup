(function() {
  'use strict';
  angular.module('mksense.exhibition')
  .controller('ExhibitionController', [
    '$scope', '$state','$stateParams','$log','$http','mkConfig','$rootScope',
    function controller(
      $scope, $state,$stateParams,$log,$http,mkConfig,$rootScope
    ){
      var logger=$log.getInstance('ExhibitionController');
      logger.debug('initial exhibition controller');
      var exhibitionId=$stateParams.exhibitionId;

      function joinExhibition(room){
        $rootScope.socketRooms.exhibition=room; 
        $rootScope.socket.emit('joinExhibition',room); 
      }

      function joinExhibitionCallback(room){
        logger.debug('join exhibition room',room);
        $scope.$broadcast('joinExhibition',room);
      }

      function joinExhibitionErrorCallback(error){
        $rootScope.socketRooms.exhibition=null; 
        logger.error('join exhibition room error',error);
      }

      if($rootScope.addressId)
        joinExhibition($rootScope.addressId+'_'+exhibitionId);

      $scope.$on('addressId',function(event,addressId){
        if(!$rootScope.socketRooms.exhibition)
          joinExhibition(addressId+'_'+exhibitionId);
      });

      $rootScope.socket.on('joinExhibition',joinExhibitionCallback);
      $rootScope.socket.on('joinExhibitionError',joinExhibitionErrorCallback);

      $http.get(mkConfig.cmsServer+'exhibition/'+exhibitionId+'?populate=[scenes]')
      .then(function(response) {
        $scope.exhibition=response.data;
        $scope.$broadcast('exhibition',$scope.exhibition);
        logger.debug('exhibition data',$scope.exhibition);
      });

      $scope.$on('$destroy',function(){
        $rootScope.socket.removeListener('joinExhibition',joinExhibitionCallback);
        $rootScope.socket.removeListener('joinExhibitionError',joinExhibitionErrorCallback);
        $rootScope.socket.emit('leaveRoom',$rootScope.socketRooms.exhibition);
        logger.debug('destroy exhibition',exhibitionId);
      });

    }]);

}());
