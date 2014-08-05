$.fn.uSlider = function(options,items){
    //----------------Initializing Options--------------------//
    var defaults=options||{
        interaction:'click',
        dynamicLoad:false,
        loadSources:[]
    }
    //----------------Initializing Options--------------------//
    var $mainContainer = this;
    if(defaults.dynamicLoad){
        defaults.loadSources.forEach(function(url){
            var img=$('<img />').attr('src',url);
            $mainContainer.find('.content').append(img);
            var itemContainer=$mainContainer.find('.content');
            var ni = new Image();
            ni.onload = function(){
                var realWidth=ni.width;
                var realHeight=ni.height;
                var parentHeight=121;
                var imgWidth=realWidth*(parentHeight/realHeight);
                itemContainer.width(itemContainer.width()+imgWidth+6+'px');
            }
            ni.src = url;
        })
        init($mainContainer.find('.content img'))
    }else
        init();
    //Set the item container width equal to the sum of the widths and margins of its items

    /*SET WIDTH ITEM CONTAINER*/

    function init(items){
        $mainContainer.each(function(){
            var slider=this;
            var itemsToSlide = items || $(slider).find('.content').children("*:not(script)");
            var itemContainer = $(slider).find('.content');
            var $interval=null;
            var $goBackButton=$(this).find('.goBack');
            var $goForwardButton=$(this).find('.goForward');
            var leftPos=0;
            var firstItem=0;
            $goForwardButton.fadeOut(200).isHidden=true;

            /*===============Set width=========================*/
            //Here we set the width of the container of the gallery
            var generalMargin = parseFloat(itemsToSlide.css('margin-left'))+parseFloat(itemsToSlide.css('margin-right'))
            var totalWidth = 6*itemsToSlide.length;
            itemsToSlide.each(function(index,item){
                    totalWidth+=$(item).width()
                }
            );
            itemContainer.width(totalWidth+'px');

            /*=================================================*/

            if(defaults.interaction=='hover'){
                $goBackButton.fadeOut(0);
                $goForwardButton.fadeOut(0);
                $(slider).on('mouseover',function(event){
                    var $mousePosX=event.pageX - this.offsetLeft;
                    if($mousePosX<=$(this).width()/2){
                        clearInterval($interval);
                        var diffBetweenBoxes=itemContainer.width()-$(slider).width();
                        leftPos=parseInt(itemContainer.css('left'));
                        if(Math.abs(leftPos)<=diffBetweenBoxes)
                            $interval=setInterval(
                                function(){
                                    if(Math.abs(leftPos)<=diffBetweenBoxes){
                                        itemContainer.css({'left':(leftPos-20)+'px'})
                                    }
                                    leftPos=parseFloat(itemContainer.css('left'));
                                },75);
                    }
                    else{
                        clearInterval($interval);
                        leftPos=parseFloat(itemContainer.css('left'));
                        if(leftPos<=0)$interval=setInterval(
                            function(){
                                if(leftPos<=0){
                                    itemContainer.css({'left':(leftPos+20)+'px'})
                                }
                                leftPos=parseFloat(itemContainer.css('left'));
                            },75);
                    }
                }).on('mouseout',function(){
                        clearInterval($interval);
                    });
            }
            else{
                $goForwardButton.fadeOut(200).isHidden=true;

                $goForwardButton.on('click',function(){
                    event.preventDefault();
                    firstItem--;
                    itemContainer.css({'left':parseFloat(itemContainer.css('left'))+$(itemsToSlide[firstItem]).width()+6+'px'});

                    if(firstItem==0)$goForwardButton.fadeOut(200).isHidden=true;
                    if($goBackButton.isHidden)$goBackButton.fadeIn(600).isHidden=false;

                });
                $goBackButton.on('click',function(event){
                    event.preventDefault();
                    var totalItems=itemsToSlide.length-1;
                    itemContainer.css({'left':parseFloat(itemContainer.css('left'))-$(itemsToSlide[firstItem]).width()-6+'px'});
                    firstItem++;
                    if(firstItem==totalItems)$goBackButton.fadeOut(200).isHidden=true;
                    if($goForwardButton.isHidden)$goForwardButton.fadeIn(600).isHidden=false;
                });
                if(itemsToSlide.length<=1)
                    $goBackButton.fadeOut(200).isHidden=true;


            }
        })

    }
    /*SET WIDTH ITEM CONTAINER*/

    /*EVENT LISTENERS*/


    /*EVENT LISTENERS*/


};
$.fn.uSlider.add=function(item){
    this.setWidth(item);
};

$('.ujs-slider').uSlider({interaction:'hover'});

//================================================================================
//================================================================================
//================================================================================
//================================================================================
//================================================================================
//================================================================================
$.fn.orbitControl = function(options) {
            var defaultOptions={
                 itemSize:50,                //size in pixels of the items
                 animation:'fromOrigin',     //Type of animation=>fromOrigin(path like animation),dialer(simulates a dial)
                 duration:300,               //Time length of the animation in miliseconds
                 angleFrom:0,                //Starting angle to display items(degrees)
                 angleTo:90,                 //Finishing angle to display items(degrees)
                 distanceBetweenItems:50, //Distance between centers of the items
                 reverse:true,
                 minRadius:90
             };
            var state='hidden';
            var settings = options || defaultOptions;
            var items=$(this).children(':not(script)');
            var $parent=$(this);
            var startPoints=[];
            var endPoints=[];
            var angles=[];
            var startPoint=0;
            var finalPoint=0;
            var topStack=0,botStack=0;
            var direction=-1;//-1 hacia abajo y 1 hacia arriba
            var radius=calculateRadius();
            initialPosition();
            finalPosition();
            hideItems();
            if(settings.animation=='dial'){
                dialActive();
                activateDrag();
                showItems();
            }
            function animate(opts) { //Core de animación frame por frame para el dial(NO TOCAR)
              var start = new Date;  
              var id = setInterval(function() {
                var timePassed = new Date - start
                var progress = timePassed / opts.duration
                if (progress > 1) progress = 1
                var delta = opts.delta(progress)
                opts.step(delta)
                if (progress == 1) {
                    clearInterval(id)
                   
                }
              }, opts.delay || 10)
            }
            /**
            * Si se activa la animacion del dial, 
            **/
            function dialActive(){
                $parent.parent().find('.backBtn').click(function(){
                    var $items=$(items);
                    var itemNumber=5;
                    var availableArc=settings.angleTo-settings.angleFrom;
                    var degreesPadding=availableArc/itemNumber;       
                    var angle=(degreesPadding+degreesPadding/(itemNumber-1))*(Math.PI / 180);
                    $items.each(function(i,element){
                        if( !botStack==0  ){
                            
                            if(i>=botStack-1 && i<=botStack+4){
                                var useAngle=angle;
                                animate({
                                    delay: 10,
                                    duration: 200, // 1 sec by default 
                                    delta: function(p){return p },
                                    step: function(delta) {
                                        useAngle=angle
                                        var transitionAngle=angles[i]+useAngle*delta;
                                        angles[i]+=(delta==1)?useAngle:0;
                                        element.style.left = radius*Math.cos(transitionAngle) + "px";
                                        element.style.top = 250+radius*direction*Math.sin(transitionAngle) + "px";
                                    }
                                })
                            }
                            if(i+1==botStack+topStack+5 )
                            {
                                topStack++;
                                botStack--;
                            }
                        }
                    })
                    
                    
                })
                $parent.parent().find('.nextBtn').click(function(){
                    var $items=$(items);
                    var itemNumber=5;
                    var availableArc=settings.angleTo-settings.angleFrom;
                    var degreesPadding=availableArc/itemNumber;          
                    var angle=(degreesPadding+degreesPadding/(itemNumber-1))*(Math.PI / 180);
                    $items.each(function(i,element){
                        
                        if( !topStack==0  ){
                            
                            
                            if(i>=botStack && i<=botStack+5){
                                var useAngle=angle;
                                animate({
                                    delay: 10,
                                    duration: 200, // 1 sec by default 
                                    delta: function(p){return p },
                                    step: function(delta) {
                                        var transitionAngle=angles[i]-useAngle*delta;
                                        angles[i]-=(delta==1)?useAngle:0;
                                        element.style.left = radius*(Math.cos(transitionAngle)) + "px";
                                        element.style.top = 250+radius*(direction*Math.sin(transitionAngle)) + "px";
                                    }
                                })
                                
                                
                            }
                            if(i+1==botStack+topStack+5 )
                            {
                                topStack--;
                                botStack++;
                            }
                        }
                    })
                })
            }
            function calculateRadius(){
            //Se calcula basado en el principio de que los items deben estar separados del origen por un valor de radio igual y entre ellos estan separados
            // igualmente por la distancia entre items, luego tomando como referencia 2 items se forma un triangulo isoceles del que conocemos el angulo entre
            // sus lados iguales y el valor de la base
            // Solo es aplicar la formula para hallar uno de los catetos y asi encontrar el radio dado por=> radio=(base/2)/(seno(angulo/2))
                var itemNumber=(settings.animation=='dial')?5:items.length;
                var availableArc=Math.abs(settings.angleTo-settings.angleFrom);
                var degreesPadding=availableArc/itemNumber;
                var radius=((settings.itemSize+settings.distanceBetweenItems)/2)/(Math.sin(degreesPadding/2* Math.PI / 180));
                return settings.minRadius > radius ? settings.minRadius : radius;
            }
            function finalPosition(){
                switch(settings.animation){
                    case 'dial':
                        {
                            var itemNumber=items.length;
                            var availableArc=settings.angleTo-settings.angleFrom;
                            var degreesPadding=availableArc/5;
                            var angleStart=settings.angleFrom;            
                            var angle=degreesPadding+degreesPadding/4;
                            
                            for(var i=0;i<5;i++){
                                endPoints.push(
                                    {
                                        xFinal:startPoints[i].xInicial+radius*Math.cos(angleStart* Math.PI / 180),
                                        yFinal:250+startPoints[i].yInicial-radius*Math.sin(angleStart* Math.PI / 180)
                                    });
                                angles[i]=angleStart* Math.PI / 180;
                                angleStart+=angle;
                            }
                            for(var i=5;i<itemNumber;i++){
                                endPoints.push(
                                    {
                                        xFinal:radius*Math.cos(-angle* Math.PI / 180),
                                        yFinal:-radius*Math.sin(angle* Math.PI / 180)
                                    });
                                angles[i]=(angle+90)* Math.PI / 180;
                                topStack++;
                                
                            }
                            break;
                        }
                    case 'fromOrigin':
                        {
                            var itemNumber=items.length;
                            var availableArc=settings.angleTo-settings.angleFrom;
                            var degreesPadding=availableArc/itemNumber;
                            var angleStart=settings.angleFrom;            
                            var angle=degreesPadding+degreesPadding/(itemNumber-1);
                            for(var i=0;i<itemNumber;i++){
                                endPoints.push(
                                    {
                                        xFinal:startPoints[i].xInicial+radius*Math.cos(angleStart* Math.PI / 180),
                                        yFinal:startPoints[i].yInicial-radius*Math.sin(angleStart* Math.PI / 180)
                                    });
                                angles[i]=angleStart* Math.PI / 180;
                                angleStart+=angle;
                            }
                            break;
                        }
                }

            }
            function initialPosition(){
                var itemNumber=items.length;
                for(var i=0;i<itemNumber;i++){
                    item=items[i];
                    startPoints.push({
                        xInicial:0,
                        yInicial:250
                    });
                }
            }
            function showItems(){
                switch(settings.animation){
                    case 'fromOrigin':{
                        //TODO:animation code for path show like tweening
                    var $items=$(items);
                    var length=endPoints.length-1;
                    $items.each(
                            function(idx,item){
                                $(item).delay(idx*(settings.duration/2)).animate(
                                {

                                    left:endPoints[settings.reverse?length-idx:idx].xFinal+"px",
                                    top:endPoints[settings.reverse?length-idx:idx].yFinal+"px",
                                    myRotationProperty: 720
                                },
                                    {
                                        step: function(now, tween) {
                                            if (tween.prop === "myRotationProperty") {
                                                $(this).css('-webkit-transform','rotate('+now+'deg)');
                                                $(this).css('-moz-transform','rotate('+now+'deg)');
                                                // add Opera, MS etc. variants
                                                $(this).css('transform','rotate('+now+'deg)');
                                            }
                                        }
                                },
                                    settings.duration
                                )
                            });
                        state='showing';
                        break;
                    }
                    case 'dial':{
                        var $items=$(items);
                        var itemNumber=items.length;
                        $items.each(function(i,element){
                            if(i<5)
                                animate({
                                    delay: 10,
                                    duration: 100*(i+1), // 1 sec by default 
                                    delta: function(p){return p },
                                    step: function(delta) {
                                        element.style.left = radius*(Math.cos(angles[i]*delta)) + "px";
                                        element.style.top = 250 + radius*(direction*Math.sin(angles[i]*delta)) + "px";
                                    }
                                })
                            else
                                element.style.left = radius*(Math.cos(angles[i])) + "px";
                                element.style.top = radius*(direction*Math.sin(angles[i])) + "px";
                        })
                        
                        break;
                    }

                }
            }
            function hideItems(){
                switch(settings.animation){
                    case 'fromOrigin':{
                        //TODO:animation code for path  hide like tweening
                        var $items= !settings.reverse?
                            $($(items).get().reverse()) :
                            $(items);
                        $items.each(
                            function(idx,item){
                                $(item).delay(idx*settings.duration/2).animate({
                                        myRotationProperty: 0,
                                        left:startPoints[idx].xInicial+"px",
                                        top:startPoints[idx].yInicial+"px"
                                    },
                                    {
                                        step: function(now, tween) {
                                            if (tween.prop === "myRotationProperty") {
                                                $(this).css('-webkit-transform','rotate('+now+'deg)');
                                                $(this).css('-moz-transform','rotate('+now+'deg)');
                                                // add Opera, MS etc. variants
                                                $(this).css('transform','rotate('+now+'deg)');
                                            }
                                        }
                                    },settings.duration);

                            });

                        state='hidden';
                        break;
                    }
                    case 'dial':{
                        break;
                    }

                }
            }
            function clickListener(evt){
                evt.stopPropagation()
                if(settings.animation!='dial'){
                    evt.stopPropagation();
                    (state=='hidden')?showItems():hideItems();
                }

            }
            $parent.click(clickListener);
            function activateDrag(){
                var dragImgEl = document.createElement('span');
                dragImgEl.setAttribute('style',
                  'position: absolute; display: block; top: 0; left: 0; width: 0; height: 0;' );
                document.body.appendChild(dragImgEl);
                var h=window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
                $('#dialContainer').on('dragstart',function(ev){
                    startPoint=Math.atan2(h-ev.originalEvent.clientY,ev.originalEvent.clientX)
                    ev.originalEvent.dataTransfer.setDragImage(dragImgEl, -10, -10);
                }).on('drag',function(ev){
                    finalPoint=Math.atan2(h-ev.originalEvent.clientY,ev.originalEvent.clientX);
                }).on('dragend',function(ev){
                    finalPoint=Math.atan2(h-ev.originalEvent.clientY,ev.originalEvent.clientX);
                    var clickNumber=(finalPoint-startPoint)/0.31415926535897932384626433832795
                    for(var i=0;i<Math.abs(clickNumber);i++){
                        if (clickNumber>0)
                            setTimeout(function(){$('.backBtn').click()},200*i);
                        else
                            setTimeout(function(){$('.nextBtn').click()},200*i);

                    }
                })
            }

    };

$('#arc').orbitControl();
$.fn.zoomGallery = function(options) {
    var defaultOptions={
    };
    var settings=options||defaultOptions;
    var $parent=$(this);
    var items=$parent.children('img');
    var $toLeft=$('#zoomNext');
    var $toRight=$('#zoomBack');
    var $close=$('.close');
    function ZoomGallery($parent,items,settings,$toLeft,$toRight){
        this.$parent=$parent;
        this.items=items;
        this.settings=settings;
        this.actualImage=0;
        this.widths=[];
        var zoom=this;
        function css(){
            $parent.css({
                position:'absolute',
                top:'0px',
                left:'0px',
                right:'0px',
                bottom:'0px',
                background:'rgba(0,0,0,0.75)',
                'z-index':99999999
            });
            $close.css({
                position:'absolute',
                top:'10px',
                right:'10px',
                width:'2rem',
                height:'2rem',
                'border-radius':"50%",
                border:'2px solid #FFF',
                color:'#FFF',
                'font-size':'2rem',   
                'line-height': '26px',
                'text-align': 'center'
            });
            $(items).each(function(idx,item){
                var $item=$(item);
                $item.css({
                border:'8px solid #FFF',
                'max-height':"80%",
                'max-width':"80%",
                position:'absolute',
                height:'80%',
                top:'calc(10% - 8px)'
                
                });
                var width=$item.width();
                $item.css({left:'calc(50% - '+width/2+'px)'});
                zoom.widths.push(width);
                $(item).fadeIn();
            });
            $toLeft.css({
                left:'50px',
                position:'absolute',
                top:'calc(50% - 1.5rem)',
                color:'white',
                'font-size':'3rem',
                'font-family':'Oswald',
                'cursor':'pointer'
            });
            
            $toRight.css({
                right:'50px',
                position:'absolute',
                top:'calc(50% - 1.5rem)',
                color:'white',
                'font-size':'3rem',
                'font-family':'Oswald',
                'cursor':'pointer'
            })
        }
        function imageIn(){
            var item=$(items[zoom.actualImage]);
            item.animate({
                opacity:1
            });
        }
        function imageOut(){
            $(items[zoom.actualImage]).animate({
                opacity:0
            });
        }
        function changeImage(direction){
            var RIGHT=-1 ;
            var LEFT=1;
            if(direction==RIGHT)
                zoom.actualImage-=1;
            else if(direction==LEFT)
                zoom.actualImage+=1;   
        }
        $toLeft.click(function(){
            var LEFT=1;
            if(zoom.actualImage<zoom.items.length-1){
                imageOut();
                changeImage(LEFT);
                imageIn();
            }
        })
        $toRight.click(function(){
            var RIGHT=-1;
            if(zoom.actualImage>0){
                imageOut();
                changeImage(RIGHT);
                imageIn();
            }
        })
        css();
        imageIn();
        return this;
    }
        
    
    return new ZoomGallery($parent,items,settings,$toLeft,$toRight);

}
$('#zoomGallery').zoomGallery();
