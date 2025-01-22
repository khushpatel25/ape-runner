let Global ={
    isMobile:false,

    highScore:0,
    gameKey:null,
    playCount:0,
    identifier:null,
    expMax:0,
    isPaused:false,
    isMobileOnly:false,
    userName:null,
    walletAddress:null,
    couponRedeemed:false,
    resizeVal:1,
    introShown:false,
    maxCouponVal:100,
    reachedCount:0,
    scoreTotal:0,
    uiWeapons:{
        'halberd':{'count':5,'maxCount':-1,'enabled':true},
        'hammer':{'count':5,'maxCount':-1,'enabled':true},
        'big_sword':{'count':5,'maxCount':-1,'enabled':true},
        'samurai':{'count':5,'maxCount':-1,'enabled':true},
        'mjhat':{'count':5,'maxCount':30,'enabled':true},
        'armShuriken':{'count':5,'maxCount':20,'enabled':true},
        'vibranium_shield':{'count':5,'maxCount':30,'enabled':true},
        'ak47':{'count':5,'maxCount':69,'enabled':true},
        'gun1':{'count':5,'maxCount':10,'enabled':true},
        'guitar':{'count':5,'maxCount':15,'enabled':true}
    },
    weaponKey:"hand",
    controlsEnabled:false,
    gameFinished:false,
    canStrech:false,
    gameActive:false,
    readyToPlay:false,
    waitingToPlay:false,
    waitingToPlayCb:null,
    viewMode:"portrait",
    musicEnabled:true,
    isWeaponRepeatAllowed:false,
    gameStarted:false,
    formActivated:false,
    emitterActive:false,
    onResize:function(){
        if(Global.viewMode=="landscape"&&window.innerWidth<window.innerHeight&&!Global.canStrech){
            Global.readyToPlay=false;
            document.getElementById("rotate").classList.add("active");
        }
        else if(Global.viewMode=="portrait"&&window.innerWidth>window.innerHeight&&!Global.canStrech){
            Global.readyToPlay=false;
            document.getElementById("rotate").classList.add("active");
        }
        else{
            Global.readyToPlay = true;
            document.getElementById("rotate").classList.remove("active");
            if(Global.waitingToPlay && Global.waitingToPlayCb){
                Global.waitingToPlay=false;
                Global.waitingToPlayCb();
            }
        }

    },
    isWeaponMovable:false,
  
}

export {
    Global
}