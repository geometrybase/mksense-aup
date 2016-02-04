window.onload=function(){
  var h = $(window).height();
  var w = $(window).width();


  //artobjects=artobjects.slice(0,20);
  var columnCount=8;
  for(var i=0; i<columnCount; i++){
    $("#main ul").append('<li class="swiper-container swiper-container'+i+'" style="width:'+Math.floor(1/columnCount*100)+'%;" ><div class="swiper-wrapper"></div></li')
  }
  $("#main").css({"width":w,"height":h});
  $("#main ul li").css({"height":h});
  var count=Math.floor(artobjects.length/columnCount)+1;
  for(var i=0; i<columnCount; i++){
    for(var j=i*count; j<artobjects.length; j++){
      var artobject=artobjects[j];
      $('.swiper-container'+i+' .swiper-wrapper').append('<div class="swiper-slide"><div style="background-image:url(\''+artobject.cover.url+'\')"><h1><img src="./images/qrcode.png"/><br/>'+artobject.title+'</h1></div></div>')
    } 
  }
  var swipers=[];
  for(var i=0; i<columnCount; i++){
    var autoplay=5000+Math.floor(Math.random()*30000);
    console.log(autoplay);
    swipers.push(new Swiper('.swiper-container'+i, {
      direction: 'vertical',
      autoplay:autoplay,
      speed:2000,
      fade: {
        crossFade: false
      },
      effect:'fade'
      //effect:'slide'
    }));	
  }
}

