(function(){
  'use strict';
  angular.module('mksense', [
    'mksense.core',
    'mksense.visuals',
    'mksense.screen',
    'mksense.scene',
    'mksense.exhibition'
  ])
  .config([
    '$stateProvider',
    '$urlRouterProvider',
    '$httpProvider',
    function (
      $stateProvider,
      $urlRouterProvider,
      $httpProvider
    ) {

      $httpProvider.defaults.useXDomain = true;
      delete $httpProvider.defaults.headers.common['X-Requested-With'];
      // Add interceptors for $httpProvider and $sailsSocketProvider
      $httpProvider.interceptors.push('AuthInterceptor');
      $httpProvider.interceptors.push('ErrorInterceptor');
      $httpProvider.defaults.cache = true;


      $stateProvider.state('mksense',{
        abstract:true,
        template: '<ui-view/>'
      });

      $urlRouterProvider.when('/', '/default');

    }
  ]);

  angular.module('mksense')
  .run([
    '$log','$rootScope','AuthService','$state','mkSocket','d3',
    function(
      $log,$rootScope,AuthService,$state,mkSocket,d3
  ){
    var color=d3.scale.category20();
    function enhanceLogging(loggingFunc, context) {

      return function() {
        var modifiedArguments = [].slice.call(arguments);
        var moment=Date.now();
        if(context.length<21){
          context=' '.repeat(21-context.length)+context; 
        }else if(context.length>21){
          context='...'+context.substr(context.length-18,18); 
        }
        moment=moment.toString().substr(8);
        modifiedArguments.unshift('background: '+color(context)+'; color: white;font-size:12px;padding:0 10px;line-height:1.2;');
        modifiedArguments.unshift('%c'+moment+' ' + context + '>');

        loggingFunc.apply(null, modifiedArguments);
      };
    }

    $log.getInstance = function(context) {
      return {
        log   : enhanceLogging($log.log, context),
        info  : enhanceLogging($log.info, context),
        warn  : enhanceLogging($log.warn, context),
        debug : enhanceLogging($log.debug, context),
        error : enhanceLogging($log.error, context)
      };
    };

    var logger=$log.getInstance('APP');
    logger.debug('APP START!');

    $rootScope.socket=new mkSocket();
    $rootScope.socketRooms={};

    $rootScope.socket.on('disconnect',function(){
      logger.debug('disconnect');
    });

    $rootScope.socket.on('reconnect',function(){
      logger.debug('socket reconnect');
    });

    $rootScope.socket.on('connect',function(){
      logger.debug('socket connect');
    });

    $rootScope.socket.on('ipAddress',function(ipAddress){
      $rootScope.socketRooms={};
      $rootScope.addressId=ipAddress.replace(/[\:f]+/gi,'').replace(/\./g,'-');
      $rootScope.ipAddress=ipAddress; 
      logger.debug('ipAddress',$rootScope.ipAddress,'addressId',$rootScope.addressId);
      $rootScope.$broadcast('addressId',$rootScope.addressId);
    });


    $rootScope.$on('$stateChangeStart', function stateChangeStart(event, toState,toParams,fromState,fromParams) {
      if (!AuthService.authorize(toState.data.access)) {
        event.preventDefault();
        var loginState=$state.get('exhibition.passcode');
        loginState.data.fromState=toState;
        loginState.data.fromParams=toParams;
        if(toParams.exhibitionId){
          $state.go('exhibition.passcode',toParams);
        }else{
          $state.go('404');
        }
      }
    });
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
      $rootScope.state=toState;
    });

    // Check for state change errors.
    $rootScope.$on('$stateChangeError', function stateChangeError(event, toState, toParams, fromState, fromParams, error) {
      //event.preventDefault();
      //$injector.get('MessageService')
      //.error('Error loading the page');
      //$state.get('error').error = {
        //event: event,
        //toState: toState,
        //toParams: toParams,
        //fromState: fromState,
        //fromParams: fromParams,
        //error: error
      //};
      //return $state.go('error');
    });
  }
  ]);
}());
