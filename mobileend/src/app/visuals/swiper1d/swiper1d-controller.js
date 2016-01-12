(function(){
  'use strict';

  angular.module('mksense.visuals.swiper1d')
  .controller('Swiper1dController', [
    '$scope','$log', '$state','$localStorage', 
    function(
      $scope,$log,$state,$localStorage
    ){
      //alert(JSON.stringify($localStorage.credentials));
      var logger=$log.getInstance('SWIPER1D CONTROLLER');
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
        $state.go('scene.swiper1d.moreinfo');
      }

      $scope.state=$state.current;
      logger.debug($scope.state);

      var swiper1dArtObject=$scope.$on('swiper1dArtObject',function(event,artObject){
        $scope.artObject=artObject; 
      });

      var stateChangeStart=$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){   
        logger.debug('state change to',toState.name);
        $scope.state=toState;
        if(fromState.name==='scene.swiper1d.moreinfo'){
          $scope.$emit('action',{type:'status',data:'hidemoreinfo'});
        }
        if(fromState.name==='scene.swiper1d.comment'){
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

      $scope.instruction='true';
      $scope.hideInstruction=function(){
       $scope.instruction=!$scope.instruction;
      };

      $scope.comment=function(){
        $scope.$emit('mobileComment',{text:this.text, position:$scope.pressPos}); 
        $state.go('scene.swiper1d');//.//then(function(){$state.go('^')});
        $scope.text=this.text; 
      };

      $scope.close=function(){
        $state.go('scene.swiper1d');//.//then(function(){$state.go('^')});
      };

      $scope.$on('mobileLikeResponse',function(event,response){
        logger.debug(response);
      });

      $scope.$on('mobileCommentResponse',function(event,response){
        logger.debug(response);
      });


      $scope.$on('$destroy',function(){
        stateChangeStart();
        swiper1dArtObject();
      });

    }]);
}());
