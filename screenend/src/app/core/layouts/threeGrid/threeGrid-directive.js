(function(){
  'use strict';
  angular.module('mksense.core.layouts')
  .directive('threeGrid', [
    '$window',
    '$log',
    'ThreeGridModel',
    'toastr',
    function(
      $window,
      $log,
      ThreeGridModel,
      toastr
    ){

      return {

        transclude:true,
        restrict:'EA',
        templateUrl:'/core/layouts/threeGrid/threeGrid.html',
        scope:{
          socket:'=socket'
        },
        link:function(scope,element){

          var layout;
          var visualData;
          var screenInfo;
          scope.$watch('socket',function(socket){

            scope.socket=socket;

            toastr.success('Get socket from controller!'); 

            scope.socket.on('mobileAction',function(actionInfo){
              toastr.success('mobile action from '+actionInfo.mobileId); 
              if(layout){
                layout.runMobileAction(actionInfo,function(index){
                  actionInfo.index=index; 
                  if(layout.screenInfo.screenId === actionInfo.screenId){
                    scope.socket.emit('data',{to:actionInfo.mobileId,data:layout.getLayoutData(actionInfo),name:'layoutInfo'}); 
                  }
                });
              }
            });

            scope.socket.on('joinScreen',function(mobileInfo){
              toastr.success(mobileInfo.mobileId+' join this screen!'); 
              if(layout){
                $log.info(mobileInfo);
                layout.addMobileClient(mobileInfo); 
                if(layout.screenInfo.screenId === mobileInfo.screenId){
                  scope.socket.emit('data',{to:mobileInfo.mobileId,data:layout.getLayoutData(mobileInfo),name:'layoutInfo'}); 
                }
              }
            });

            scope.socket.on('leaveScreen',function(mobileInfo){
              toastr.success(mobileInfo.mobileId+' leave this screen!'); 
              if(layout){
                layout.removeMobileClient(mobileInfo); 
              }
            });
            scope.socket.on('queryLayoutInfo',function(mobileInfo){
              if(layout && mobileInfo.mobileId){
                toastr.info(mobileInfo.mobileId+' query for layout data');
                scope.socket.emit('data',{to:mobileInfo.mobileId,data:layout.getLayoutData(),name:'layoutInfo'}); 
              }
            });
          });

          scope.$on('visualDataUpdate',function(event,_visualData){
            toastr.success('Visual data updated!');
            visualData=_visualData;
            if(screenInfo){ 
              if(!layout){
                layout=new ThreeGridModel(element,screenInfo,visualData);           
              }else{
                layout.updateVisualData(visualData); 
              }
            }
          });

          scope.$on('screenInfoUpdate',function(event,_screenInfo){
            toastr.success('Screen info updated!');
            $log.info(_screenInfo);
            screenInfo=_screenInfo;
            if(visualData){
              if(!layout){
                layout=new ThreeGridModel(element,screenInfo,visualData);            
              }else{
                layout.updateScreenInfo(screenInfo); 
              }
            }
          });
        }

      };
    }]);
}());
