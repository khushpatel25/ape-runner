import EventEmitter from "./event-emitter";
import { Global } from "./global";
import { setScaleFactor } from "./scale_factor";
import { shuffle } from './array-util';

export class Floor extends Phaser.Physics.Matter.Sprite{
   
    constructor(world,x,y,key,frame){
        super(world,x,y,key,frame);

        this.scene.add.existing(this);
    }
    setUp(){
        setScaleFactor.call(this,false);

        this.emitter=new EventEmitter.getObj();
        this.emitter.on('character:update_camera_bound',this.updateFloorPos.bind(this));
 

        this.setScrollFactor(0,0);

    }
    updateFloorPos(xPos){
        this.x = xPos+600*this.scaleFact*6;
    }
    init(gameActive){
        this.setScale(this.scaleFact*14*(Global.isMobile?0.5:1));
        this.setStatic(true);
     

    }
   
}