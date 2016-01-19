var mkConfig={
  socketServer:'ws://api.mksense.cn:40002/',
  peerServer:{
    host:'api.mksense.cn',
    port:40004
  },
  assetsUrl:'http://assets.mksense.cn/',
  cmsServer:'http://api.mksense.cn/',
  mobileUrl:'http://99.mksense.cn:30001/#/',
  screenshotServer:'http://182.92.231.31:8891/',
  gulp:{
    port:40000
  }
};

if(!module){
  var module={};
}
module.exports=mkConfig;
