(function() {
  'use strict';

  angular.module('mksense.screen')
  .factory('ScreenPC',[
    'mkPeer','_','uuid','EventEmitter','$log',
    function(mkPeer,_,uuid,EventEmitter,$log){

      var logger=$log.getInstance('ScreenPC');

      function ScreenPC(addressId,exhibitionId,sceneId,screenIndex,scene){

        EventEmitter.call(this);

        var self=this;
        self.addressId=addressId;
        self.exhibitionId=exhibitionId;
        self.sceneId=sceneId;
        self.screenIndex=screenIndex;
        self.scene=scene;
        self.idPrefix=addressId+'_'+exhibitionId+'_'+sceneId+'_';
        self.peerId=self.idPrefix+screenIndex;
        self.peer=new mkPeer(self.peerId);
        self.connectionStatus={};
        self.connectionMap={};

        logger.debug('Creating screen peer connection, current peerId is '+self.peerId);

        self.peer.on('connection',function(conn){
          logger.debug(self.peerId,'get peer connection from ',conn.peer);
          self.registerPeerConnection(conn);
        });

        self.peer.on('error',function(err){
          if(err.type==='peer-unavailable'){
            var connId=err.message.replace('Could not connect to peer','').trim();
            delete self.connectionStatus[connId];
            logger.warn('peer-unavailable',connId);
            var peerReady=true;
            for(var id in self.connectionStatus)
              if(self.connectionStatus[id] === 'pending')
                peerReady=false;
            if(peerReady)
              self.emit('ready');
          }else{
            self.emit('error',err);
          }
        });

        scene.screens.forEach(function(s,index){
          if(self.screenIndex !== index && !self.connectionMap[self.idPrefix+index]){
            var conn=self.peer.connect(self.idPrefix+index,{label:'SCREEN-'+uuid()});
            self.connectionStatus[self.idPrefix+index]='pending';
            self.registerPeerConnection(conn);
          }
        });

        if(screenIndex===0){
          var subs={};
          scene.subscribers.forEach(function(s){
            var conn=self.peer.connect(addressId+'_'+exhibitionId+'_'+s.id+'_0',{label:'pubsub-'+uuid()});
            self.connectionStatus[addressId+'_'+exhibitionId+'_'+s.id+'_0']='pending';
            self.registerPeerConnection(conn);
            subs[addressId+'_'+exhibitionId+'_'+s.id+'_0']=true;
          });
          self.subscribers=subs;
          var pubs={};
          scene.publishers.forEach(function(s){
            var conn=self.peer.connect(addressId+'_'+exhibitionId+'_'+s.id+'_0',{label:'pubsub-'+uuid()});
            self.connectionStatus[addressId+'_'+exhibitionId+'_'+s.id+'_0']='pending';
            self.registerPeerConnection(conn);
            pubs[addressId+'_'+exhibitionId+'_'+s.id+'_0']=true;
          });
          self.publishers=pubs;
        }

      }

      ScreenPC.prototype=_.create(EventEmitter.prototype,{
        'constructor':ScreenPC
      });

      ScreenPC.prototype.registerPeerConnection=function(conn){

        var self=this;
        conn.on('open',function(){
          logger.debug('Peer connection '+self.peerId+'-'+conn.peer+'('+conn.label+') is openned.');
          var oldConn=self.connectionMap[conn.peer];
          if(!oldConn){
            self.connectionMap[conn.peer]=conn;
            logger.debug('open new connection',self.connectionMap);
          }else if(oldConn.label>conn.label){
            self.connectionMap[conn.peer]=conn;
            logger.debug('open new connection, close old connection',self.connectionMap);
            oldConn.close();
          }else{
            conn.close(); 
          }
          self.connectionStatus[conn.peer]='connected';
          self.emit('connOpen',conn);
          var peerReady=true;
          for(var id in self.connectionStatus)
            if(self.connectionStatus[id] === 'pending')peerReady=false;
          if(peerReady)self.emit('ready');
        });

        conn.on('close',function(){
          logger.debug('Peer connection '+self.peerId+'-'+conn.peer+'('+conn.label+') is closed.');
          if(self.connectionMap[conn.peer] && self.connectionMap[conn.peer].label === conn.label){
            delete self.connectionMap[conn.peer];
            delete self.connectionStatus[conn.peer];
          }
          logger.debug('close',self.connectionStatus);
          logger.debug('close',self.connectionMap);
          self.emit('connClose',conn);
        });

        conn.on('error',function(error){
          self.emit('connError',conn,error);
        });

        conn.on('data',function(data){
          if(data.label==='screen-data')
            self.emit('screenData',conn,data.data);
          if(data.label==='pubsub-data')
            self.emit('pubsubData',conn,data.data);
        });

      }

      ScreenPC.prototype.sendData=function(peerId,data){
        if(this.connectionMap[peerId]){
          this.connectionMap[peerId].send(data);
        }else{
          this.emit('error','connection '+peerId+' is not existed.'); 
        }
      };


      ScreenPC.prototype.sendToMaster=function(data){
        this.sendData(this.addressId+'_'+this.exhibitionId+'_'+this.sceneId+'_0',{label:'screen-data',data:data});  
      };

      ScreenPC.prototype.sendToScreen=function(peerId,data){
        this.sendData(peerId,{label:'screen-data',data:data});  
      };

      ScreenPC.prototype.publishToScreens=function(data){
        for(var peerId in this.connectionMap){
          var conn=this.connectionMap[peerId];
          if(conn.label.substring(0,6)==='SCREEN') conn.send({label:'screen-data',data:data});
        } 
      };

      ScreenPC.prototype.publishToScenes=function(data){
        for(var peerId in this.subscribers){
          var conn=this.connectionMap[peerId];
          if(this.subscribers[peerId] && conn)conn.send({label:'pubsub-data',data:data});
        } 
      };

      ScreenPC.prototype.getConnectionDict=function(status,type){
        var dict={};
        for(var key in this.connectionMap){
          var conn=this.connectionMap[key];
          if(conn.label.substring(0,6)==='SCREEN')      
            dict[key]=status; 
        }
        return dict
      };

      return ScreenPC;

    }
  ]);

}());
