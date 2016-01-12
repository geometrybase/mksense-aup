(function() {
  'use strict';
  angular.module('mksense.core.mksocket',[])
  .factory('mkSocket',[
    'io',
    'mkConfig',
    'socketFactory',
    '$rootScope',
    '$log',
    function(
      io,
      mkConfig,
      socketFactory,
      $rootScope,
      $log
    ){
      function mkSocket(){
        var opts={
          prefix:'mk:'
        };
        var ioSocket=null;
        if(mkConfig.socketServer){
          ioSocket=io(mkConfig.socketServer,{multiplex:true}); 
        }else{
          ioSocket=io.Manager('ws://127.0.0.1:3000').socket(); 
        }
        return ioSocket;
        //opts.ioSocket=ioSocket;
        //var socket=socketFactory(opts);
        //$rootScope.cache.socket=socket;
        //ioSocket.on('connect',function(){
          //$log.debug('mk-socket:connect,set socket id');
          //socket.id=opts.ioSocket.id;
        //});
        //ioSocket.on('reconnect',function(){
          //$log.debug('mk-socket:reconnect,set socket id');
          //socket.id=opts.ioSocket.id;
        //});
        //return socket;
      }
      return mkSocket;
    }]);
}());
