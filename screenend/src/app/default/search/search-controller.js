(function(){
  'use strict';
  angular.module('mksense.default.search')
  .controller('SearchController', [
    '$scope',
    '$http',
    '$log',
    function(
      $scope,
      $http,
      $log
    ){
      $scope.search=function(){
        $scope.url=$scope.url.replace(/\s/g,'%20');
        $http.get($scope.url)         
        .success(function(data, status, headers, config) {
          var items=[];
          for(var i in data){
            if(data[i].artObjects){
              items=items.concat(data[i].artObjects);
            }else{
              items.push(data[i]); 
            }
          }
          $scope.items=items;
          console.log($scope.items);
        })
        .error(function(data, status, headers, config) {
          $scope.items=[];
        });
      };
    }]);
}());
