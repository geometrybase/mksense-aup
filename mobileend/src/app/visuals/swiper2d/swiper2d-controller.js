(function(){
  'use strict';


  angular.module('mksense.visuals.swiper2d')
  .controller('Swiper2dController', [
    '$scope','$log', '$state','$localStorage', '$sce',
    function(
      $scope,$log,$state,$localStorage,$sce
    ){

      var logger=$log.getInstance('SWIPER2D CONTROLLER');

      $scope.profileUrl="http://img3.imgtn.bdimg.com/it/u=4253182154,1533149835&fm=21&gp=0.jpg"

      if ($localStorage.credentials.user.headimgurl){
      $scope.profileUrl=$localStorage.credentials.user.headimgurl;
      }

      $scope.show=true;
      $scope.poster = 'visuals/swiper1d/icon/like.svg';
      $scope.toggleIcons=function(){
        $scope.show=!$scope.show; 
      }
      $scope.showMenu=true;

      $scope.toggleSharemenu=function(){
       $scope.showMenu=!$scope.showMenu; 
      }

      $scope.toMoreInfo=function(){
        $state.go('scene.swiper2d.moreinfo');
      }

      $scope.state=$state.current;
      logger.debug($scope.state);

      var swiper2dArtObject=$scope.$on('artObject',function(event,artObject){
        $scope.artObject=artObject; 
        $scope.url=$sce.trustAsResourceUrl('http://api.mksense.cn/artobject/'+artObject.id+'/details');
      });

      var stateChangeStart=$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){   
        logger.debug('state change to',toState.name);
        $scope.state=toState;
        if(fromState.name==='scene.swiper2d.moreinfo'){
          $scope.$emit('action',{type:'status',data:'hidemoreinfo'});
        }
        if(fromState.name==='scene.swiper2d.comment'){
        }
      });

       $scope.$on('notification', function (evt, value) {
        $scope.pressPos = value;
      });

      $scope.isLiked='true';
      $scope.likeNumber=150;

      $scope.like=function(){
        $scope.$emit('mobileLike',{});  
        if ($scope.isLiked == 'true') {
            $scope.isLiked = 'false';
            $scope.poster = 'visuals/swiper1d/icon/liked.svg';
            $scope.likeNumber+=1;
        } else if ($scope.isLiked == 'false') {
            $scope.isLiked = 'true';
            $scope.poster = 'visuals/swiper1d/icon/like.svg';
            $scope.likeNumber-=1;
        }
      };

        /* $scope.comment=function(event){
         //$scope.$emit('mobileComment',{text:this.text, position:$scope.pressPos}); 
         $state.go('scene.swiper2d');//then(function(){$state.go('^')});
         $scope.text=this.text; 
       };*/

      $scope.instruction='true';
      $scope.hideInstruction=function(){
       $scope.instruction=!$scope.instruction;
      };


      $scope.close=function(){
        $state.go('scene.swiper2d');//.//then(function(){$state.go('^')});
      };

      $scope.$on('mobileLikeResponse',function(event,response){
        logger.debug(response);
      });

      $scope.$on('mobileCommentResponse',function(event,response){
        logger.debug(response);
      });


      $scope.$on('$destroy',function(){
        stateChangeStart();
        //artObject();
      });  

    }]);
}());
