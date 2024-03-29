(function(){
  'use strict';
  angular.module('mksense.visuals')
  .directive('mksenseGrid', [
    '$log','$interval','$timeout','THREE','TWEEN','CSS3DRenderer','_','CSS3DObject',
    function($log,$interval,$timeout,THREE,TWEEN,CSS3DRenderer,_,CSS3DObject){
      return {
        transclude:true,
        restrict:'EA',
        templateUrl:'/visuals/grid/grid.html',
        link:function(scope,element){

          var logger=$log.getInstance('MKSENSE-GRID');
          var random= new Math.seedrandom('mksenseGrid');
          var arrIndexes=[];

          function printIndexes(){
            for(var i=0; i<3; i++){
              var str='';
              arrIndexes.forEach(function(index){
                str+=index[i]+'\t'; 
              }); 
              console.log(str);
            } 
          }

          var currentIndex=null;

          element.css('width',scope.screenInfo.width+"px");
          element.css('height',scope.screenInfo.height+"px");
          element.css('display','none');
          element.css('transition','opacity 2s cubic-bezier(0.55, 0.06, 0.68, 0.19)');
          scope.configs=adaptConfigs();
          scope.keyGroups=groupByKey();
          scope.gridGroups=groupByGrid();
          scope.css3dScene = new THREE.Scene();
          scope.zIndex=1;
          populateObjects();
          scope.renderer=new CSS3DRenderer();
          scope.renderer.domElement.css('position','absolute');
          element.append(scope.renderer.domElement);
          scope.status="PENDING";
          scope.$emit("compileDone",scope.sequenceIndex);
          scope.timerMap={};

          var mobileIn=scope.$on('mobileIn',function(event,mobileInfo){
            logger.debug('mobileIn',mobileInfo);
            var index=getCenterIndex();
            var indexes=get9Indexes(index);
            var objects=indexes.map(function(index){
              return scope.artObjects[index]; 
            });
            scope.css3dObjects[indexes[0]].mobileCount++
            scope.css3dObjects[indexes[0]].element.addClass('scaler');
            scope.$emit('mobileInResponse',{mobileInfo:mobileInfo,payload:{objects:objects,indexes:indexes},cache:scope.css3dObjects[indexes[0]]});
            scope.$emit('publish',{type:'actionEntry',payload:objects[0]});
          });

          scope.$on('mobileAction',function(e,mobileActionInfo){
            var event=mobileActionInfo.payload;
            var lastObject=mobileActionInfo.cache;
            if(!lastObject){
              scope.$emit('mobileIn',mobileActionInfo.mobileInfo);
            }else{
              if(event.type==='left'){
                var newObject=scope.css3dObjects[event.index];
                if(newObject.position.y>lastObject.position.y){
                  keepSelectedtoCenterRow2(event.index,true);
                  transform(TWEEN.Easing.Cubic.InOut);
                }else if(newObject.position.y<lastObject.position.y){
                  keepSelectedtoCenterRow2(event.index,false);
                  transform(TWEEN.Easing.Cubic.InOut);
                }
                var indexes=get3Indexes(event.index,[-1,0,0]); 
                var objects=indexes.map(function(index){
                  return scope.artObjects[index];
                });
                if(lastObject.mobileCount>0)
                  lastObject.mobileCount--;
                if(lastObject.mobileCount<1){
                  lastObject.element.removeClass('scaler');
                }
                newObject.mobileCount++;
                newObject.element.addClass('scaler');
                scope.$emit('mobileActionResponse',{mobileInfo:mobileActionInfo.mobileInfo,payload:{type:'left',objects:objects,indexes:indexes},cache:newObject});
                arrIndexes.push(indexes);
                printIndexes();
                scope.$emit('publish',{type:'actionEntry',payload:objects[0]});
              }else if(event.type==='right'){
                var newObject=scope.css3dObjects[event.index];
                if(newObject.position.y>lastObject.position.y){
                  keepSelectedtoCenterRow2(event.index,true);
                  transform(TWEEN.Easing.Cubic.InOut);
                }else if(newObject.position.y<lastObject.position.y){
                  keepSelectedtoCenterRow2(event.index,false);
                  transform(TWEEN.Easing.Cubic.InOut);
                }
                var indexes=get3Indexes(event.index,[1,0,0]); 
                var objects=indexes.map(function(index){
                  return scope.artObjects[index];
                });
                if(lastObject.mobileCount>0)
                  lastObject.mobileCount--;
                if(lastObject.mobileCount<1){
                  lastObject.element.removeClass('scaler');
                }
                newObject.mobileCount++;
                newObject.element.addClass('scaler');
                arrIndexes.push(indexes);
                printIndexes();
                scope.$emit('mobileActionResponse',{mobileInfo:mobileActionInfo.mobileInfo,payload:{type:'right',objects:objects,indexes:indexes},cache:newObject});
                scope.$emit('publish',{type:'actionEntry',payload:objects[1]});
              }else if(event.type==='up'){
                var indexes=[getNextIndex(event.index,[0,1,0])]; 
                var objects=indexes.map(function(index){
                  return scope.artObjects[index];
                });
                var newObject=scope.css3dObjects[event.index];
                if(newObject.position.y>lastObject.position.y){
                  keepSelectedtoCenterRow2(event.index,true);
                  transform(TWEEN.Easing.Cubic.InOut);
                }else if(newObject.position.y<lastObject.position.y){
                  keepSelectedtoCenterRow2(event.index,false);
                  transform(TWEEN.Easing.Cubic.InOut);
                }
                if(lastObject.mobileCount>0)
                  lastObject.mobileCount--;
                if(lastObject.mobileCount<1)
                  lastObject.element.removeClass('scaler');
                newObject.mobileCount++;
                newObject.element.addClass('scaler');
                scope.$emit('mobileActionResponse',{mobileInfo:mobileActionInfo.mobileInfo,payload:{type:'up',objects:objects,indexes:indexes,previousIndex:event.index},cache:newObject});
                scope.$emit('publish',{type:'actionEntry',payload:objects[0]});
              }else if(event.type==='down'){
                var indexes=[getNextIndex(event.index,[0,-1,0])]; 
                var objects=indexes.map(function(index){
                  return scope.artObjects[index];
                });
                var newObject=scope.css3dObjects[event.index];
                if(newObject.position.y>lastObject.position.y){
                  keepSelectedtoCenterRow2(event.index,true);
                  transform(TWEEN.Easing.Cubic.InOut);
                }else if(newObject.position.y<lastObject.position.y){
                  keepSelectedtoCenterRow2(event.index,false);
                  transform(TWEEN.Easing.Cubic.InOut);
                }
                if(lastObject.mobileCount>0)
                  lastObject.mobileCount--;
                if(lastObject.mobileCount<1)
                  lastObject.element.removeClass('scaler');
                newObject.mobileCount++;
                newObject.element.addClass('scaler');
                scope.$emit('mobileActionResponse',{mobileInfo:mobileActionInfo.mobileInfo,payload:{type:'down',objects:objects,indexes:indexes,previousIndex:event.index},cache:newObject});
                scope.$emit('publish',{type:'actionEntry',payload:objects[0]});
              }
            }
            return;
            $log.debug('mobileAction',mobileActionInfo);
            var index=mobileActionInfo.cache;
            if(!_.isNumber(index)){
              scope.$emit('mobileIn',mobileActionInfo);
            }else{
              var event=mobileActionInfo.payload;
              if(event.type==='swipe'){
                var newIndex=getNextIndex(index,event.data);
                  keepSelectedtoCenterRow2(index,true);
                  transform(TWEEN.Easing.Cubic.InOut);
                var lastObject=scope.css3dObjects[index];
                var newObject=scope.css3dObjects[newIndex];
                if(lastObject.mobileCount>0)
                  lastObject.mobileCount--;
                if(lastObject.mobileCount<1)
                  lastObject.element.removeClass('scaler');
                newObject.mobileCount++;
                newObject.element.addClass('scaler');
                scope.$emit('mobileActionResponse',{mobileInfo:mobileActionInfo.mobileInfo,payload:scope.artObjects[newIndex],cache:newIndex});
              }else if(event.type==='status'&&event.data==='showMoreInfo'){
                var lastObject=scope.css3dObjects[index];
                lastObject.element.addClass("more-info");
              }else if(event.type==='status'&&event.data==='hideMoreInfo'){
                var lastObject=scope.css3dObjects[index];
                lastObject.element.removeClass("more-info");
              }
              else if(event.type==='status'&&event.data==='showTags'){
                var lastObject=scope.css3dObjects[index];
                lastObject.element.hasClass("tagging")=== true ? lastObject.element.removeClass("tagging"):lastObject.element.addClass("tagging");
              }
              else if(event.type==='status'&&event.data==='giveComment'){
                var lastObject=scope.css3dObjects[index];
                lastObject.element.removeClass('scaler');
                //$timeout.cancel(scope.timerMap[mobileActionInfo.mobileId]);
                //scope.timerMap[mobileActionInfo.mobileId]=$timeout(function(){
                scope.zIndex++;
                newObject.mobileCount++;
                newObject.element.css('z-index',scope.zIndex);
                newObject.element.addClass('scaler');
                //},300);
                scope.$emit('mobileActionResponse',{mobileInfo:mobileActionInfo.mobileInfo,payload:scope.artObjects[newIndex],cache:newIndex});
                scope.$emit('publish',{type:'actionEntry',payload:scope.artObjects[newIndex]});
              }
            }
          });

          scope.$on('mobileOut',function(event,mobileOutInfo){
            logger.debug('mobileOut',mobileOutInfo);
            var outObject=mobileOutInfo.cache;
            if(outObject){
              outObject.mobileCount--;
              if(outObject.mobileCount<1)
                outObject.element.removeClass('scaler');
            }
          });

          scope.click=function(){
            logger.debug('click');
            displayTag();
          }


          scope.next=function(vec){
            logger.debug('next',vec);
          }

          scope.$on('fadeIn',function(event,index){
            element.css('opacity','1');
            cancelAnimationFrame(scope.animateId);
            randomObjectsPosition();
            populateTargets();
            transform(TWEEN.Easing.Cubic.InOut);
            animate();
          });

          scope.$on('fadeOut',function(event,index){
            scope.css3dTargets.forEach(function(t){
              if(t && t.position.y<scope.screenInfo.zoneHeight)
                t.position.y=random()*scope.screenInfo.zoneHeight*10+scope.screenInfo.zoneHeight*2;
            });
            transform(TWEEN.Easing.Bounce.Out);
            element.css('opacity','0');
            $timeout(function(){
              TWEEN.removeAll();
              cancelAnimationFrame(scope.animateId);
              scope.$emit('fadeOutDone',scope.sequenceIndex);
            },5000);
          });

          scope.$on('$destroy',function(){
            TWEEN.removeAll();
            cancelAnimationFrame(scope.animateId);
          });

          function adaptConfigs(){
            var cfg=_.cloneDeep(scope.configs);
            cfg.columnCount=Math.floor(scope.screenInfo.zoneWidth/(scope.configs.columnGap+scope.configs.gridWidth));
            cfg.rowCount=Math.floor(scope.screenInfo.zoneHeight/(scope.configs.rowGap+scope.configs.gridHeight));
            cfg.rowCount=cfg.rowCount<1?1:cfg.rowCount;
            cfg.originalGridWidth=cfg.gridWidth;
            cfg.originalGridHeight=cfg.gridHeight;
            cfg.gridWidth=Math.floor(scope.screenInfo.zoneWidth/cfg.columnCount-scope.configs.columnGap);
            cfg.gridHeight=Math.floor(scope.screenInfo.zoneHeight/cfg.rowCount-scope.configs.rowGap);

            cfg.scale=scope.configs.gridWidth/scope.configs.featuredWidth;
            cfg.scaledWidth=Math.floor(cfg.gridWidth/cfg.scale);
            cfg.scaledHeight=Math.floor(cfg.gridHeight/cfg.scale);

            logger.debug('Adapt configs',cfg);
            return cfg;
          }

          function groupByKey(){
            var dict={};
            var artObjects=scope.artObjects;
            var groupBy=scope.configs.groupBy;
            scope.artObjects.forEach(function(obj,index){
              var val=eval('obj.'+groupBy);
              if(val && obj.cover){
                if(!dict[val])dict[val]=[];
                dict[val].push(index);
              }
            });
            logger.debug('Group data by key',groupBy,dict);
            return dict;
          }

          function groupByGrid(){
            var keyGroups=scope.keyGroups;
            var configs=scope.configs;
            var count=0,dict={};
            for(var key in keyGroups){
              if(keyGroups[key].length>=configs.minimumRowCountInColumn){
                dict[key]=keyGroups[key];
                count+=dict[key].length;
              }
            }
            var rowCount=Math.max(configs.minimumRowCountInColumn,Math.max(configs.rowCount,Math.ceil(count/configs.columnCount)));
            logger.debug(configs);
            logger.debug('max row count',rowCount);
            var columnCount=configs.columnCount;
            var groups=[];
            for(var key in dict){
              groups.push({key:key,length:dict[key].length,columnCount:0});
            }
            groups.sort(function(a,b){return b.length-a.length});
            var finished=false;
            while(!finished){
              finished=true;
              groups.forEach(function(g){
                if(columnCount>0 && g.length>=configs.minimumRowCountInColumn){
                  g.length-=rowCount;
                  g.columnCount++;
                  columnCount--;
                  finished=false;
                }
              });
            }
            var groupColumnCount={};
            groups.forEach(function(g){
              groupColumnCount[g.key]=g.columnCount;
            });
            for(var key in dict){
              if(groupColumnCount[key]>0){
                var cols=[]
                var index=0;
                for(var i=0; i<groupColumnCount[key]; i++){
                  var col=[]
                  var rowCount=Math.ceil(dict[key].length/groupColumnCount[key])
                  for(var j=0; j<rowCount; j++){
                    if(index<dict[key].length){
                      col.push(dict[key][index])
                    }
                    index++;
                  }
                  if(col.length>0)
                    cols.push(col);
                }
                dict[key]=cols;
              }else{
                delete dict[key];
              }
            }
            logger.debug('Group by grid',dict);
            return dict;
          }

          function populateObjects(){
            var artObjects=scope.artObjects;
            var gridGroups=scope.gridGroups;
            var css3dScene=scope.css3dScene;
            var configs=scope.configs;
            var objects=scope.css3dObjects;
            if(!objects){
              objects=[];
              artObjects.forEach(function(obj){
                objects.push(null);
              });
            }
            var columnIndex=0;
            for(var key in gridGroups){
              for(var col in gridGroups[key]){
                gridGroups[key][col].forEach(function(objIndex,rowIndex){
                  // var e=angular.element('<div class="element" style="z-index:1;"></div>');
                  var e=angular.element('<div class="element"></div>');

                  var _height=0;
                  var _width=0;

                  if(artObjects[objIndex].cover.width>=artObjects[objIndex].cover.height){
                    _width=configs.featuredWidth;
                    _height=_width/artObjects[objIndex].cover.width*artObjects[objIndex].cover.height; //Back more info dimension height
                  }else {
                    _height=configs.featuredHeight;
                    _width=_height/artObjects[objIndex].cover.height*artObjects[objIndex].cover.width; //Back more info dimension height

                  }

                  // var c=angular.element('<div class="cover" style="background-color:rgba(255,255,255,0);background-image:url(\''+artObjects[objIndex].cover.url+'?imageView2/2/w/'+configs.originalGridWidth+'/h/'+configs.originalGridHeight+'\');width:'+_width+'px;height:'+_height+'px;"></div>');
                  var front=angular.element('<div class="front" style="transform: translate3d(-50%,-50%,0) rotateY( 0deg ) scale('+configs.scale+');background-color:rgba(255,255,255,0);background-image:url(\''+artObjects[objIndex].cover.url+'?imageView2/2/w/'+configs.scaledWidth+'/h/'+configs.scaledHeight+'\');width:'+_width+'px;height:'+_height+'px;"></div>');

                  var titleSize=32;
                  if(artObjects[objIndex].title.split(" ").length - 1>2){
                    titleSize=23;
                  }
                  var back=angular.element('<div class="back" style="width:'+_width+'px;height:'+_height+'px;"><div class="more"><div class="tr"><div class="cell" style="padding-right= 30px;"><p class="title" style="font-size:'+titleSize+'px;">'+artObjects[objIndex].title+'</p><p class="details">'+'Date: '+artObjects[objIndex].dating.year+'</p><p class="details">'+ 'Medium: '+artObjects[objIndex].physicalMedium+'</p><p class="details">'+'Dimension: '+artObjects[objIndex].subTitle+'</p><p class="description">'+artObjects[objIndex].description+'</p></div><div class="cell" style="padding-left= 30px; verticalAlign=middle;"><div class="img" style="background-color:rgba(255,255,255,0);background-image:url(\''+artObjects[objIndex].cover.url+'?imageView2/2/w/'+configs.originalGridWidth+'/h/'+configs.originalGridHeight+'\');"></div></div></div></div></div>');
                  //tagging

                  var tags=angular.element('<div class="tags"><div style="top:150px;left:300px">I am one</div><div style="top:500px;left:200px">I am tag two three four I am tag two three four</div></div>');

                  front.append(tags);
                  // e.append(c);
                  e.append(front);
                  e.append(back);
                  var object=new CSS3DObject(e);
                  object.mobileCount=0;
                  objects[objIndex]=object;
                  css3dScene.add(object);
                });
                columnIndex++;
              }
            }
            scope.css3dObjects=objects;
          }

          function populateTargets(){
            var artObjects=scope.artObjects;
            var gridGroups=scope.gridGroups;
            var css3dScene=scope.css3dScene;
            var configs=scope.configs;
            var targets=scope.css3dTargets;
            if(!targets){
              targets=[];
              artObjects.forEach(function(obj,index){
                targets.push(null);
              });
            }
            var columnIndex=0;
            for(var key in gridGroups){
              for(var col in gridGroups[key]){
                gridGroups[key][col].forEach(function(objIndex,rowIndex){
                  var target = new THREE.Object3D();
                  target.position.x=(columnIndex+0.5)*(configs.gridWidth+configs.columnGap);
                  if(gridGroups[key][col].length>configs.rowCount){
                    target.position.y=(rowIndex-0.5)*(configs.gridHeight+configs.rowGap);
                  }else{
                    target.position.y=(rowIndex+0.5)*(configs.gridHeight+configs.rowGap);
                  }
                  targets[objIndex]=target;
                });
                columnIndex++;
              }
            }
            scope.css3dTargets=targets;
          };

          function keepSelectedtoCenterRow2(index,upDown){
            var indexes=[];
            var configs=scope.configs;
            var move;
            if(upDown==true){
              move=-(configs.gridHeight+configs.rowGap);
            }else if(upDown==false) {
              move=configs.gridHeight+configs.rowGap;
            }

            scope.css3dTargets.forEach(function(TarObj,i){
              if(!TarObj)return;
              if(TarObj.position.x==scope.css3dTargets[index].position.x)
                {indexes.push(i);}
            });
            var offset=0;
            if(indexes.length>configs.rowCount){
              offset=-0.5;
            }else{
              offset=0.5;
            }
            for (var i=0;i<indexes.length;i++){
              scope.css3dTargets[indexes[i]].position.y+=move;
              if(scope.css3dTargets[indexes[i]].position.y<offset*(configs.gridHeight+configs.rowGap)){
                scope.css3dTargets[indexes[i]].position.y=(indexes.length+offset-1)*(configs.gridHeight+configs.rowGap);
              }else if(scope.css3dTargets[indexes[i]].position.y>(indexes.length+offset-1)*(configs.gridHeight+configs.rowGap)){
                scope.css3dTargets[indexes[i]].position.y=offset*(configs.gridHeight+configs.rowGap);
              }
            }

          }

          //tween update up down moving ****end****

          function randomObjectsPosition(){
            scope.css3dObjects.forEach(function(obj){
              if(!obj)return;
              var x=(random()*2-1)*scope.screenInfo.zoneWidth;
              var y=(random()*2-1)*scope.screenInfo.zoneHeight;
              if(x>scope.screenInfo.zoneWidth/2)x+=scope.screenInfo.zoneWidth;
              if(x<scope.screenInfo.zoneWidth/2)x-=scope.screenInfo.zoneWidth;
              if(y>scope.screenInfo.zoneHeight/2)y+=scope.screenInfo.zoneHeight;
              if(y<scope.screenInfo.zoneHeight/2)y-=scope.screenInfo.zoneHeight;
              obj.position.x=x;
              obj.position.y=y;
            });
          }

          function getCenterIndex(){
            var minDist=Number.MAX_VALUE;
            var minIndex=-1;
            var screenCenter=new THREE.Vector3(scope.screenInfo.width/2+scope.screenInfo.x,scope.screenInfo.height/2+scope.screenInfo.y,0)
            scope.css3dTargets.forEach(function(obj,index){
              if(!obj)return;
              var dir=new THREE.Vector3();
              dir.subVectors(obj.position,screenCenter);
              if(minDist>dir.length()){
                minDist=dir.length();
                minIndex=index;
              }
            });
            return minIndex;
          }

          function get3Indexes(index,vec){
            var indexes=[null,null,null]; 
            indexes[1]=getNextIndex(index,vec);
            indexes[0]=getNextIndex(indexes[1],[0,-1,0]);
            indexes[2]=getNextIndex(indexes[1],[0,1,0]);
            return indexes;
          }

          function get9Indexes(index){
            logger.debug('get9Indexes',index);
            var indexes=[null,null,null,null,null,null,null,null,null]; 
            indexes[0]=index;
            indexes[1]=getNextIndex(index,[-1,0,0]);
            indexes[5]=getNextIndex(index,[1,0,0]);
            indexes[2]=getNextIndex(indexes[1],[0,-1,0]);
            indexes[8]=getNextIndex(indexes[1],[0,1,0]);
            indexes[3]=getNextIndex(indexes[0],[0,-1,0]);
            indexes[7]=getNextIndex(indexes[0],[0,1,0]);
            indexes[4]=getNextIndex(indexes[5],[0,-1,0]);
            indexes[6]=getNextIndex(indexes[5],[0,1,0]);
            return indexes;
          }

          function getNextIndex(index,vec){
            var minDist=Number.MAX_VALUE;
            var dir=new THREE.Vector3(vec[0],vec[1],0);
            dir.setLength(Math.sqrt(scope.configs.gridWidth*scope.configs.gridWidth+scope.configs.gridHeight*scope.configs.gridHeight)/2);
            var center=dir.add(scope.css3dTargets[index].position);
            var newIndex=index;
            scope.css3dTargets.forEach(function(obj,i){
              if(!obj || i=== index)return;
              dir=new THREE.Vector3();
              dir.subVectors(obj.position,center);
              if(dir.length()<minDist){
                minDist=dir.length();
                newIndex=i;
                if(minDist<0.0001)
                  console.log('xxxxxxx index',newIndex);
              }
            });
            return newIndex;
          }

          function displayTag() {
            scope.css3dObjects[currentIndex].element.hasClass("tagging")=== true ?scope.css3dObjects[currentIndex].element.removeClass("tagging"):scope.css3dObjects[currentIndex].element.addClass("tagging");
          }


          function animate(){
            scope.animateId=requestAnimationFrame(animate)
            TWEEN.update();
            render();
          }

          function transform(easing){
            TWEEN.removeAll();
            var objects=scope.css3dObjects;
            var targets=scope.css3dTargets;
            var duration=1000;
            objects.forEach(function(object,index){
              var target=targets[index];
              if(!target)return;
              new TWEEN.Tween( object.position )
              .to( { x:target.position.x, y: target.position.y, z: target.position.z }, random() * duration+duration)
              .easing(easing)
              .start();
            });
            new TWEEN.Tween({})
            .to( {}, duration*2 )
            .onUpdate(render)
            .start();
          }

          function render(){
            scope.renderer.render(scope.css3dScene,scope.screenInfo);
          }

        }
      };
    }]);
}());
