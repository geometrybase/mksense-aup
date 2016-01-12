(function() {
  'use strict';
  angular.module('mksense.core.mksocket',[])
  .factory('mkSocket',[
    'io',
    'MKConfig',
    'socketFactory',
    function(
      io,
      MKConfig,
      socketFactory
    ){
      function mkSocket(){
        var opts={
          prefix:'mk:'
        };
        if(MKConfig.ws){
          var ioSocket=io.connect(MKConfig.ws); 
        }else{
          var ioSocket=io.connect('ws://127.0.0.1:3000'); 
        }
        opts.ioSocket=ioSocket;

        var mkSocket=socketFactory(opts);
        ioSocket.on('connect',function(){
          mkSocket.id=opts.ioSocket.id;
        });
        ioSocket.on('reconnect',function(){
          mkSocket.id=opts.ioSocket.id;
        });
        return mkSocket;
      }
      return mkSocket;
    }]);
}());
