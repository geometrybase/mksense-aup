(function() {
  'use strict';

  angular.module('mksense.scene')
  .factory('SceneService',[
    'mkConfig','mkSocket','mkPeer','$window','$log','$timeout','$interval','_','EventEmitter','$http','$rootScope','uuid',
    function(
      mkConfig,mkSocket, mkPeer,$window,$log,$timeout,$interval,_,EventEmitter,$http,$rootScope,uuid
    ){

      var logger=$log.getInstance('SCENE-SERVICE');

      function SceneService(sceneConfig){


        EventEmitter.call(this);
        var self=this;
        if(sceneConfig.screenIndex===0){
          self.isMaster=true;
        }else{
          self.isMaster=false;
        }
        self.connectionsMap={};
        self.connectionStatus={}; 
        self.fadeOutStatus={};
        self.screenIndex=sceneConfig.screenIndex;
        self.organizationName=sceneConfig.organizationName;
        self.sceneName=sceneConfig.sceneName;
        self.visualIndex=0;
        self.visualStatus="Pending";
        self.mobiles={};

        $http.get(mkConfig.cmsServer+sceneConfig.organizationName+'/scene/'+sceneConfig.sceneName,{
          cache:true
        })
        .success(function(data, status, headers, config) {
          if(!data || !data['visuals'] || !data['timeline'] || !data['screens'] || !data['screens'][sceneConfig.screenIndex]){
            logger.debug(data.visuals);
            return self.emit('error','Incomplete scene response from '+mkConfig.cmsServer+sceneConfig.organizationName+'/'+sceneConfig.sceneName);
          }else{
            logger.debug('screen data',data.visuals);
            self.screens=data.screens; 
            self.visuals=data.visuals;
            self.timeline=data.timeline;
            self.sceneDescription=data.description;
            self.publishers=data.publishers;
            self.subscribers=data.subscribers;
            self.status={};
            self.id=data.id;
            self.socket=new mkSocket();
            setScreenInfo();
            createPeerConnections();
            registerSocketEvents();
            registerSceneEvents();
          }
        })
        .error(function(data, status, headers, config) {
          self.emit('error',status);
        });

        function registerSceneEvents(){

          self.on('status',function(){
            logger.debug(self.status);
            if(self.status.socket && self.status.peer && self.status.screenInfo && self.status.compile) 
              self.emit('ready');
          }); 

          self.on('compileDone',function(){
            self.status.compile=true; 
            self.emit('status');
          });


          self.on('ready',function(){
            self.isReady=true;
            logger.debug('Scene is ready!!!!!!!'); 
            if(self.isMaster){
              self.visualIndex=0;
              logger.debug('Publish ready event to slaves');
              self.publishToScreens({label:'status',message:{status:'ready'}});
              self.emit('action',{action:'fadeIn',data:self.visualIndex});
              self.fadeInTime=Date.now();
              self.visualStatus='fadeIn';
              self.fadeOutInterval=self.timeline[self.visualIndex];
              self.fadeOut(self.fadeOutInterval);
            }else{
              if(self.masterReady)
                self.sendToMaster({label:'status',message:{status:'ready'}}); 
            }
          });


          self.on('fadeOutDone',function(){
            if(self.isMaster){
              self.fadeOutStatus[self.peerId]=true; 
              var allDone=true;
              for(var key in self.fadeOutStatus){
                if(!self.fadeOutStatus[key]) 
                  allDone=false;
              }
              if(allDone){
                self.fadeOutStatus={}; 
                self.nextVisual();
              }
            }else{
              self.sendToMaster({label:'status',message:{status:'fadeOutDone'}}); 
            }
          });

        }

        function setScreenInfo(){
          self.screenInfo={};
          self.screenInfo.zoneWidth=0;
          self.screenInfo.zoneHeight=0;
          self.screenInfo.x=0;
          self.screenInfo.y=0;
          self.screenInfo.screenIndex=self.screenIndex;
          self.screens.forEach(function(screen,index){
            if(screen.height>self.screenInfo.zoneHeight){
              self.screenInfo.zoneHeight=screen.height; 
            }
            if(index === self.screenIndex){
              self.screenInfo.x=self.screenInfo.zoneWidth;
              self.screenInfo.zoneWidth+=screen.width;
              self.screenInfo.width=screen.width;
              self.screenInfo.height=screen.height;
            }else{
              self.screenInfo.zoneWidth+=screen.width;
            } 
          });
          self.screenInfos=[];
          var x=0;
          self.screens.forEach(function(screen,index){
            var screenInfo=_.cloneDeep(self.screenInfo);
            screenInfo.x=x;
            screenInfo.width=screen.width;
            screenInfo.height=screen.height;
            screenInfo.screenIndex=index;
            self.screenInfos.push(screenInfo);
            x+=screen.width;
          });
          self.status.screenInfo=true;
          self.emit('compile',{visuals:self.visuals,screenInfo:self.screenInfo,screenInfos:self.screenInfos});
          self.emit('status'); 
        }

        function registerSocketEvents(){
          self.socket.on('connect',function(){
            logger.debug('Socket connected register socket events');
            self.socket.emit('joinScene',{
              sceneName:self.sceneName,
              organizationName:self.organizationName,
              screenId:self.id+'_'+self.screenIndex,
              screenIndex:self.screenIndex
            });
          });
          self.socket.on('reconnect',function(){
            logger.debug('Socket reconnected register socket events');
            logger.debug('Socket connected register socket events');
            self.socket.emit('joinScene',{
              sceneName:self.sceneName,
              organizationName:self.organizationName,
              screenId:self.id+'_'+self.screenIndex,
              screenIndex:self.screenIndex
            });
          });
          self.socket.on('connect_error',function(err){
            logger.debug('socket connect_error');
            self.emit('error',err);
          });
          self.socket.on('joinSceneDone',function(rooms){
            logger.debug(rooms);
            self.rooms=rooms;
            self.status.socket=true;
            self.emit('status'); 
          });

          self.socket.on('mobileIn',function(mobileInfo){
            if(!mobileInfo.mobileId){
              logger.debug('mobileInfo without mobileId'); 
              return;
            }
            self.mobiles[mobileInfo.mobileId]=_.cloneDeep(mobileInfo);
            logger.debug('mobileIn',self.mobiles[mobileInfo.mobileId]);
            self.emit('mobileIn',_.cloneDeep(mobileInfo));
          });

          self.on('mobileInResponse',function(res){
            logger.debug('mobileInResponse',res);
            if(!res.mobileInfo){
              logger.error('need mobileInfo to send mobileInResponse');
              return;
            }
            if(res.mobileInfo.screenIndex===self.screenIndex){
              self.socket.emit('message',{
                to:res.mobileInfo.mobileId, 
                eventName:'mobileInResponse',
                payload:{
                  visualType:self.getCurrentVisualType(),
                  payload:res.payload
                }
              }); 
            }
            self.mobiles[res.mobileInfo.mobileId]={mobileInfo:_.cloneDeep(res.mobileInfo),cache:res.cache,visualType:self.getCurrentVisualType()};
          });

          self.socket.on('mobileOut',function(mobileInfo){
            if(!mobileInfo.mobileId){
              logger.debug('mobileOut without mobileId'); 
              return;
            }
            logger.debug('mobileOut',mobileInfo);
            if(self.mobiles[mobileInfo.mobileId]){
              self.emit('mobileOut',{mobileInfo:_.cloneDeep(mobileInfo),cache:self.mobiles[mobileInfo.mobileId].cache});
              delete self.mobiles[mobileInfo.mobileId];
            }
          });

          self.socket.on('mobileAction',function(mobileActionInfo){
            if(!self.mobiles[mobileActionInfo.mobileInfo.mobileId])
              return self.emit('mobileIn',_.cloneDeep(mobileActionInfo.mobileInfo)); 
            logger.debug('mobileActionInfo',mobileActionInfo);
            self.emit('mobileAction',{mobileInfo:_.cloneDeep(self.mobiles[mobileActionInfo.mobileInfo.mobileId].mobileInfo),cache:self.mobiles[mobileActionInfo.mobileInfo.mobileId].cache,payload:mobileActionInfo.payload}); 
          });

          self.on('mobileActionResponse',function(res){
            logger.debug('mobileActionResponse',res);
            if(self.mobiles[res.mobileInfo.mobileId]){
              self.socket.emit('message',{
                to:res.mobileInfo.mobileId, 
                eventName:'mobileActionResponse',
                payload:{
                  visualType:self.getCurrentVisualType(),
                  payload:res.payload
                }
              }); 
              self.mobiles[res.mobileInfo.mobileId]=_.assign(self.mobiles[res.mobileInfo.mobileId],{cache:res.cache,visualType:self.getCurrentVisualType()});
            } 
          });

          self.socket.on('mobileComment',function(commentInfo){
          
          });

        }
        
        function createPeerConnections(){

          self.peerId=self.id+'_'+self.screenIndex;
          self.peer=new mkPeer(self.peerId);
          logger.debug('Creating peer connection, current peerId is '+self.peerId);
          self.peer.on('connection',function(conn){
            logger.debug(self.peerId,'get peer connection from ',conn.peer);
            registerConnEvents(conn);
          });
          self.peer.on('error',function(err){
            if(err.type==='peer-unavailable'){
              logger.debug(err.message.replace('Could not connect to peer','').trim());
              var connId=err.message.replace('Could not connect to peer','').trim();
              delete self.connectionStatus[connId];
              var peerReady=true;
              for(var id in self.connectionStatus){
                if(self.connectionStatus[id] === 'pending'){
                  peerReady=false;
                  break;
                }
              }
              logger.debug('Peer connection status',self.connectionStatus);
              if(peerReady){
                self.status.peer=true;
                self.emit('status'); 
              }
            }else{
              self.emit('error',err);
            }
          });
          self.screens.forEach(function(s,index){
            if(self.screenIndex !== index && !self.connectionsMap[self.id+'_'+index]){
              var conn=self.peer.connect(self.id+'_'+index,{label:'screen-'+uuid()});
              self.connectionStatus[self.id+'_'+index]='pending';
              registerConnEvents(conn);
            }
          });
          if(self.isMaster){
            var subs={};
            self.subscribers.forEach(function(s){
              var conn=self.peer.connect(s.id+'_0',{label:'pubsub-'+uuid()});
              self.connectionStatus[s.id+'_0']='pending';
              registerConnEvents(conn);
              subs[s.id+'_0']=true;
            });
            self.subscribers=subs;
            var pubs={};
            self.publishers.forEach(function(s){
              var conn=self.peer.connect(s.id+'_0',{label:'pubsub-'+uuid()});
              self.connectionStatus[s.id+'_0']='pending';
              registerConnEvents(conn);
              pubs[s.id+'_0']=true;
            });
            self.publishers=pubs;
          }
        }

        function registerConnEvents(conn){

          conn.on('open',function(){

            logger.debug('Peer connection '+self.peerId+'-'+conn.peer+'('+conn.label+') is openned.');
            var oldConn=self.connectionsMap[conn.peer];
            if(!oldConn){
              self.connectionsMap[conn.peer]=conn;
              logger.debug('open',self.connectionsMap);
            }else if(oldConn.label>conn.label){
              self.connectionsMap[conn.peer]=conn;
              logger.debug('open',self.connectionsMap);
              oldConn.close();
            }else{
              conn.close(); 
            }


            if(self.isMaster && self.isReady && !self.connectionStatus[conn.peer] && self.visualStatus !== 'fadeOut'){
              logger.debug('Send ready event to slave',conn.peer);
              self.sendData(conn.peer,{label:'status',message:{status:'ready'}});
            }

            if(!self.isReady){
              self.connectionStatus[conn.peer]='connected';
              var peerReady=true;
              for(var id in self.connectionStatus){
                if(self.connectionStatus[id] === 'pending'){
                  peerReady=false;
                  break;
                }
              }
              logger.debug('Peer connection status',self.connectionStatus);
              if(peerReady){
                self.status.peer=true;
                self.emit('status'); 
              }
            }else{
              self.connectionStatus[conn.peer]='connected';
            }

          });

          conn.on('close',function(){
            logger.debug('Peer connection '+self.peerId+'-'+conn.peer+'('+conn.label+') is closed.');
            if(self.connectionsMap[conn.peer] && self.connectionsMap[conn.peer].label === conn.label){
              delete self.connectionsMap[conn.peer];
              delete self.connectionStatus[conn.peer];
              delete self.fadeOutStatus[conn.peer];
            }
            logger.debug('close',self.connectionStatus);
            logger.debug('close',self.connectionsMap);
          });
          conn.on('error',function(err){
            logger.debug('Create peer connection '+self.peerId+'-'+conn.peer,' result in error.',err);
          });
          conn.on('data',function(data){

            if(data.label === 'publish'){
              logger.debug('publish',data.data);
              self.emit('pubsub',data.data);
            }

            if(data.label==='action'){
              if(data.message.action==='fadeIn'){
                self.visualIndex=data.message.visualIndex;
                self.emit('action',{action:'fadeIn',data:self.visualIndex}); 
              }
              if(data.message.action==='fadeOut'){
                self.emit('action',{action:'fadeOut'});
              }
            }
            if(data.label==='data')
                self.emit('data',data.message); 
            
            if(data.label==='status'){
              if(data.message.status==='ready' && self.connectionStatus[conn.peer] !== 'ready'){
                self.connectionStatus[conn.peer]='ready';
                if(self.isMaster){
                  logger.debug('Get ready event from slave screen',conn.peer);
                  logger.debug('Send fadeIn event to',conn.peer);
                  self.sendData(conn.peer,{label:'action',message:{action:'fadeIn',visualIndex:self.visualIndex}}); 
                }else{
                  self.masterReady=true; 
                  logger.debug('Get ready event from master screen',conn.peer);
                  if(self.isReady){
                    logger.debug('Send ready event to master screen',conn.peer);
                    self.sendToMaster({label:'status',message:{status:'ready'}}); 
                  }
                }
              }
              if(data.message.status==='fadeOutDone'){
                logger.debug('fadeOutDone event from slave',conn.peer);
                self.fadeOutStatus[conn.peer]=true; 
                var allDone=true;
                for(var key in self.fadeOutStatus){
                  if(!self.fadeOutStatus[key]) 
                    allDone=false;
                }
                if(allDone)
                  self.nextVisual();
              }
            }
            //logger.debug(data);
            //if(conn.label.substring(0,6)==='pubsub')
              //self.emit('pubsub-data',data);
            //if(conn.label.substring(0,6)==='screen')
              //self.emit('screen-data',data);
          });
        }
      }

      SceneService.prototype=_.create(EventEmitter.prototype,{
        'constructor':SceneService
      });

      SceneService.prototype.nextVisual=function(){
        var self=this;
        $timeout.cancel(self.timer); 
        if(self.visualIndex<self.timeline.length-1 && self.visualIndex<self.visuals.length-1)
          self.visualIndex++;
        else
          self.visualIndex=0;
        logger.debug('Trigger to next visual',self.visualIndex);
        self.publishToScreens({label:'action',message:{action:'fadeIn',visualIndex:self.visualIndex}}); 
        self.visuals[self.visualIndex].configs.screenInfo=self.screenInfo;
        self.emit('action',{action:'fadeIn',data:self.visualIndex});
        self.visualStatus="fadeIn";
        self.fadeInTime=Date.now();
        self.fadeOutInterval=self.timeline[self.visualIndex];
        self.fadeOut(self.fadeOutInterval);
      };

      SceneService.prototype.fadeOut=function(time){
        logger.debug('fade out after',time,'ms');
        var self=this;
        $timeout.cancel(self.timer);
        self.timer=$timeout(function(){
          self.fadeOutStatus={};
          self.publishToScreens({label:'action',message:{action:'fadeOut'}}); 
          self.emit('action',{action:'fadeOut'});
          self.visualStatus="fadeOut";
          self.fadeOutStatus[self.peerId]=false;
          for(var key in self.connectionStatus){
            self.fadeOutStatus[key]=false; 
          }
        },time);
      };

      SceneService.prototype.delay=function(delay){
        var self=this; 
        self.fadeOutInterval+=delay;
        self.fadeOut(self.fadeInTime+self.fadeOutInterval-Date.now());
      }

      SceneService.prototype.publishToScreens=function(data){
        var self=this;
        if(!self.isMaster)
          return 
        for(var peerId in self.connectionsMap){
          var conn=self.connectionsMap[peerId];
          if(conn.label.substring(0,6)==='screen')
            conn.send(data);
        } 
      };

      SceneService.prototype.publishToScenes=function(data){
        var self=this;
        if(!self.isMaster)
          return 
        for(var peerId in self.subscribers){
          var conn=self.connectionsMap[peerId];
          if(self.subscribers[peerId] && conn){
            logger.debug('Publish data to ',peerId);
            conn.send({label:'publish',data:data});
          }
        } 
      };

      SceneService.prototype.sendToMaster=function(data){
        var self=this;
        if(!self.connectionsMap[self.id+'_0']){
          self.emit('error','Connection to '+self.id+'_0 is not existed!'); 
        }else{
          self.sendData(self.id+'_0',data);  
        }
      };

      SceneService.prototype.sendData=function(peerId,data){
        var self=this;
        if(self.connectionsMap[peerId]) 
          self.connectionsMap[peerId].send(data);
      };

      SceneService.prototype.getCurrentVisual=function(){
        return this.visuals[this.visualIndex]; 
      };
      SceneService.prototype.getCurrentVisualType=function(){
        return this.visuals[this.visualIndex].type; 
      };

      SceneService.prototype.getNextVisual=function(){
        var i=this.visualIndex;
        if(i<this.timeline.length-1)
          i++;
        else
          i=0;
        return this.visuals[i];
      };

      SceneService.prototype.destroy=function(){
        logger.debug('destroy scope and socket');
        this.socket.removeAllListeners();
        this.socket.disconnect(true); 
        this.peer.destroy();
      };

      return SceneService;

    }
  ]);

}());
