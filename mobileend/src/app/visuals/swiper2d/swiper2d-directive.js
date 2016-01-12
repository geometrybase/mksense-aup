(function(){
  'use strict';
  angular.module('mksense.visuals.swiper2d')
  .directive('mksenseSwiper2d', [
    '$log','$timeout','$window','Swiper','$state',
    function($log,$timeout,$window,Swiper,$state){
      return {
        transclude:false,
        restrict:'EA',
        templateUrl:'/visuals/swiper2d/swiper2d-directive.html',
        link:function(scope,element){

          var logger=$log.getInstance('SWIPER2D-DIRECTIVE');
          scope.state=$state.current;
          logger.debug(scope.state);

          var swiper = new Swiper('.swiper-container-h', {
            pagination: '.swiper-container-h>.swiper-pagination',
            longSwipesRatio:0.3,
            keyboardControl:true,
            spaceBetween:20,
            paginationClickable: true
          });
          var swipers=[undefined,undefined,undefined];

          swiper.on('slideNextEnd',function(){
            console.log('next current',swipers[swiper.activeIndex].activeIndex);
            printSwiperIndexes();
            scope.$emit('mobileAction',{type:'right',index:swipers[swiper.activeIndex].slides[swipers[swiper.activeIndex].activeIndex].index});
            scope.$emit('swiper2dArtObject',swipers[swiper.activeIndex].slides[swipers[swiper.activeIndex].activeIndex].artObject);
          });

          swiper.on('slidePrevEnd',function(){
            console.log('pre current',swipers[swiper.activeIndex].activeIndex);
            printSwiperIndexes();
            scope.$emit('mobileAction',{type:'left',index:swipers[swiper.activeIndex].slides[swipers[swiper.activeIndex].activeIndex].index});
            scope.$emit('swiper2dArtObject',swipers[swiper.activeIndex].slides[swipers[swiper.activeIndex].activeIndex].artObject);
          });


          scope.$on('mobileInResponse',function(event,res){
            swiper.removeAllSlides();
            var objects=res.payload.objects;
            var indexes=res.payload.indexes;
            var grids=[[indexes[2],indexes[1],indexes[8]],[indexes[3],indexes[0],indexes[7]],[indexes[4],indexes[5],indexes[6]]];
            var objIndexes=[[2,1,8],[3,0,7],[4,5,6]];
            grids.forEach(function(g,index){
              swiper.appendSlide('<div class="swiper-slide"><div class="swiper-container swiper-container-v swiper-container-v-'+index+'"><div class="swiper-wrapper"></div></div></div>')
            })
            swipers.forEach(function(s,swiperIndex){
              swipers[swiperIndex] = new Swiper('.swiper-container-v-'+swiperIndex, {
                keyboardControl:true,
                spaceBetween:20,
                longSwipesRatio:0.2,
                direction: 'vertical'
              });
              objIndexes[swiperIndex].forEach(function(i,index){
                swipers[swiperIndex].appendSlide('<div class="swiper-slide" style="background-image:url(\''+objects[i].cover.url+'?imageView2/2/w/640\')"></div>');
              });
              swipers[swiperIndex].slideTo(1,0,false);
              swipers[swiperIndex].slides.each(function(index,s){
                s.index=grids[swiperIndex][index];
                s.artObject=objects[objIndexes[swiperIndex][index]];
              });
            });
            printSwiperIndexes();
            swiper.slideTo(1,0,false);
            swipers.forEach(function(s){
              s.on('slideNextEnd',function(){
                scope.$emit('mobileAction',{type:'down',index:s.slides[s.activeIndex].index});
                scope.$emit('swiper2dArtObject',s.slides[s.activeIndex].artObject);
              });
              s.on('slidePrevEnd',function(){
                scope.$emit('mobileAction',{type:'up',index:s.slides[s.activeIndex].index});
                scope.$emit('swiper2dArtObject',s.slides[s.activeIndex].artObject);
              });
            });
          });

          function printSwiperIndexes(){
            for(var i=0; i<3; i++){
              var str='';
              for(var j=0; j<3; j++){
                str+=swipers[j].slides[i].index+'\t';
              } 
              console.log(str);
            } 
            var str='activeIndex';
            for(var i=0; i<3; i++){
              str+=' '+swipers[i].slides[swipers[i].activeIndex].index;
            }
            console.log(str);
          }

          scope.$on('mobileActionResponse',function(event,res){
            var objects=res.payload.objects;
            var indexes=res.payload.indexes;
            if(objects.length===3 && indexes.length===3){
              if(res.payload.type==='right' && swiper.isEnd){
                swipers[0].slides.each(function(index,s){
                  s.index=indexes[index]; 
                  s.artObject=objects[index];
                  s.style.backgroundImage='url(\''+objects[index].cover.url+'?imageView2/2/w/640\')';
                });
                var slide=swiper.slides[0];
                swiper.removeSlide(0);
                swipers.push(swipers[0]);
                swiper.appendSlide(slide)
                swipers.shift();
                printSwiperIndexes();
              }
              if(res.payload.type==='left' &&  swiper.isBeginning){
                swipers[2].slides.each(function(index,s){
                  s.index=indexes[index]; 
                  s.artObject=objects[index];
                  s.style.backgroundImage='url(\''+objects[index].cover.url+'?imageView2/2/w/640\')';
                });
                var slide=swiper.slides[2];
                swiper.removeSlide(2);
                swipers.unshift(swipers[2]);
                swiper.prependSlide(slide)
                swipers.pop();
                printSwiperIndexes();
              }
            }else if(objects.length===1 && indexes.length===1){
              var currentSwiper=swipers[swiper.activeIndex];
              var previousIndex=res.payload.previousIndex; 
              var currentIndex=currentSwiper.slides[currentSwiper.activeIndex].index;
              console.log(previousIndex,currentIndex,res.payload.type,currentSwiper.isBeginning);
              if(res.payload.type==='up' && currentSwiper.isBeginning && previousIndex === currentIndex){
                var s=currentSwiper.slides[2]; 
                s.index=indexes[0];
                s.artObject=objects[0];
                s.style.backgroundImage='url(\''+objects[0].cover.url+'?imageView2/2/w/640\')';
                currentSwiper.removeSlide(2);
                currentSwiper.prependSlide(s);
              }
              if(res.payload.type==='down' && currentSwiper.isEnd && previousIndex === currentIndex){
                var s=currentSwiper.slides[0]; 
                s.index=indexes[0];
                s.artObject=objects[0];
                s.style.backgroundImage='url(\''+objects[0].cover.url+'?imageView2/2/w/640\')';
                currentSwiper.removeSlide(0);
                currentSwiper.appendSlide(s);
              }
            }
          });

        }
      };
    }]);
}());
