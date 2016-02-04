(function(){
  'use strict';
  angular.module('mksense.visuals')
  .directive('mksenseParticle', [
    '$log','$interval','$timeout','THREE','$window','Stats','mkConfig','_',
    function($log,$interval,$timeout,THREE,$window,Stats,mkConfig,_){
      return {
        transclude:true,
        restrict:'EA',
        templateUrl:'/visuals/particle/particle.html',
        link:function(scope,element){
          var logger=$log.getInstance('MKSENSE-PARTICLE');
          var random= new Math.seedrandom('mksenseParticle');
          element.css('opacity','0');
          element.css('transition','opacity 3s ease-in-out');
          var artObjects=scope.artObjects; 
          var screenInfo=scope.screenInfo;
          var screenInfos=scope.screenInfos;
          var configs=adaptConfigs(scope.configs);
          logger.debug(configs);
          var keyGroups=groupByKey();
          var radius=screenInfo.zoneHeight/2+100;
          var scene = new THREE.Scene();
          var camera = new THREE.OrthographicCamera( screenInfo.x, screenInfo.x+screenInfo.width, screenInfo.height / 2, - screenInfo.height / 2, 1, 3000);
          camera.position.z=radius*3;
          var renderer = new THREE.WebGLRenderer();
          renderer.setClearColor('#d9d9d9');
          //renderer.setClearColor('#000000');
          renderer.setPixelRatio($window.devicePixelRatio);
          renderer.setSize(screenInfo.width,screenInfo.height);
          element.append(renderer.domElement);
          var stats = new Stats();
          stats.domElement.style.position = 'absolute';
          stats.domElement.style.top = '0px';
          stats.domElement.style.opacity = '0';
          element.append(stats.domElement);
          var loader = new THREE.TextureLoader();
          loader.crossOrigin=true;
          var objects,targets,animateId,materials,colDeltas,columns,columnsMobiles;
          populateObjects();
          scope.comments={};
          scope.moreinfos={};

          scope.$emit("compileDone");

          addLabels();
          function addLabels(){
            var container=angular.element('<div class="labels" style="width:'+scope.screenInfo.zoneWidth+'px;height:4%;z-index:1000;position:absolute;bottom:'+Math.floor(scope.configs.gridHeight/10)+'px;left:'+-scope.screenInfo.x+'px"></div>'); 
            scope.labels.forEach(function(label){
              var left=label.columnIndex*(scope.configs.columnGap+scope.configs.gridWidth)+Math.floor(scope.configs.columnGap/2+scope.configs.gridWidth/2);
              container.append('<div style="left:'+left+'px;position:absolute;padding:2px 5px;background:yellow;transform:translate(-50%,0);">'+label.key+'</div>');  
            })
            element.append(container);
          }
          scope.$on('mobileOut',function(event,mobileOutInfo){
            var columnIndex=mobileOutInfo.cache;
            columnsMobiles[columnIndex]--;
            if(columnsMobiles[columnIndex]<1){
              var index=getActiveIndexInColumn(columnIndex);
              $timeout(function(){
                delete scope.moreinfos[artObjects[index].id];
                delete scope.comments[artObjects[index].id];
                scope.$apply();
              });
            }
          });

          scope.$on('mobileIn',function(event,mobileInfo){
            scope.$emit('delay',15000);
            var columnIndex=getMobileInColumnIndex(mobileInfo.screenIndex);
            console.log('columnIndex',columnIndex);
            columnsMobiles[columnIndex]++;
            var indexes=get9Indexes(columnIndex);
            var objs=indexes.map(function(index){
              return scope.artObjects[index]; 
            });
            activeObject(columnIndex,indexes[0]);
            scope.$emit('mobileInResponse',{mobileInfo:mobileInfo,payload:{objects:objs,indexes:indexes},cache:columnIndex});
            scope.$emit('publish',{type:'actionEntry',payload:objs[0]});
          });
          scope.$on('mobileAction',function(event,mobileActionInfo){
            var event=mobileActionInfo.payload;
            var columnIndex=mobileActionInfo.cache;
            console.log('columnIndex',columnIndex);
            if(columnIndex !== 0 && !columnIndex){
              scope.$emit('mobileIn',mobileActionInfo.mobileInfo);
            }else{
              logger.debug(event);
              if(event.type==='status'){
                if(event.data==='showComments'){
                  var index=getActiveIndexInColumn(columnIndex);
                  var comment={};
                  var height=0,width=0;
                  var imgWidth=artObjects[index].cover.width;
                  var imgHeight=artObjects[index].cover.height;
                  var gridRatio=configs.gridWidth/configs.gridHeight;
                  var imgRatio=imgWidth/imgHeight;
                  if(imgRatio>=gridRatio){
                    width=configs.gridWidth;
                    height=Math.floor(width/artObjects[index].cover.width*artObjects[index].cover.height);
                  }else{
                    height=configs.gridHeight;
                    width=Math.floor(height/artObjects[index].cover.height*artObjects[index].cover.width);
                  }
                  comment.x=targets[index].position.x-width/2-screenInfo.x;
                  comment.y=scope.screenInfo.zoneHeight/2-height/2;
                  comment.width=width;
                  comment.height=height;
                  comment.artObject=artObjects[index];
                  $timeout(function(){
                    comment.comments=artObjects[index].comments.map(function(c){
                      return {top:Math.floor(c.position[0]*100)+'%',left:Math.floor(c.position[1]*100)+'%',text:c.text}; 
                    });
                    scope.comments[artObjects[index].id]=comment;
                    logger.debug(scope.comments);
                    scope.$apply();
                  });
                }
                if(event.data==='hideComments'){
                  $timeout(function(){
                    var index=getActiveIndexInColumn(columnIndex);
                    delete scope.comments[artObjects[index].id];
                  });
                }
                if(event.data==='hideMoreinfo'){
                  var index=getActiveIndexInColumn(columnIndex);
                  $timeout(function(){
                    delete scope.moreinfos[artObjects[index].id];
                    scope.$apply();
                  });
                }
                if(event.data==='showMoreinfo'){
                  var index=getActiveIndexInColumn(columnIndex);
                  var moreinfo={};
                  var height=0,width=0;
                  var imgWidth=artObjects[index].cover.width;
                  var imgHeight=artObjects[index].cover.height;
                  var gridRatio=configs.gridWidth/configs.gridHeight;
                  var imgRatio=imgWidth/imgHeight;
                  if(imgRatio>=gridRatio){
                    width=configs.gridWidth;
                    height=Math.floor(width/artObjects[index].cover.width*artObjects[index].cover.height);
                  }else{
                    height=configs.gridHeight;
                    width=Math.floor(height/artObjects[index].cover.height*artObjects[index].cover.width);
                  }
                  moreinfo.x=Math.floor(targets[index].position.x+width/2+10)-screenInfo.x;
                  moreinfo.y=Math.floor(Math.floor(screenInfo.zoneHeight/2)-height/2);
                  moreinfo.width=scope.configs.columnGap-10*3;
                  if(moreinfo.width<300)
                    moreinfo.width=300;
                  moreinfo.height=height;
                  moreinfo.artObject=artObjects[index];
                  $timeout(function(){
                    scope.moreinfos[artObjects[index].id]=moreinfo;
                    scope.$apply();
                  })
                }
              }
              if(event.type==='left'){
                columnsMobiles[columnIndex]--;
                transformColumn(columnIndex);
                columnIndex--;
                if(columnIndex<0)columnIndex=columns.length-1;
                columnsMobiles[columnIndex]++;
                activeObject(columnIndex,event.index);
                var nextColumn=columnIndex-1;
                if(nextColumn<0)nextColumn=columns.length-1;
                var indexes=get3Indexes(nextColumn);
                var objs=indexes.map(function(index){
                  return scope.artObjects[index]; 
                });
                scope.$emit('mobileActionResponse',{mobileInfo:mobileActionInfo.mobileInfo,payload:{type:'left',objects:objs,indexes:indexes},cache:columnIndex});
                scope.$emit('publish',{type:'actionEntry',payload:scope.artObjects[event.index]});
              }else if(event.type==='right'){
                columnsMobiles[columnIndex]--;
                transformColumn(columnIndex);
                columnIndex++;
                if(columnIndex>=columns.length)columnIndex=0;
                columnsMobiles[columnIndex]++;
                activeObject(columnIndex,event.index);
                var nextColumn=columnIndex+1;
                if(nextColumn>=columns.length)nextColumn=0;
                var indexes=get3Indexes(nextColumn);
                var objs=indexes.map(function(index){
                  return scope.artObjects[index]; 
                });
                scope.$emit('mobileActionResponse',{mobileInfo:mobileActionInfo.mobileInfo,payload:{type:'right',objects:objs,indexes:indexes},cache:columnIndex});
                scope.$emit('publish',{type:'actionEntry',payload:scope.artObjects[event.index]});
              }else if(event.type==='up'){
                activeObject(columnIndex,event.index);
                var indexes=get3Indexes(columnIndex);
                scope.$emit('mobileActionResponse',{mobileInfo:mobileActionInfo.mobileInfo,payload:{type:'up',objects:[scope.artObjects[indexes[0]]],indexes:[indexes[0]],previousIndex:event.index},cache:columnIndex});
                scope.$emit('publish',{type:'actionEntry',payload:scope.artObjects[event.index]});
              }else if(event.type==='down'){
                activeObject(columnIndex,event.index);
                var indexes=get3Indexes(columnIndex);
                scope.$emit('mobileActionResponse',{mobileInfo:mobileActionInfo.mobileInfo,payload:{type:'down',objects:[scope.artObjects[indexes[2]]],indexes:[indexes[2]],previousIndex:event.index},cache:columnIndex});
                scope.$emit('publish',{type:'actionEntry',payload:scope.artObjects[event.index]});
              }
            }
          });

          function get9Indexes(columnIndex){
            var indexes=[null,null,null,null,null,null,null,null,null];
            var a=get3Indexes(columnIndex);
            indexes[3]=a[0];
            indexes[0]=a[1];
            indexes[7]=a[2];
            var indexB=columnIndex-1;
            if(indexB<0)indexB=columns.length-1;
            var b=get3Indexes(indexB);
            indexes[2]=b[0];
            indexes[1]=b[1];
            indexes[8]=b[2];
            var indexC=columnIndex+1;
            if(indexC>=columns.length)indexC=0;
            var c=get3Indexes(indexC);
            indexes[4]=c[0];
            indexes[5]=c[1];
            indexes[6]=c[2];
            return indexes;
          }

          function get3Indexes(columnIndex){
            var indexes=_.clone(columns[columnIndex]);
            indexes.sort(function(a,b){
              return Math.abs(targets[a].position.y)-Math.abs(targets[b].position.y);
            });
            if(indexes.length<1){
              return [null,null,null];
            }else if(indexes.length<2){
              return [indexes[0],indexes[0],indexes[0]];
            }else if(indexes.length<3){
              return [indexes[1],indexes[0],indexes[1]];
            }else{
              return [indexes[1],indexes[0],indexes[indexes.length-1]];
            }
          }

          function getMobileInColumnIndex(screenIndex){
            var s=screenInfos[screenIndex];
            var indexes=[];
            if(targets){
              targets.forEach(function(target,index){
                if(target &&Math.abs(target.position.y)<0.001 && target.position.x<=s.x+screenInfo.width && target.position.x>=s.x) 
                  indexes.push(index);
              });
              var index=indexes[Math.floor(random()*indexes.length)];
              if(targets[index]){
                return targets[index].columnIndex;
              }else{
                return null;
              }
            }else{
              return null;
            }
          }

          function activeObject(columnIndex,index){
            var delta=0-targets[index].position.y;
            columns[columnIndex].forEach(function(objIndex){
              var target=targets[objIndex]; 
              target.position.y+=delta; 
              if(target.position.y>Math.PI*2)
                target.position.y-=Math.PI*2;
              if(target.position.y<0)
                target.position.y+=Math.PI*2;
            });
            transformColumn(columnIndex);
          }

          function showMoreInfo(columnIndex){
            logger.debug('showMoreInfo',columnIndex);
            var index=getActiveIndexInColumn(columnIndex);
            var object=objects[index];
            new TWEEN.Tween( object.rotation)
            .to( { x:0, y:Math.PI, z:0 },500)
            .easing(TWEEN.Easing.Cubic.In)
            .start();
          }

          function hideMoreInfo(columnIndex){
            logger.debug('hideMoreInfo',columnIndex);
            var index=getActiveIndexInColumn(columnIndex);
            var object=objects[index];
            new TWEEN.Tween( object.rotation)
            .to( { x:0, y:0, z:0 },500)
            .easing(TWEEN.Easing.Cubic.In)
            .start();
          }

          

          function getNextColumnAndIndex(columnIndex,vector){
            if(Math.abs(vector[0])>Math.abs(vector[1])){
              columnIndex=getNextColumn(columnIndex,vector);  
              return {index:getActiveIndexInColumn(columnIndex),columnIndex:columnIndex};
            }else{
              rotateColumn(columnIndex,vector[1]);
              transformColumn(columnIndex);
              return {index:getActiveIndexInColumn(columnIndex),columnIndex:columnIndex};
            } 
          }

          function rotateColumn(columnIndex,dir){
            dir=dir>0?1:-1; 
            columns[columnIndex].forEach(function(objIndex){
              var target=targets[objIndex]; 
              target.position.y+=dir*colDeltas[columnIndex]; 
              target.columnIndex=columnIndex;
              if(target.position.y>Math.PI*2)
                target.position.y-=Math.PI*2;
              if(target.position.y<0)
                target.position.y+=Math.PI*2;
            });
          }

          function getNextColumn(columnIndex,dir){
            if(dir[0]>0){
              if(columnIndex<columns.length)
                return columnIndex+1;
              else 
                return columnIndex;
            }else{
              if(columnIndex>0)
                return columnIndex-1;
              else 
                return columnIndex;
            }
          }

          function getActiveIndexInColumn(columnIndex){
            var index=undefined;
            var angle=Number.MAX_VALUE;
            columns[columnIndex].forEach(function(objIndex){
              var target=targets[objIndex];
              if(Math.abs(target.position.y)<angle){
                angle=Math.abs(target.position.y); 
                index=objIndex;
              } 
            });
            return index;
          }

          function getMobileInColumn(screenIndex){
            var s=screenInfos[screenIndex];
            var indexes=[];
            if(targets){
              targets.forEach(function(target,index){
                if(target &&Math.abs(target.position.y)<0.001 && target.position.x<=s.x+screenInfo.width && target.position.x>=s.x) 
                  indexes.push(index);
              });
              var index=indexes[Math.floor(random()*indexes.length)];
              if(targets[index]){
                return targets[index].columnIndex;
              }else{
                return 0;
              }
            }else{
              return 0;
            }
          }

          scope.$emit("compileDone");

          scope.$on('fadeIn',function(event){
            scope.status="PLAY";
            element.css('opacity','1');
            cancelAnimationFrame(animateId);
            populateTargets();
            animate();
            transform(TWEEN.Easing.Cubic.InOut,2000);
            logger.debug('Catch fadeIn event');
          });

          scope.$on('fadeOut',function(event){
            element.css('opacity','0');
            $timeout(function(){
              cancelAnimationFrame(animateId);
              TWEEN.removeAll();
              scope.$emit('fadeOutDone');
            },3000);
          });
          scope.$on('$destroy',function(){
          });

          function groupByKey(){
            var key=0;
            var counter=0;

            //var dict={};
            //artObjects.forEach(function(obj,index){
              //if(obj.cover){
                //if(!dict[key])dict[key]=[];
                //dict[key].push(index);
              //}
              //counter++;
              //if(counter%20===0)
                //key++
            //});
            //return dict;

            var dict={};
            var groupBy=configs.groupBy;
            artObjects.forEach(function(obj,index){
              var val=eval('obj.'+groupBy);
              if(val && obj.cover && obj.cover.width<obj.cover.height){
                if(!dict[val])dict[val]=[];
                dict[val].push(index);
              }
            });

            var d={};
            var div=20;
            for(var key in dict){
              if(dict[key].length<div){
                d[key]=dict[key]; 
              }else{
                var count=Math.floor(dict[key].length/div)+1
                console.log(count);
                for(var i=0; i<count; i++){
                  d[key+'-'+(i+1)]=[];
                  for(var j=i*div; j<(i+1)*div && j<dict[key].length; j++){
                    d[key+'-'+(i+1)].push(dict[key][j]);
                  } 
                }
              }
            }
            dict=d;
            logger.debug('Group data by key',groupBy,dict);
            var labels=[];
            for(var key in dict){
              if(dict[key].length<configs.minimumRowCountInColumn)continue;
              labels.push({key:key,columnIndex:labels.length}); 
            }
            scope.labels=labels;
            return dict;
          }


          function adaptConfigs(configs){
            var cfg=_.cloneDeep(configs);
            cfg.columnCount=Math.floor(screenInfo.zoneWidth/(configs.columnGap+configs.gridWidth));
            cfg.columnCount=cfg.columnCount<1?1:cfg.columnCount;
            cfg.gridWidth=Math.floor(screenInfo.zoneWidth/cfg.columnCount-configs.columnGap);
            logger.debug('Adapt configs',cfg);
            return cfg;
          }


          function populateObjects(){
            if(!objects)
              objects=artObjects.map(function(){return null});
            if(!materials)
              materials=artObjects.map(function(){return null});
            for(var key in keyGroups){
              if(keyGroups[key].length<configs.minimumRowCountInColumn)continue;
              keyGroups[key].forEach(function(objIndex,rowIndex){
                var height=0,width=0;
                var imgWidth=artObjects[objIndex].cover.width;
                var imgHeight=artObjects[objIndex].cover.height;
                var gridRatio=configs.gridWidth/configs.gridHeight;
                var imgRatio=imgWidth/imgHeight;
                if(imgRatio>=gridRatio){
                  width=configs.gridWidth;
                  height=Math.floor(width/artObjects[objIndex].cover.width*artObjects[objIndex].cover.height);
                }else{
                  height=configs.gridHeight;
                  width=Math.floor(height/artObjects[objIndex].cover.height*artObjects[objIndex].cover.width);
                }
                var geometry = new THREE.BoxGeometry( width, height, 1 );
                var material = new THREE.MeshBasicMaterial({transparent:true}); 
                var sprite = new THREE.Mesh( geometry, material );
                sprite.position.x = (Math.random() *2-1)*screenInfo.zoneWidth;
                sprite.position.y = (Math.random() *2-1)*screenInfo.zoneHeight;
                sprite.position.z = (Math.random()*2-1)*screenInfo.zoneHeight;
                sprite.scale.set(0.1,0.1,0.1);
                sprite.width=width;
                sprite.height=height;
                objects[objIndex]=sprite;
                materials[objIndex]=material;
                scene.add( sprite );
                loader.load(artObjects[objIndex].cover.url+'?imageView2/2/w/'+configs.gridWidth*2+'/h/'+configs.gridHeight*2,function ( frontTexture ) {
                  frontTexture.minFilter=THREE.LinearFilter;
                  material.map=frontTexture;
                });
              }); 
            }
          }

          function transformColumn(columnIndex,duration){
            var globalScale=columnsMobiles[columnIndex]>0?1:0.7;
            columns[columnIndex].forEach(function(objIndex){
              var target=targets[objIndex]; 
              var object=objects[objIndex];
              var material=materials[objIndex];
              if(!target || !object || !material)return;
              var dt=duration?duration:500;
              var targetX=target.position.x;
              var targetY=Math.sin(target.position.y)*radius;
              var targetZ=Math.cos(target.position.y)*radius;
              var angle=target.position.y
              if(Math.abs(angle)<0.001){
                object.position.z=radius*2; 
                targetZ=object.position.z;
              }else if(object.position.z>radius){
                object.position.z=radius; 
              }
              new TWEEN.Tween( object.position )
              .to( { x:targetX, y:targetY, z:targetZ },dt)
              .easing(TWEEN.Easing.Cubic.In)
              .start();
              var scale=Math.abs(target.position.y-Math.PI)/Math.PI;
              if(Math.abs(angle)<0.001){
                scale=Math.pow(scale,6)*globalScale*1;
              }else{
                scale=Math.pow(scale,6)*globalScale
              }
              if(scale<0.1)scale=0.1;
              new TWEEN.Tween( object.scale )
              .to({x:scale,y:scale,z:1},dt)
              //.to({x:Math.pow(scale,4),y:Math.pow(scale,4),z:1},dt)
              .onUpdate(function(){
                var value=(object.position.z+radius)/2/radius;
                var opacity=Math.pow(value,100);
                if(opacity<0.3)
                  opacity=0.3;
                //material.opacity=opacity;
                material.opacity=opacity*globalScale;
              })
              .easing(TWEEN.Easing.Cubic.In)
              .start();
              new TWEEN.Tween( object.rotation)
              .to( { x:0, y:0, z:0 },dt)
              .easing(TWEEN.Easing.Cubic.In)
              .start();
            });
          }

          function transform(easing,duration){
            TWEEN.removeAll();
            columns.forEach(function(c,columnIndex){
              transformColumn(columnIndex);
            });
          }

          function animate(){
            TWEEN.update();
            stats.update();
            renderer.render( scene, camera );
            animateId=requestAnimationFrame(animate);
          }

          function populateTargets(){
            if(!targets)
              targets=artObjects.map(function(){return null});
            colDeltas=[];
            columns=[];
            columnsMobiles=[];
            var columnIndex=0;
            for(var key in keyGroups){
              if(keyGroups[key].length<configs.minimumRowCountInColumn)continue;
              var indexes=[];
              var delta=Math.PI*2/keyGroups[key].length;
              colDeltas.push(delta);
              keyGroups[key].forEach(function(objIndex,rowIndex){
                var target = new THREE.Object3D();
                indexes.push(objIndex);
                target.position.x=(columnIndex+0.5)*(configs.gridWidth+configs.columnGap);
                target.position.y=rowIndex*delta;
                targets[objIndex]=target;
                target.columnIndex=columnIndex;
              });
              columns.push(indexes);
              columnsMobiles.push(0);
              columnIndex++;
            }
          }
          //end populateTargets

          function getDomUrl(content,id,callback){
            var dom=angular.element('<div id="'+id+'"></div>');
            dom.append(angular.element(content));
            element.append(dom);
            domtoimage.toPng(document.getElementById(id))
            .then(function (dataUrl) {
              var img = new Image();
              img.src = dataUrl;
              element.append(img);
            })
            .catch(function (error) {
              logger.error('oops, something went wrong!', error);
            });
            return ;
            //html2canvas(document.getElementById(id),{
              //onrendered: function(canvas) {
                //element.append(canvas);
                //if(callback)callback(canvas);
              //}
            //});
            //return 
            logger.debug('get dom url');
            var data = '<svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="'+height+'">' +
            '<foreignObject width="100%" height="100%">' +
              '<div xmlns="http://www.w3.org/1999/xhtml">' +
                //'<h1>hello<h1>'+
            content+
              '</div>' +
              '</foreignObject>' +
              '</svg>';
            var DOMURL = window.URL || window.webkitURL || window;
            var svg = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
            var url = DOMURL.createObjectURL(svg);
            var img=new Image();
            img.onload=function(){
              if(callback)
                callback(img); 
              element.append(img);
              DOMURL.revokeObjectURL(url); 
            }
            img.onerror=function(err){
              logger.debug('image load error',err); 
            }
            img.src=url;
            return url;
          }
        }
      };
    }]);
}());
