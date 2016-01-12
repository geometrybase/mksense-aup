(function() {

  'use strict';

  angular.module('mksense.core.layouts')
  .factory('ThreeGridModel',[
    '$log',
    '$window',
    'THREE',
    'CSS3DRenderer',
    'CSS3DObject',
    '$timeout',
    'TWEEN',
    function(
      $log,
      $window,
      THREE,
      CSS3DRenderer,
      CSS3DObject,
      $timeout,
      TWEEN
    ){

      var ThreeGridModel=function(element,screenInfo,visualData){
        this.element=element;
        this.screenInfo=screenInfo;
        this.visualData=visualData;
        this.updateColRow();
        this.mobileClients={};
        this.scene = new THREE.Scene();
        this.duration=1000;
        this.objects=[];
        this.targets={};
        this.activeLayoutName='grid';
        this.populateObjects();
        this.populateTargets();
        this.renderer = new CSS3DRenderer();
        this.renderer.setSize( this.screenInfo.screenWidth, this.screenInfo.screenHeight );
        this.renderer.domElement.css('position','absolute');
        this.element.append( this.renderer.domElement );
        this.update();
        this.animate();
      };

      ThreeGridModel.prototype.updateVisualData=function(visualData){
        //if(visualData === this.visualData){
          //return; 
        //}
        this.visualData=visualData;
        this.destroy();
        this.init(this.element,this.screenInfo,this.visualData);
      };

      ThreeGridModel.prototype.updateScreenInfo=function(screenInfo){
        //if(screenInfo === this.screenInfo){
          //return; 
        //}
        $log.info(screenInfo);
        this.screenInfo=screenInfo;
        this.updateColRow();
        this.targets={};
        this.populateTargets();
        this.renderer.setSize( this.screenInfo.screenWidth, this.screenInfo.screenHeight );
        this.update();
      };

      ThreeGridModel.prototype.getLayoutData=function(mobileInfo){
        if(mobileInfo.mobileId && this.mobileClients[mobileInfo.mobileId] && this.mobileClients[mobileInfo.mobileId] !== -1){
          $log.info('layoutinfo index '+this.mobileClients[mobileInfo.mobileId]);
          var layoutInfo=this.visualData[this.mobileClients[mobileInfo.mobileId]];
          layoutInfo.index=this.mobileClients[mobileInfo.mobileId];
          return layoutInfo;
        }
      };

      ThreeGridModel.prototype.addMobileClient=function(mobileInfo){
        if(mobileInfo && mobileInfo.mobileId && mobileInfo.screenId===this.screenInfo.screenId){
          this.mobileClients[mobileInfo.mobileId]=this.getCenterTargetIndex(); 
          this.objects[this.mobileClients[mobileInfo.mobileId]].element.css('z-index','10000');
          this.objects[this.mobileClients[mobileInfo.mobileId]].element.addClass('flipped');
        }else{
          this.mobileClients[mobileInfo.mobileId]=-1;
        }
      };

      ThreeGridModel.prototype.removeMobileClient=function(mobileInfo){
        if(mobileInfo && mobileInfo.mobileId){
          var index=this.mobileClients[mobileInfo.mobileId];
          if(index !== undefined){
            delete this.mobileClients[mobileInfo.mobileId]; 
          }
          if(index !== undefined && index !== -1 && !this.isMobileOverlap(mobileInfo.mobileId,index)){
            this.objects[index].element.removeClass('flipped');
            var element=this.objects[this.mobileClients[mobileInfo.mobileId]].element;
            $timeout(function(){
              element.css('z-index','1');
            },500);
          }
        }   
      };

      ThreeGridModel.prototype.runMobileAction=function(actionInfo,callback){
        $log.debug(this.mobileClients);
        //if(!this.mobileClients[actionInfo.mobileId]){
          //this.addMobileClient(actionInfo);
          //return
        //}
        if(this.mobileClients[actionInfo.mobileId] && this.objects[actionInfo.index]){
          if(!this.isMobileOverlap(actionInfo.mobileId,actionInfo.index)){
            this.objects[actionInfo.index].element.removeClass('flipped');
            var element=this.objects[actionInfo.index].element;
            $timeout(function(){
              element.css('z-index','1');
            },500);
          }
          var nextIndex=this.getNextTargetIndex(actionInfo);
          $log.info('next index is '+nextIndex);
          this.mobileClients[actionInfo.mobileId]=nextIndex;
          if(nextIndex !== -1){
            this.objects[nextIndex].element.css('z-index','10000');
            this.objects[nextIndex].element.addClass('flipped');
          }
          callback(nextIndex);
        }
        
      };

      ThreeGridModel.prototype.isMobileOverlap=function(mobileId,index){
        for(var id in this.mobileClients){
          if(id !== mobileId && this.mobileClients[id] === index){
            return true; 
          } 
        }
        return false;
      };

      ThreeGridModel.prototype.update=function(){
        TWEEN.removeAll();
        var objects=this.objects;
        var targets=this.targets[this.activeLayoutName];
        var self=this;

        objects.forEach(function(object,index){
          var target=targets[index]; 
          new TWEEN.Tween( object.position )
          .to( { x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * self.duration+self.duration )
          .easing( TWEEN.Easing.Exponential.InOut )
          .start();
        });

        new TWEEN.Tween({})
        .to( {}, self.duration*2 )
        .onUpdate( self.render.bind(this))
        .start();
      };

      ThreeGridModel.prototype.render=function(){
        this.renderer.render(this.scene,this.screenInfo);
      };

      ThreeGridModel.prototype.destroy=function(){
        this.element[0].removeChild(this.element[0].lastChild);
      };

      ThreeGridModel.prototype.updateColRow=function(){
        this.colCount=Math.floor(this.screenInfo.zone.width/(this.screenInfo.gridWidth+this.screenInfo.gridGap));
        this.screenInfo.gap=(this.screenInfo.zone.width-this.screenInfo.gridWidth*this.colCount)/this.colCount;
        this.rowCount=Math.ceil(this.visualData.length/this.colCount);
        this.screenInfo.zone.height=this.rowCount*this.screenInfo.gridHeight+(this.rowCount-1)*this.screenInfo.gap;
        $log.info(this.colCount,this.rowCount);
        $log.info(this.screenInfo);
      };

      ThreeGridModel.prototype.populateObjects=function(){
        var self=this;
        this.visualData.forEach(function(item){
          var element = angular.element( '<div></div>' );
          element.addClass('element');
          //element.css('width',self.screenInfo.gridWidth);
          //element.css('height',self.screenInfo.gridHeight);
          var front = angular.element( '<div></div>' );
          front.addClass('front');
          front.css('width',self.screenInfo.gridWidth+'px');
          front.css('height',self.screenInfo.gridHeight+'px');
          front.css('backgroundColor', 'rgba(255,255,255)');
          front.css('backgroundImage', 'url('+item.image+'?imageView2/2/w/120)');
          element.append( front );
          var back = angular.element( '<div></div>' );
          back.addClass('back');
          back.css('backgroundImage', 'url('+item.image+'?imageView2/2/w/600)');
          back.css('width',(5*self.screenInfo.gridWidth)+'px');
          back.css('height',(5*self.screenInfo.gridHeight)+'px');
          element.append( back );
          var object = new CSS3DObject(element);
          object.position.x = Math.random() * 4000 - 2000;
          object.position.y = Math.random() * 4000 - 2000;
          object.position.z = Math.random() * 4000 - 2000;
          self.scene.add(object);
          self.objects.push(object);
        });
      };

      ThreeGridModel.prototype.populateTargets=function(){

        this.targets.grid=[];
        this.targets.sphere=[];

        var self=this;
        var length=this.objects.length;
        var vector = new THREE.Vector3();

        this.objects.forEach(function(object,index){

          var j=Math.floor(index/self.colCount); 
          var i=index%self.colCount;

          //grid
          var gridTarget = new THREE.Object3D();
          gridTarget.position.x = (i+0.5)*self.screenInfo.gridWidth+self.screenInfo.gap*(i+0.5);
          gridTarget.position.y = (j+0.5)*self.screenInfo.gridHeight+self.screenInfo.gap*(j+0.5);
          gridTarget.position.z = 0;
          self.targets.grid.push(gridTarget);

          //sphere
          var phi = Math.acos(-length+(2*index)/length);
          var theta = Math.sqrt(length* Math.PI ) * phi;
          var sphereTarget = new THREE.Object3D();
          sphereTarget.position.x = 1600 * Math.cos( theta ) * Math.sin( phi );
          sphereTarget.position.y = 1600 * Math.sin( theta ) * Math.sin( phi );
          sphereTarget.position.z = 1600 * Math.cos( phi );
          vector.copy( sphereTarget.position ).multiplyScalar( 2 );
          sphereTarget.lookAt( vector );
          self.targets.sphere.push(sphereTarget );
        });
      };

      ThreeGridModel.prototype.getNextTargetIndex=function(actionInfo){
        if(actionInfo.mobileId && this.mobileClients[actionInfo.mobileId] && this.objects[actionInfo.index]){
          $log.info(actionInfo);
          var targets=this.targets[this.activeLayoutName];
          var currentTarget=targets[actionInfo.index]; 
          var dir=new THREE.Vector3(actionInfo.event.deltaX,actionInfo.event.deltaY,0);
          dir.normalize();
          dir.setLength(Math.sqrt(this.screenInfo.gridWidth*this.screenInfo.gridWidth+this.screenInfo.gridHeight+this.screenInfo.gridHeight)/2);
          var center=dir.add(currentTarget.position);
          var minIndex=-1;
          var minDist=Number.MAX_VALUE;
          for(var i in targets){
            if(i !== actionInfo.index){
              var distVec=new THREE.Vector3(); 
              distVec.subVectors(targets[i].position,center);
              var dist=distVec.length();
              if(minDist>dist){
                minDist=dist;  
                minIndex=i;
              }
            } 
          }
          return minIndex;
        }else{
          return -1; 
        }
      };

      ThreeGridModel.prototype.getCenterTargetIndex=function(){
        var x=this.screenInfo.screenPosition.x+this.screenInfo.screenWidth/2;
        var y=this.screenInfo.screenPosition.y+this.screenInfo.screenHeight/2;
        var center=new THREE.Vector3(x,y,0);
        var minIndex=0;
        var minDist=Number.MAX_VALUE;
        this.targets[this.activeLayoutName].forEach(function(target,index){
          var v=new THREE.Vector3();
          v.subVectors(target.position,center);
          if(v.length()<minDist){
            minDist=v.length(); 
            minIndex=index;
          }
        });
        return minIndex;
      };

      ThreeGridModel.prototype.animate=function() {
        this.animateId=requestAnimationFrame(this.animate.bind(this));
        TWEEN.update();
        this.render();
      };

      return ThreeGridModel;
    }
  ]);

}());
