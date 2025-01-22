import { Global } from "../objects/global";
import { setScaleFactor } from "../objects/scale_factor";



export default class Loader extends Phaser.Scene {
  constructor() {
    super({ key: 'Loader' })
  }

  init(){

   
    setScaleFactor.call(this,true);

    
    document.querySelector("#loader-sec").classList.add("active");

  }
  onProgress(v){


  }
  preload() {
    let version = '2.0.0';
    
    this.load.image(`floor`,`./assets/backgrounds/floor.png?v=${version}`);

    this.load.image(`snow_night_layer1`,`./assets/backgrounds/Snow_night/layer1.png?v=${version}`);
    this.load.image(`snow_night_layer2`,`./assets/backgrounds/Snow_night/layer2.png?v=${version}`);
    this.load.image(`snow_night_layer3`,`./assets/backgrounds/Snow_night/layer3.png?v=${version}`);
    this.load.image(`snow_night_layer4`,`./assets/backgrounds/Snow_night/layer4.png?v=${version}`);
    this.load.image(`snow_night_layer5`,`./assets/backgrounds/Snow_night/layer5.png?v=${version}`);
    this.load.image(`snow_night_layer6`,`./assets/backgrounds/Snow_night/layer6.png?v=${version}`);
    this.load.image(`snow_night_layer7`,`./assets/backgrounds/Snow_night/layer7.png?v=${version}`);
    this.load.image(`snow_night_layer8`,`./assets/backgrounds/Snow_night/layer8.png?v=${version}`);
    this.load.image(`snow_night_layer9`,`./assets/backgrounds/Snow_night/layer9.png?v=${version}`);
    this.load.image(`snow_night_layer10`,`./assets/backgrounds/Snow_night/layer10.png?v=${version}`);

    this.load.image(`forest_layer1`,`./assets/backgrounds/Forest/layer1.png?v=${version}`);
    this.load.image(`forest_layer2`,`./assets/backgrounds/Forest/layer2.png?v=${version}`);
    this.load.image(`forest_layer3`,`./assets/backgrounds/Forest/layer3.png?v=${version}`);
    this.load.image(`forest_layer4`,`./assets/backgrounds/Forest/layer4.png?v=${version}`);
    this.load.image(`forest_layer5`,`./assets/backgrounds/Forest/layer5.png?v=${version}`);

    this.load.image(`forest_night_layer1`,`./assets/backgrounds/Forest_night/layer1.png?v=${version}`);
    this.load.image(`forest_night_layer2`,`./assets/backgrounds/Forest_night/layer2.png?v=${version}`);
    this.load.image(`forest_night_layer3`,`./assets/backgrounds/Forest_night/layer3.png?v=${version}`);
    this.load.image(`forest_night_layer4`,`./assets/backgrounds/Forest_night/layer4.png?v=${version}`);
    this.load.image(`forest_night_layer5`,`./assets/backgrounds/Forest_night/layer5.png?v=${version}`);
    this.load.image(`forest_night_layer6`,`./assets/backgrounds/Forest_night/layer6.png?v=${version}`);

    this.load.image(`hills_night_layer1`,`./assets/backgrounds/Hills_night/layer1.png?v=${version}`);
    this.load.image(`hills_night_layer2`,`./assets/backgrounds/Hills_night/layer2.png?v=${version}`);
    this.load.image(`hills_night_layer3`,`./assets/backgrounds/Hills_night/layer3.png?v=${version}`);
    this.load.image(`hills_night_layer4`,`./assets/backgrounds/Hills_night/layer4.png?v=${version}`);
    this.load.image(`hills_night_layer5`,`./assets/backgrounds/Hills_night/layer5.png?v=${version}`);
    this.load.image(`hills_night_layer6`,`./assets/backgrounds/Hills_night/layer6.png?v=${version}`);


    this.load.image(`volcano_layer1`,`./assets/backgrounds/Volcano/layer1.png?v=${version}`);
    this.load.image(`volcano_layer2`,`./assets/backgrounds/Volcano/layer2.png?v=${version}`);
    this.load.image(`volcano_layer3`,`./assets/backgrounds/Volcano/layer3.png?v=${version}`);
    this.load.image(`volcano_layer4`,`./assets/backgrounds/Volcano/layer4.png?v=${version}`);
    this.load.image(`volcano_layer5`,`./assets/backgrounds/Volcano/layer5.png?v=${version}`);
    this.load.image(`volcano_layer6`,`./assets/backgrounds/Volcano/layer6.png?v=${version}`);
    this.load.image(`volcano_layer7`,`./assets/backgrounds/Volcano/layer7.png?v=${version}`);
    this.load.image(`volcano_layer8`,`./assets/backgrounds/Volcano/layer8.png?v=${version}`);

    this.load.image(`field_layer1`,`./assets/backgrounds/Field/layer1.png?v=${version}`);
    this.load.image(`field_layer2`,`./assets/backgrounds/Field/layer2.png?v=${version}`);
    this.load.image(`field_layer3`,`./assets/backgrounds/Field/layer3.png?v=${version}`);
    this.load.image(`field_layer4`,`./assets/backgrounds/Field/layer4.png?v=${version}`);
    this.load.image(`field_layer5`,`./assets/backgrounds/Field/layer5.png?v=${version}`);
    this.load.image(`field_layer6`,`./assets/backgrounds/Field/layer6.png?v=${version}`);

    this.load.atlas(`volcano_anim`, `./assets/backgrounds/volcano_anim.png?v=${version}`, `./assets/backgrounds/volcano_anim.json?v=${version}`);
    this.load.atlas(`ape`, `./assets/ape/ape_body.png?v=${version}`, `./assets/ape/ape_body.json?v=${version}`);
    this.load.atlas(`gun1`, `./assets/ape/gun1.png?v=${version}`, `./assets/ape/gun1.json?v=${version}`);
    this.load.atlas(`ak47`, `./assets/ape/ak47.png?v=${version}`, `./assets/ape/ak47.json?v=${version}`);
    this.load.atlas(`hammer`, `./assets/ape/hammer2.png?v=${version}`, `./assets/ape/hammer2.json?v=${version}`);
    this.load.atlas(`armShuriken`, `./assets/ape/armShuriken2.png?v=${version}`, `./assets/ape/armShuriken2.json?v=${version}`);
    this.load.atlas(`vibranium_shield`, `./assets/ape/vibranium_shield.png?v=${version}`, `./assets/ape/vibranium_shield.json?v=${version}`);
    this.load.atlas(`halberd`, `./assets/ape/halberd2.png?v=${version}`, `./assets/ape/halberd2.json?v=${version}`);
    this.load.atlas(`mjhat`, `./assets/ape/mjhat.png?v=${version}`, `./assets/ape/mjhat.json?v=${version}`);
    this.load.atlas(`samurai`, `./assets/ape/samurai2.png?v=${version}`, `./assets/ape/samurai2.json?v=${version}`);
    this.load.atlas(`big_sword`, `./assets/ape/big_sword.png?v=${version}`, `./assets/ape/big_sword.json?v=${version}`);
    this.load.atlas(`guitar`, `./assets/ape/guitar.png?v=${version}`, `./assets/ape/guitar.json?v=${version}`);
    this.load.atlas(`hand`, `./assets/ape/hand.png?v=${version}`, `./assets/ape/hand.json?v=${version}`);

    /*  UI */
    this.load.atlas(`ui`, `./assets/ui.png?v=${version}`, `./assets/ui.json?v=${version}`);


    /* Enemies */
    this.load.atlas(`obstacle`, `./assets/enemies/obstacles.png?v=${version}`, `./assets/enemies/obstacles.json?v=${version}`);
    this.load.atlas(`bird`, `./assets/enemies/bird.png?v=${version}`, `./assets/enemies/bird.json?v=${version}`);
    this.load.atlas(`tiger`, `./assets/enemies/tiger.png?v=${version}`, `./assets/enemies/tiger.json?v=${version}`);
    this.load.atlas(`elephant_back`, `./assets/enemies/elephant_back.png?v=${version}`, `./assets/enemies/elephant_back.json?v=${version}`);
    this.load.atlas(`elephant`, `./assets/enemies/elephant_front.png?v=${version}`, `./assets/enemies/elephant_front.json?v=${version}`);

    
    this.load.atlas(`gun1_fire`, `./assets/ape/gun1_fire.png?v=${version}`, `./assets/ape/gun1_fire.json?v=${version}`);
    this.load.atlas(`ak47_fire`, `./assets/ape/ak47_fire.png?v=${version}`, `./assets/ape/ak47_fire.json?v=${version}`);
    this.load.atlas(`guitar_fire`, `./assets/ape/guitar_fire.png?v=${version}`, `./assets/ape/guitar_fire.json?v=${version}`);

    this.load.atlas(`gestures`, `./assets/gestures.png?v=${version}`, `./assets/gestures.json?v=${version}`);


  }


  create() {

    Global.onResize();

    if(Global.readyToPlay){
      // document.querySelector("#loader-sec").classList.remove("active");
      this.scene.start("Game");

    }else{
      Global.waitingToPlay=true;
      Global.waitingToPlayCb = this.playGameOnReady.bind(this);
    }
  }
  playGameOnReady(){
    Global.waitingToPlayCb=null;
    Global.waitingToPlay=false;
    // document.querySelector("#loader-sec").classList.remove("active");
    this.scene.start("Game");
  }
}
