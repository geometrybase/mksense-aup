(function(){
  'use strict';
  angular.module('mksense.visuals.fisheye')
  .directive('mksenseFisheye', [
    '$log','Fisheye','d3','$timeout','$window',
    function($log,Fisheye,d3,$timeout,$window){
      return {
        transclude:false,
        restrict:'EA',
        template:'<div></div>',
        link:function(scope,element){


          var logger=$log.getInstance('FISHEYE-DIR');

          scope.$on('mobileInResponse',function(event,res){
            $timeout(function(){
            scope.focus=res.payload.focus;
            scope.imageSizes=res.payload.imageSizes;
            scope.width=$window.innerWidth;
            scope.height=$window.innerHeight;
            scope.xSteps=[];
            scope.imageWidths=[];
            logger.debug(scope.width,scope.height);
            var totalLength=0;
            scope.imageSizes.forEach(function(obj){
              totalLength+=obj.width*scope.height/obj.height; 
            });
            logger.debug('mobileInResponse total length',totalLength);
            var lastX=0;
            scope.imageSizes.forEach(function(obj,index){
                scope.xSteps.push(lastX); 
                scope.imageWidths.push(obj.width*scope.height/obj.height/totalLength*scope.width);
                lastX+=(obj.width*scope.height/obj.height)/totalLength*scope.width;
            });
            scope.xFisheye = Fisheye.scale(d3.scale.identity,totalLength/scope.width*0.5).domain([0, scope.width]).focus(scope.width/2);
            scope.canvas = d3.select(element[0]).append('div')
            .style('width', scope.width+'px')
            .style('height', scope.height/3+'px')
            .style('position', 'relative')
            scope.images = scope.canvas.selectAll('.fisheye-image')
            .data(scope.xSteps)
            .enter().append('div')
            .attr('class','fisheye-image')
            .style('width',function(d,index){
              return scope.imageWidths[index]+'px';
            })
            .style('left',function(d){
              return d+'px'; 
            });
            scope.images.append('div')
            .style('background-image',function(d,index){
              return 'url(\''+scope.imageSizes[index].url+'?imageView2/2/h/500\')'; 
            });
            element.bind('mousemove',function(event){
              scope.xFisheye.focus(event.pageX);
              scope.focus=event.pageX/scope.width;
              scope.$emit('action',{type:'swipe',data:scope.focus});
              redraw();
            });
            element.bind('touchmove',function(event){
              scope.xFisheye.focus(event.touches[0].pageX);
              scope.focus=event.touches[0].pageX/scope.width;
              scope.$emit('action',{type:'swipe',data:scope.focus});
              redraw();
            });


            function redraw() {
              scope.images.style('left',function(d){
                return scope.xFisheye(d)+'px'; 
              })
              .style("width", function(d,index){
                return (scope.xFisheye(scope.xSteps[index+1])-scope.xFisheye(d))+'px'; 
              });
            }

            logger.debug('mobileInResponse',scope.imageWidths);
            logger.debug('mobileInResponse',res);
            },1000);
          });

          scope.$on('mobileActionResponse',function(event,res){
            scope.focus=res.payload;
            logger.debug('mobileActionResponse',res);
          });

        }
      };
    }]);
}());
