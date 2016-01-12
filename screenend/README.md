mksense
============

## Visual scene <--> viusal events list

##scope
```javascript
//schema
visualData={
    id:string,
    name:string,
    type:string,
    config:json,
    screenInfo:{
        zoneWidth:number,
        zoneHeight:number,
        x:number,
        y:number,
        width:number,
        height:number
    },
    artObjects:[artObject,artObject,...],
    createdOrganization: organization,
    createdUser: user,
    updatedUser: user,
}

syncData={
    label:string,    
    data:json
}

mobileInfo={
    mobileId:socketId,
    scene:string,
    organization:string,
    screenIndex:number,
    userInfo:json
}

mobileActionInfo={
    mobileId:socketId,
    data:json
}

mobileInResponse={
    mobileId:socketId,
    screenId:socketId,
    visualType:string,
    data:json
}

mobileActionResponse={
    mobileId:socketId,
    visualType:string,
    data:json
}

mobileComment={
    screenId:socketId,
    artObjectId:string,
    comment:{
        content:string,     
        x:number,
        y:number
    }
}


//watching events
scope.$on('visualData',function(event,visualData){});
scope.$on('syncData',function(event,syncData){});
scope.$on('fadeIn',function(event){});
scope.$on('fadeOut',function(event){});
scope.$on('destroy',function(event){});
scope.$on('mobileIn',function(event,mobileInfo){});
scope.$on('mobileOut',function(event,mobileInfo){});
scope.$on('mobileAction',function(event,mobileActionInfo){});
scope.$on('update',function(event,updateQuery){});
scope.$on('delete',function(event,deleteQuery){});
scope.$on('add',function(event,artObject){});

//responsing events
scope.$emit('delay',delayTime)
scope.$emit('fadeOutDone')
scope.$emit('mobileInResponse',mobileInResponse);
scope.$emit('mobileActionResponse',mobileActionResponse);
scope.$emit('comment',mobileComment);


```

## Development

To start developing in the project run:

```bash
gulp serve
```

Then head to `http://localhost:3000` in your browser.

The `serve` tasks starts a static file server, which serves the AngularJS application, and a watch task which watches all files for changes and lints, builds and injects them into the index.html accordingly.

## Tests

To run tests run:

```bash
gulp test
```

**Or** first inject all test files into `karma.conf.js` with:

```bash
gulp karma-conf
```

Then you're able to run Karma directly. Example:

```bash
karma start --single-run
```

## Production ready build - a.k.a. dist

To make the app ready for deploy to production run:

```bash
gulp dist
```

Now there's a `./dist` folder with all scripts and stylesheets concatenated and minified, also third party libraries installed with bower will be concatenated and minified into `vendors.min.js` and `vendors.min.css` respectively.
