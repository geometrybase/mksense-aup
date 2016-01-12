(function() {
  'use strict';
  angular.module('mksense.core.mkpeer',[])
  .factory('mkPeer',[
    'mkConfig',
    'Peer',
    '$log',
    function(
      mkConfig,
      Peer,
      $log
    ){
      function mkPeer(id){
        return Peer(id,mkConfig.peerServer); 
      }
      return mkPeer;
    }]);
}());
