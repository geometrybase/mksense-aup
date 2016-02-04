(function(){
  'use strict';
  angular.module('mksense.screen')
  .directive('screen', [
    '$window','$log','$stateParams','ScreenService','$compile','mkConfig','$interval','$timeout','EventEmitter','ScreenPC','MobileService',
    function($window,$log,$stateParams,ScreenService,$compile,mkConfig,$interval,$timeout,EventEmitter,ScreenPC,MobileService){
      return {
        transclude:false,
        restrict:'EA',
        templateUrl:'/screen/screen.html',
        link:function(scope,element){


          var SCREEN={};
          var logger=$log.getInstance('SCREEN-DIRECTIVE');
          logger.debug('start SCREEN directive');

          element.css('display','block');

          SCREEN.exhibitionId=$stateParams.exhibitionId;
          SCREEN.sceneId=$stateParams.sceneId;
          SCREEN.screenIndex=parseInt($stateParams.screenIndex);
          SCREEN.isMaster=SCREEN.screenIndex===0;
          SCREEN.fadeOutStatus={};
          SCREEN.visualIndex=0;
          SCREEN.visualStatus="Pending";
          SCREEN.status={
            scene:false,
            addressId:false,
            socket:false, 
            compile:false,
            peer:false,
            screenInfo:false
          };
          SCREEN.visualScopes=[];
          SCREEN.visualElements=[];
          sceneReady(scope.scene);
          addressIdReady(scope.addressId);
          socketReady(scope.socketRooms.screen);
          scope.$on('scene',function(event,scene){
            sceneReady(scene);
          });
          scope.$on('addressId',function(event,addressId){
            addressIdReady(addressId);
          });
          scope.$on('joinScreen',function(event,screenRoom){
            socketReady(screenRoom);
          });
          scope.$on('delay',function(event,time){
            time=time?time:10000;
            delay(time);
          });

          function sceneReady(scene){
            if(!SCREEN.scene && scene){
              logger.info('scene is ready.')
              SCREEN.scene=scene; 
              setScreenInfos(scene);
              compile(scene);
              updateStatus('scene',true);
              if(SCREEN.addressId)createPeerConnection();
            }
          }

          function addressIdReady(addressId){
            if(!SCREEN.addressId && addressId){
              logger.info('addressId is ready.')
              SCREEN.addressId=addressId; 
              scope.mobileUrl=mkConfig.mobileUrl+SCREEN.addressId+'/'+SCREEN.exhibitionId+'/'+SCREEN.sceneId+'/'+SCREEN.screenIndex;
              logger.info('mobileUrl',scope.mobileUrl,'background:green;');
              updateStatus('addressId',true);
              if(SCREEN.scene)createPeerConnection();
            }
          }

          function socketReady(screenRoom){
            if(screenRoom && !SCREEN.status.socket){
              updateStatus('socket',true);
            }
          }

          function updateStatus(key,value){
            if(SCREEN.status[key]===value)return;
            SCREEN.status[key]=value; 
            logger.debug('status update',SCREEN.status);
            var allTrue=true;
            for(var key in SCREEN.status){
              if(!SCREEN.status[key])allTrue=false; 
            }
            if(allTrue)screenReady();;
          }

          function screenReady(){
            SCREEN.isReady=true;
            logger.debug('Screen is ready!!!!!!!'); 
            SCREEN.mobileService=new MobileService(scope,scope.socket,SCREEN);
            if(SCREEN.isMaster){
              logger.debug('Publish ready event to slaves');
              SCREEN.peerConnection.publishToScreens({type:'status',payload:'ready'});
              SCREEN.visualIndex=0;
              SCREEN.fadeInTime=Date.now();
              SCREEN.visualStatus='fadeIn';
              fadeIn(SCREEN.visualIndex);
              setFadeOutTimeout();
            }else{
              if(SCREEN.masterReady)
                SCREEN.peerConnection.sendToMaster({type:'status',payload:'ready'}); 
            }
          }


          function setScreenInfos(scene){
            if(SCREEN.screenInfo || !scene)return;
            SCREEN.screenInfo={};
            SCREEN.screenInfo.zoneWidth=0;
            SCREEN.screenInfo.zoneHeight=0;
            SCREEN.screenInfo.x=0;
            SCREEN.screenInfo.y=0;
            SCREEN.screenInfo.screenIndex=SCREEN.screenIndex;
            scene.screens.forEach(function(s,index){
              if(s.height>SCREEN.screenInfo.zoneHeight){
                SCREEN.screenInfo.zoneHeight=s.height; 
              }
              if(index === SCREEN.screenIndex){
                SCREEN.screenInfo.x=SCREEN.screenInfo.zoneWidth;
                SCREEN.screenInfo.zoneWidth+=s.width;
                SCREEN.screenInfo.width=s.width;
                SCREEN.screenInfo.height=s.height;
              }else{
                SCREEN.screenInfo.zoneWidth+=s.width;
              } 
            });
            SCREEN.screenInfos=[];
            var x=0;
            scene.screens.forEach(function(s,index){
              var screenInfo=_.cloneDeep(SCREEN.screenInfo);
              screenInfo.x=x;
              screenInfo.width=s.width;
              screenInfo.height=s.height;
              screenInfo.screenIndex=index;
              SCREEN.screenInfos.push(screenInfo);
              x+=s.width;
            });
            updateStatus('screenInfo',true);
          }

          function createPeerConnection(){

            if(SCREEN.peerConnection)return;
            var pc=new ScreenPC(SCREEN.addressId,SCREEN.exhibitionId,SCREEN.sceneId,SCREEN.screenIndex,SCREEN.scene);
            SCREEN.peerConnection=pc;

            pc.on('ready',function(){
              updateStatus('peer',true);
            });

            pc.on('error',function(error){
              logger.debug('screen peer connection error',error); 
            });

            pc.on('connClose',function(conn){
              delete SCREEN.fadeOutStatus[conn.peer];
            });

            pc.on('connOpen',function(conn){
              if(SCREEN.isMaster && SCREEN.isReady  && SCREEN.visualStatus !== 'fadeOut'){
                logger.debug('Send ready event to slave',conn.peer);
                SCREEN.peerConnection.sendToScreen(conn.peer,{type:'status',payload:'ready'});
              }
            });

            pc.on('connError',function(conn,error){
            });

            pc.on('pubsubData',function(conn,data){
              scope.$broadcast('pubusb',data);  
            });

            scope.$on('publish',function(event,data){
              if(SCREEN.isMaster)
                SCREEN.peerConnection.publishToScenes(data);
            });
            scope.$on('sync',function(event,data){
              if(SCREEN.isMaster)
                SCREEN.peerConnection.publishToScreens(data);
            });

            pc.on('screenData',function(conn,data){
              //data={type:dataType,name:dataName,payload:dataPayload}
              switch(data.type){
                case 'action':
                  switch(data.name){
                    case 'fadeIn':
                      console.log('fade in in ');
                      fadeIn(data.payload);
                      break;
                    case 'fadeOut':
                      fadeOut();
                      break;
                  } 
                  break;
                case 'status':
                  switch(data.payload){
                    case 'ready': 
                      if(SCREEN.isMaster){
                        logger.debug('Get ready event from slave screen',conn.peer,'reply with fadeIn event');
                        SCREEN.peerConnection.sendToScreen(conn.peer,{type:'action',name:'fadeIn',payload:SCREEN.visualIndex}); 
                      }else{
                        SCREEN.masterReady=true; 
                        logger.debug('Get ready event from master screen',conn.peer);
                        if(SCREEN.isReady)
                          SCREEN.peerConnection.sendToMaster({type:'status',payload:'ready'}); 
                      }
                      break;
                    case 'fadeOutDone':
                      logger.debug('fadeOutDone event from slave',conn.peer);
                      SCREEN.fadeOutStatus[conn.peer]=true; 
                      var allDone=true;
                      for(var key in SCREEN.fadeOutStatus)
                        if(!SCREEN.fadeOutStatus[key]) allDone=false;
                      if(allDone){
                        SCREEN.fadeOutStatus={};
                        nextVisual();
                      }
                      break;
                  }
                  break;
                case 'data':
                  scope.$broadcast(data.name,data.payload);
                  break;
              }
            });
            

            pc.on('pubsubData',function(conn,data){
              logger.debug(data);
              scope.$broadcast('pubsub',data); 
            });

          }

          function compile(){
            if(!SCREEN.screenInfo || !SCREEN.scene || SCREEN.visualElements.length>0)return;
            logger.debug('Starting compile all visuals');
            element.css('width',SCREEN.screenInfo.width+'px');
            element.css('height',SCREEN.screenInfo.height+'px');
            //element.css('border','black solid 1px');
            for(var i=0; i<SCREEN.scene.visuals.length;i++){
              var visualData=SCREEN.scene.visuals[i];
              var visualScope=scope.$new(true); 
              visualScope.artObjects=visualData.artObjects;
              visualScope.screenInfo=SCREEN.screenInfo;
              visualScope.screenInfos=SCREEN.screenInfos;
              visualScope.configs=visualData.configs;
              visualScope.type=visualData.type;
              visualScope.sequenceIndex=i;
              visualScope.isMaster=SCREEN.isMaster;
              var visualElement=$compile('<mksense-'+visualData.type+'></mksense-'+visualData.type+'>')(visualScope);
              element.append(visualElement);
              SCREEN.visualScopes.push(visualScope);
              SCREEN.visualElements.push(visualElement);
            }
            updateStatus('compile',true)
          }

          function fadeIn(visualIndex){
            SCREEN.visualIndex=visualIndex;
            var currentScope=SCREEN.visualScopes[SCREEN.visualIndex];
            var currentElement=SCREEN.visualElements[SCREEN.visualIndex];
            var currentVisual=SCREEN.scene.visuals[SCREEN.visualIndex];
            logger.debug('FADEIN STATUS ',currentScope.status);
            logger.debug(currentScope,visualIndex);
            if(currentScope.status==='PLAY')
              return
            currentScope.status='PLAY';
            logger.debug('fadeIn,set display block');
            currentElement.css('display','block');
            currentScope.$broadcast('fadeIn');
          }

          function fadeOut(){
            var currentScope=SCREEN.visualScopes[SCREEN.visualIndex];
            var currentElement=SCREEN.visualElements[SCREEN.visualIndex];
            var currentVisual=SCREEN.scene.visuals[SCREEN.visualIndex];

            if(currentScope.status==="FADEOUT")
              return;

            currentScope.status="FADEOUT";
            if(currentScope.fadeOutDone)
              currentScope.fadeOutDone();

            currentScope.fadeOutDone=currentScope.$on('fadeOutDone',function(event){
              logger.debug('mksenes-'+currentVisual.type+' fadeOut done.'); 
              logger.debug('set display to none');
              currentElement.css('display','none');
              if(SCREEN.isMaster){
                SCREEN.fadeOutStatus[SCREEN.peerConnection.peerId]=true; 
                var allDone=true;
                for(var key in SCREEN.fadeOutStatus)
                  if(!SCREEN.fadeOutStatus[key]) allDone=false;
                if(allDone){
                  //SCREEN.fadeOutStatus={}; 
                  currentScope.fadeOutDone();
                  nextVisual();
                }
              }else{
                SCREEN.peerConnection.sendToMaster({type:'status',payload:'fadeOutDone'}); 
              }
            });

            SCREEN.visualScopes[SCREEN.visualIndex].$broadcast('fadeOut');

          }

          function setFadeOutTimeout(){
            var time=SCREEN.scene.timeline[SCREEN.visualIndex];
            logger.debug('fade out after',time,'ms');
            $timeout.cancel(SCREEN.timer);
            SCREEN.timer=$timeout(function(){
              SCREEN.visualStatus="fadeOut";
              SCREEN.fadeOutStatus=SCREEN.peerConnection.getConnectionDict(false,'SCREEN');
              SCREEN.fadeOutStatus[SCREEN.peerConnection.peerId]=false;
              fadeOut();
              SCREEN.peerConnection.publishToScreens({type:'action',name:'fadeOut'}); 
            },time);
          }

          function delay(time){
            logger.debug('delay',time);
            var delta=SCREEN.fadeInTime+SCREEN.scene.timeline[SCREEN.visualIndex]-Date.now();
            if(time<delta){
              logger.debug(delta+'ms left,','more than you want');
              return; 
            }else{
              $timeout.cancel(SCREEN.timer);
              SCREEN.timer=$timeout(function(){
                SCREEN.visualStatus="fadeOut";
                SCREEN.fadeOutStatus=SCREEN.peerConnection.getConnectionDict(false,'SCREEN');
                SCREEN.fadeOutStatus[SCREEN.peerConnection.peerId]=false;
                fadeOut();
                SCREEN.peerConnection.publishToScreens({type:'action',name:'fadeOut'}); 
              },time);
            }
          }

          //scope.$on('fadeOutDone',function(){
            //logger.debug('mksenes-'+SCREEN.scene.visuals[SCREEN.visualIndex].type+' fadeOut done.'); 
            //SCREEN.visualElements[SCREEN.visualIndex].css('display','none');
            //if(SCREEN.isMaster){
              //SCREEN.fadeOutStatus[SCREEN.peerConnection.peerId]=true; 
              //var allDone=true;
              //for(var key in SCREEN.fadeOutStatus)
                //if(!SCREEN.fadeOutStatus[key]) allDone=false;
              //if(allDone){
                //SCREEN.fadeOutStatus={}; 
                //nextVisual();
              //}
            //}else{
              //SCREEN.peerConnection.sendToMaster({type:'status',payload:'fadeOutDone'}); 
            //}
          //});


          function nextVisual(){
            logger.debug('start next visual');
            $timeout.cancel(SCREEN.timer); 
            if(SCREEN.visualIndex<SCREEN.scene.timeline.length-1 && SCREEN.visualIndex<SCREEN.scene.visuals.length-1)
              SCREEN.visualIndex++;
            else
              SCREEN.visualIndex=0;
            logger.debug('Trigger to next visual',SCREEN.visualIndex);
            SCREEN.peerConnection.publishToScreens({type:'action',name:'fadeIn',payload:SCREEN.visualIndex}); 
            fadeIn(SCREEN.visualIndex);
            SCREEN.visualStatus="fadeIn";
            SCREEN.fadeInTime=Date.now();
            setFadeOutTimeout();
          };

        }
      };
    }]);
}());
