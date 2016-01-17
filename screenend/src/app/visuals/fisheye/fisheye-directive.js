(function(){
  'use strict';
  angular.module('mksense.visuals')
  .directive('mksenseFisheye',[
    '$log','d3','$timeout','Fisheye','THREE','CSS3DObject','CSS3DRenderer',
    function(
      $log,d3,$timeout,Fisheye,THREE,CSS3DObject,CSS3DRenderer
    ){
      return {
        transclude:false,
        restrict:'EA',
        templateUrl:'/visuals/fisheye/fisheye.html',
        link:function(scope,element){

          var logger=$log.getInstance('FISHEYE-DIR');
          var random= new Math.seedrandom('mksenseFisheye');
          element.css('opacity','0');
          element.css('height','100%');
          element.css('cursor','none')
          element.css('border-bottom','solid red 1px');

          scope.artObjects=scope.artObjects.slice(0,500);

          var width = scope.screenInfo.zoneWidth;
          var height = scope.screenInfo.zoneHeight;

          var xSteps=[];
          var widths=[];
          var indexes=[];
          var totalLength=0;
          var gap=0;
          var maxWidth=0;
          var maxIndex=-1;
          var targetWidths=[];
          var currentWidths=[];
          var targetPositions=[];
          var currentPositions=[];

          scope.artObjects.forEach(function(obj){
            if(obj && obj.cover){
              totalLength+=obj.cover.width*scope.screenInfo.zoneHeight/obj.cover.height+gap;
            }
          });

          var lastX=0;
          scope.artObjects.forEach(function(obj,index){
            if(obj && obj.cover){
               xSteps.push(lastX); 
               indexes.push(index);
               widths.push(obj.cover.width*scope.screenInfo.zoneHeight/obj.cover.height/totalLength*scope.screenInfo.zoneWidth);
               lastX+=(obj.cover.width*scope.screenInfo.zoneHeight/obj.cover.height+gap)/totalLength*scope.screenInfo.zoneWidth;
            }
          });
          xSteps.push(lastX);
          //xSteps = d3.range(10, width, 50),
         var  ySteps = d3.range(10, height, 50);


          var xFisheye = Fisheye.scale(d3.scale.identity,totalLength/scope.screenInfo.zoneWidth+1).domain([0, scope.screenInfo.zoneWidth]).focus(scope.screenInfo.zoneWidth/2),
          yFisheye = Fisheye.scale(d3.scale.identity).domain([0, scope.screenInfo.zoneHeight]).focus(90);
          
          var canvas = d3.select(element[0]).append('div')
          .style('width',width+'px')
          .style('height',Math.floor(height*0.7)+'px')
          .style('padding-top',Math.floor(height*0.1)+'px')
          .style('position','absolute')
          .style('top','0px')
          .style('left',-scope.screenInfo.x+'px');

          var labelContainer=d3.select(element[0])
          .append('div')
          .style('width','100%')
          .style('height',Math.floor(height*0.2)+'px')
          .style('position','absolute')
          .style('top',Math.floor(height*0.8)+'px')
          .style('left',-scope.screenInfo.x+'px');

          var images = canvas.selectAll('.fisheye-image')
          .data(indexes)
          .enter().append('div')
          .attr('class','fisheye-image')
          .style('height',Math.floor(height*0.7)+'px')
          .style('left',function(d,index){
            return xFisheye(xSteps[index])+'px'; 
          })
          .style("width", function(d,index){
            return (xFisheye(xSteps[index+1])-xFisheye(xSteps[index]))+'px'; 
          });

          var divs=images.append('div')
          .style('background-image',function(d,index){
            return 'url(\''+scope.artObjects[indexes[index]].cover.url+'?imageView2/2/h/'+scope.screenInfo.height+'\')'; 
          })
          .style('background-size',function(d,index){
            if((xFisheye(xSteps[index+1])-xFisheye(xSteps[index]))/(height*0.7)>scope.artObjects[indexes[index]].cover.width/scope.artObjects[indexes[index]].cover.height){
              return 'contain'; 
            }else{
              return 'cover'; 
            } 
          });

          var labels=labelContainer.selectAll('.fisheye-label') 
          .data(indexes)
          .enter().append('div')
          .attr('class','fisheye-label')
          .style('left',function(d,index){
            return xFisheye(xSteps[index])+'px'; 
          })
          .style("width", function(d,index){
            return (xFisheye(xSteps[index+1])-xFisheye(xSteps[index]))+'px'; 
          })
          .attr("class",function(d,index){
            var width=(xFisheye(xSteps[index+1])-xFisheye(xSteps[index])); 
            if(maxWidth<width){
              maxWidth=width; 
              maxIndex=index;
            }
            if(width>150)
              return "fisheye-label fisheye-text";
            else
              return "fisheye-label";
          })
          .text(function(d,index){
            return scope.artObjects[indexes[index]].title; 
          });

          scope.focus=0.5;


          redraw();

          //element.bind('mousemove',function(event){
            //xFisheye.focus(event.pageX);
            //scope.focus=event.pageX/scope.screenInfo.width;
            //if(scope.status==='PLAY'){
              //redraw();
            //}
          //});


          function redraw() {
            maxIndex=-1;
            maxWidth=0;
            images.transition()
            .duration(1000)
            .style('left',function(d,index){
              return xFisheye(xSteps[index])+'px'; 
            })
            .style("width", function(d,index){
              return (xFisheye(xSteps[index+1])-xFisheye(xSteps[index]))+'px'; 
            });

            divs
            .transition()
            .duration(1000)
            .style('background-size',function(d,index){
              var width=xFisheye(xSteps[index+1])-xFisheye(xSteps[index]);
              var height=scope.screenInfo.zoneHeight*0.7;
              var coverWidth=scope.artObjects[indexes[index]].cover.width;
              var coverHeight=scope.artObjects[indexes[index]].cover.height;
              return Math.floor(height/coverHeight*coverWidth)+'px '+Math.floor(height)+'px';
            });

            labels
            .transition()
            .duration(1000)
            .style('left',function(d,index){
              return xFisheye(xSteps[index])+'px'; 
            })
            .style("width", function(d,index){
              return (xFisheye(xSteps[index+1])-xFisheye(xSteps[index]))+'px'; 
            })
            .attr("class",function(d,index){
              var width=(xFisheye(xSteps[index+1])-xFisheye(xSteps[index])); 
              if(maxWidth<width){
                maxWidth=width; 
                maxIndex=index;
              }
              if(width>150)
                return "fisheye-label fisheye-text";
              else
                return "fisheye-label";
            });
            if(maxIndex===-1)
              scope.currentObject=false;
            else
              scope.currentObject=scope.artObjects[maxIndex];
            //yLine.attr("y1", yFisheye).attr("y2", yFisheye);
          }

          scope.$on('mobileIn',function(event,mobileInfo){

            logger.debug('mobileIn',mobileInfo);
            if(maxIndex === -1)
              return logger.error('mobileIn error,there is no max width image in this visual'); 
            var objects=[null,null,null];
            objects[1]=scope.artObjects[indexes[maxIndex]];
            if(maxIndex!==0)
              objects[0]=scope.artObjects[indexes[maxIndex-1]];
            if(maxIndex!==indexes.length-1)
              objects[2]=scope.artObjects[indexes[maxIndex+1]];
            var payload={
              objects:objects,
              index:maxIndex-1
            };
            scope.$emit('mobileInResponse',{mobileInfo:mobileInfo,payload:payload,cache:null});
          });

          scope.$on('mobileAction',function(event,mobileActionInfo){
            if(mobileActionInfo.payload.type==='next')
              scope.$emit('mobileActionResponse',{mobileInfo:mobileActionInfo.mobileInfo,payload:{
                type:'next',
                object:scope.artObjects[indexes[mobileActionInfo.payload.index+1]],
                index:mobileActionInfo.payload.index+1
              }});
            if(mobileActionInfo.payload.type==='prev')
              scope.$emit('mobileActionResponse',{mobileInfo:mobileActionInfo.mobileInfo,payload:{
                type:'prev',
                object:scope.artObjects[indexes[mobileActionInfo.payload.index-1]],
                index:mobileActionInfo.payload.index-1
              }});

            var focus=(xSteps[mobileActionInfo.payload.index]+widths[mobileActionInfo.payload.index]/2);
            logger.debug(focus);
            xFisheye.focus(focus);
            redraw();
          });

          scope.$on('mobileOut',function(event,mobileOutInfo){
            logger.debug('mobileOut',mobileOutInfo);
          });

          scope.$on('fadeIn',function(event){
            element.css('opacity','1');
          });

          scope.$on('fadeOut',function(event){
            element.css('opacity','0');
            $timeout(function(){
              scope.$emit('fadeOutDone');
            },1000);
          });

          scope.$on('$destroy',function(){
            cancelAnimationFrame(scope.animateId);
          });

        }
      }
    }]);
}());
