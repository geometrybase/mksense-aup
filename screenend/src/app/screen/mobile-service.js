(function() {
  'use strict';

  angular.module('mksense.screen')
  .factory('MobileService',[
    '_','$log',
    function(_,$log){
      var logger=$log.getInstance('MobileService');

      function MobileService(scope,socket,screen){
        var self=this;
        self.scope=scope;
        self.socket=socket;
        self.screen=screen;
        self.mobiles={};

        self.mobileIn=function(mobileInfo){
          if(!mobileInfo.mobileId)
            return logger.debug('mobileInfo without mobileId'); 
          logger.debug('%cmobileIn '+mobileInfo.mobileId,'background:red;');
          self.mobiles[mobileInfo.mobileId]={mobileInfo:_.cloneDeep(mobileInfo)};
          self.screen.visualScopes[self.screen.visualIndex].$broadcast('mobileIn',mobileInfo);
          //self.scope.$broadcast('mobileIn',mobileInfo);
        }
        self.socket.on('mobileIn',self.mobileIn);

        self.mobileInResponse=self.scope.$on('mobileInResponse',function(event,res){
          logger.debug('mobileInResponse',res);
          if(!res.mobileInfo)
            return logger.error('need mobileInfo to send mobileInResponse');
          logger.debug(self.screen);
          var visualType=self.screen.scene.visuals[self.screen.visualIndex].type;
          var visualId=self.screen.scene.visuals[self.screen.visualIndex].id;
          //if mobin join in from self screen, then send back the response message
          if(res.mobileInfo.screenIndex===self.screen.screenIndex){
            self.socket.emit('mobileMessage',{
              to:res.mobileInfo.mobileId, 
              eventName:'mobileInResponse',
              payload:{
                visualType:visualType,
                visualId:visualId,
                payload:res.payload
              }
            }); 
          }
          //update mobile list info;
          self.mobiles[res.mobileInfo.mobileId]={mobileInfo:_.cloneDeep(res.mobileInfo),cache:res.cache,visualType:visualType,visualId:visualId};
        });

        self.mobileOut=function(mobileInfo){
          if(!mobileInfo.mobileId)
            return logger.debug('mobileOut without mobileId'); 
          logger.debug('mobileOut',mobileInfo);
          if(self.mobiles[mobileInfo.mobileId]){
            self.scope.$broadcast('mobileOut',{mobileInfo:_.cloneDeep(mobileInfo),cache:self.mobiles[mobileInfo.mobileId].cache});
            delete self.mobiles[mobileInfo.mobileId];
          }
        }
        self.socket.on('mobileOut',self.mobileOut);


        self.mobileAction=function(mobileActionInfo){
          if(!self.mobiles[mobileActionInfo.mobileInfo.mobileId])
            return self.mobileIn(_.cloneDeep(mobileActionInfo.mobileInfo)); 
          logger.debug('mobileActionInfo',mobileActionInfo);
          console.log(self.mobiles);
          self.screen.visualScopes[self.screen.visualIndex].$broadcast('mobileAction',{mobileInfo:_.cloneDeep(self.mobiles[mobileActionInfo.mobileInfo.mobileId].mobileInfo),cache:self.mobiles[mobileActionInfo.mobileInfo.mobileId].cache,payload:mobileActionInfo.payload}); 
        }
        self.socket.on('mobileAction',self.mobileAction);

        self.mobileActionResponse=self.scope.$on('mobileActionResponse',function(event,res){
          logger.debug('mobileActionResponse',res);
          if(self.mobiles[res.mobileInfo.mobileId]){
            var visualType=self.screen.scene.visuals[self.screen.visualIndex].type;
            self.socket.emit('mobileMessage',{
              to:res.mobileInfo.mobileId, 
              eventName:'mobileActionResponse',
              payload:{
                visualType:visualType,
                payload:res.payload
              }
            }); 
            self.mobiles[res.mobileInfo.mobileId]=_.assign(self.mobiles[res.mobileInfo.mobileId],{cache:res.cache,visualType:visualType});
          };
        });

        self.mobileComment=function(commentInfo){
          self.scope.$broadcast('mobileComment',commentInfo);
        }
        self.socket.on('mobileComment',self.mobileComment);
      }

      MobileService.prototype.destroy=function destroy(){
        this.socket.removeListener('mobileIn',this.mobileIn); 
        this.socket.removeListener('mobileOut',this.mobileOut);
        this.socket.removeListener('mobileAction',this.mobileAction);
        this.socket.removeListener('mobileComment',this.mobileComment);
        this.mobileInResponse();
        this.mobileActionResponse();
      };

      return MobileService;
    }
  ]);

}());
