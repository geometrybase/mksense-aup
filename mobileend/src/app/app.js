(function(){

  'use strict';
  angular.module('mksense', [
    'mksense.config',
    'mksense.core',
    'mksense.home',
    'mksense.scene',
    'mksense.visuals',
    'angular-gestures',
    'ui.bootstrap'
  ])
  .config([
    '$stateProvider',
    '$urlRouterProvider',
    '$locationProvider',
    '$httpProvider',
    'hammerDefaultOptsProvider',
    function (
      $stateProvider,
      $urlRouterProvider,
      $locationProvider,
      $httpProvider,
      hammerDefaultOptsProvider
    ) {

      hammerDefaultOptsProvider.set({
        recognizers: [
          [Hammer.Tap,{enable: true}],
          [Hammer.Press,{enable:true}],
          [Hammer.Pan,{enable:true}],
          [Hammer.Swipe,{enable:true}]
        ]
      });

      $httpProvider.defaults.useXDomain = true;
      delete $httpProvider.defaults.headers.common['X-Requested-With'];
      // Add interceptors for $httpProvider and $sailsSocketProvider
      $httpProvider.interceptors.push('AuthInterceptor');
      $httpProvider.interceptors.push('ErrorInterceptor');

      $stateProvider.state('mksense',{
        abstract:true,
        template: '<ui-view/>'
      });

    }
  ]);

  angular.module('mksense')
  .run([
    '$log','$window', '$rootScope', '$state', '$injector','AuthService','$location','$localStorage','$stateParams','mkSocket',
    function(
      $log,$window,$rootScope,$state,$injector,AuthService,$location,$localStorage,$stateParams,mkSocket
    ){

      //$localStorage.credentials=null;
      $rootScope.socket=new mkSocket();

      function enhanceLogging(loggingFunc, context) {
        return function() {
          var modifiedArguments = [].slice.call(arguments);
          var moment=Date.now();
          if(context.length<21){
            var spaces='';
            for(var i=0; i<21-context.length;i++)
              spaces+=' ';
            context=spaces+context; 
          }else if(context.length>21){
            context='...'+context.substr(context.length-18,18); 
          }
          moment=moment.toString().substr(8);            
          //modifiedArguments[0] = [moment.toISOString() + '::[' + context + ']> '] + modifiedArguments[0];
          modifiedArguments.unshift('background: grey; color: white;font-size:12px;padding:0 10px;line-height:1.2;');
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
      logger.debug('Start running!');

      $rootScope.$on('$stateChangeStart', function stateChangeStart(event, toState,toParams,fromState,fromParams) {

        logger.debug('state change');
        if (!AuthService.authorize(toState.data.access)) {
          event.preventDefault();
          var loginState=$state.get('auth.login');
          loginState.data.fromState=toState;
          loginState.data.fromParams=toParams;
          $state.go('auth.login',toParams);
        }

      });

      // Check for state change errors.
      $rootScope.$on('$stateChangeError', function stateChangeError(event, toState, toParams, fromState, fromParams, error) {
        event.preventDefault();
        $injector.get('MessageService')
        .error('Error loading the page');
        $state.get('error').error = {
          event: event,
          toState: toState,
          toParams: toParams,
          fromState: fromState,
          fromParams: fromParams,
          error: error
        };
        return $state.go('error');
      });

    }
  ]);

}());

