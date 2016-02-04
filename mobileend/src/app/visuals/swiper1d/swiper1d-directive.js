(function(){
  'use strict';
  angular.module('mksense.visuals.swiper1d')
  .directive('mksenseSwiper1d', [
    '$log','$timeout','$window','Swiper','$state',
    function($log,$timeout,$window,Swiper,$state){
      return {
        transclude:false,
        restrict:'EA',
        templateUrl:'/visuals/swiper1d/swiper1d-directive.html',
        link:function(scope,element){
 
          var logger=$log.getInstance('SWIPER1D-DIRECTIVE');
          scope.state=$state.current;
          logger.debug(scope.state);

          var swiper = new Swiper('.swiper-container', {
            pagination: '.swiper-pagination',
            spaceBetween:20,
            paginationClickable: true
          });
          if(scope.mobileInResponse){
            logger.info('mobile in before');
            mobileInResponse(scope.mobileInResponse);
          }

          swiper.on('slideNextEnd',function(){
            scope.$emit('mobileAction',{type:'next',index:swiper.slides[swiper.activeIndex].index});
            scope.$emit('artObject',swiper.slides[swiper.activeIndex].artObject);
          });

          swiper.on('slidePrevEnd',function(){
            scope.$emit('mobileAction',{type:'prev',index:swiper.slides[swiper.activeIndex].index});
            scope.$emit('artObject',swiper.slides[swiper.activeIndex].artObject);
          });

          scope.$on('mobileInResponse',function(event,res){
            mobileInResponse(res);
          });

          function mobileInResponse(res){
            swiper.removeAllSlides();
            var objects=res.payload.objects;
            objects.forEach(function(object){
              swiper.appendSlide('<div class="swiper-slide" style="background-image:url(\''+object.cover.url+'?imageView2/2/w/640\')"></div>');
            });
            swiper.slides[0].index=res.payload.index;
            swiper.slides[0].artObject=objects[0];
            swiper.slides[1].index=res.payload.index+1;
            swiper.slides[1].artObject=objects[1];
            swiper.slides[2].index=res.payload.index+2;
            swiper.slides[2].artObject=objects[2];
            swiper.slideTo(1,0,false);
            scope.$emit('artObject',swiper.slides[1].artObject);
          }

          scope.$on('mobileActionResponse',function(event,res){
            var object=res.payload.object;
            if(object && object.cover && object.cover.url){
              if(res.payload.type==='next' && swiper.isEnd){
                swiper.appendSlide('<div class="swiper-slide" style="background-image:url(\''+object.cover.url+'?imageView2/2/w/640\')"></div>');
                swiper.slides[swiper.slides.length-1].index=res.payload.index;
                swiper.slides[swiper.slides.length-1].artObject=object;
                swiper.removeSlide(0);
              }
              if(res.payload.type==='prev' &&  swiper.isBeginning){
                swiper.prependSlide(['<div class="swiper-slide" style="background-image:url(\''+object.cover.url+'?imageView2/2/w/640\')"></div>']);
                swiper.slides[0].index=res.payload.index;
                swiper.slides[0].artObject=object;
                swiper.removeSlide(swiper.slides.length-1);
              }
            }
          });

        }
      };
    }]);
}());
