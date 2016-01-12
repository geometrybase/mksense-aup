(function() {
  'use strict';
  angular.module('mksense.config',[])
  .constant('MKConfig',{
    cmsServer:'http://api.mksense.cn/',
    ws:'ws://99.mksense.cn:40002/'
  })
  .constant('AccessLevels', {
    anon: 0,
    user: 1,
    admin: 2
  });
}());
