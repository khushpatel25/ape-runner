
import {setScaleFactor} from './scale_factor';


export class AppLoader extends Phaser.GameObjects.Group{
    constructor(scene){
        super(scene);


        this.loaderLogoAdded=false;
    }
    init(_url){
        setScaleFactor.call(this,false);


        document.body.style.backgroundColor = "#212121";
        this.loaderBG = this.scene.add.graphics();
        this.loaderBase = this.scene.add.graphics();
        this.loaderPath = this.scene.add.graphics();
        this.loaderCover =this.scene.add.graphics();

        this.loaderBase.fillStyle(0xFFFFFF, .2);
        this.loaderCover.fillStyle(0x76f9f8, 0);
        this.loaderPath.fillStyle(0x76f9f8, 1);
        this.loaderBG.fillStyle(0x76f9f8, 1);

        this.add(this.loaderBG);
        this.add(this.loaderBase);
        this.add(this.loaderPath);
        this.add(this.loaderCover);

        this.loaderPath.setPosition(this.scene.game.canvas.width*.5, this.scene.game.canvas.height*.5  + 50);
        this.loaderBase.setPosition(this.scene.game.canvas.width*.5, this.scene.game.canvas.height*.5  + 50);
        this.loaderCover.setPosition(this.scene.game.canvas.width*.5,this.scene.game.canvas.height*.5  + 50);

        this.loaderBase.fillCircle(0, 0, 30 *this.scaleFact);
        this.loaderCover.fillCircle(0, 0, 20 *this.scaleFact);
        this.loaderPath.fillStyle(0x212121,1);
       // this.loaderBG.fillRect(0, 0, this.scene.game.canvas.width, this.scene.game.canvas.height);

        this.loaderPath.fillCircle(0, 0, 30*this.scaleFact);//, Phaser.Math.DegToRad(90), Phaser.Math.DegToRad(-100), true);

        for (var i = 0; i <= 50; i++) {
            this.loaderPath.fillStyle(0xff0000, 1 - 1 * i / 100);
           this.loaderPath.beginPath();
           this.loaderPath.slice(0,0, 30*this.scaleFact, Phaser.Math.DegToRad(-100 - 7 * i), Phaser.Math.DegToRad(-100 -7* (i + 1)), true, true);
           this.loaderPath.fillPath();
        }
        this.rotateLoader();
    }
    rotateLoader() {

        this.scene.tweens.add({
            targets: this.loaderPath,
            angle:360,
            duration: 1100,
            ease: 'Linear',
            easeParams: [ 3.5 ],
            delay: 0,
            loop:-1,
            onComplete:this.rotateLoader.bind(this)
        });
    }
    loadLogo(_url) {
        this.scene.load.image("loader-logo", _url);
        this.scene.load.once('complete', this.checkLoaderLogoStat.bind(this, "loader-logo"));
        this.scene.load.start();
    };
   checkLoaderLogoStat(_key) {
        if (this.scene.textures.get(_key).key==_key&&!this.loaderLogoAdded) {
            this.loaderLogoAdded=true;
            this.addLoaderLogo(_key)
        }
    };
    addLoaderLogo(_key) {

        this.loaderLogo = this.scene.add.image(0, 0, _key);
        this.loaderLogo.x = this.scene.game.canvas.width*.5;
        this.loaderLogo.y = this.scene.game.canvas.height*.55 ;
        this.add(this.loaderLogo);
  

  
        setTimeout((function () {
           

            this.scene.tweens.add({
                targets: this.loaderLogo,
                y: this.loaderLogo.y - this.loaderLogo.height*.25,
                duration: 500,
                alpha:1,
                ease: 'Cubic.Out',
                easeParams: [ 3.5 ],
                delay: 0
            });

        }).bind(this), 0)

    };
    dispose() {
        if (this.rotateTween)
            this.rotateTween._destroy();
        if (this.loaderLogo)
            this.loaderLogo.mask = null;
        this.loaderGr&&this.loaderGr.destroy();

    }
}