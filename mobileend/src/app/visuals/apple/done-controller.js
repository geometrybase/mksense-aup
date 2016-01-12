(function(){
  'use strict';

    angular.module('mksense.visuals.apple')
    .controller('DoneController', [
      '$scope',
      'mkSocket',
      '$log',
      '$window',
      '$stateParams',
      '$timeout',
      '$state',
      function(
        $scope,
        mkSocket,
        $log,
        $window,
        $stateParams,
        $timeout,
        $state
      ){

        var screenInfo={};
        screenInfo.screenNumber=$stateParams.screenNumber;
        screenInfo.screenId='apple-'+screenInfo.screenNumber;
        screenInfo.visualId='apple';
        $scope.back=function(){
          $log.info('back');
          $scope.fakeNews=undefined;
          $state.go('visuals.apple',{screenNumber:screenInfo.screenNumber},{reload:true})
        };

      }]);

}());
