import EventEmitter from "./event-emitter";
import {
    Global
} from "./global";
import {
    setScaleFactor
} from "./scale_factor";

export class Sky extends Phaser.GameObjects.Graphics {
    emitterActive = false;
    colorCodes = {};
    constructor(game) {
        super(game); //,w,h

        this.scene.add.existing(this);
    }
    setUp() {
        setScaleFactor.call(this, false);

        this.setDepth(0);
        this.setData('depthAssgined', 0)
        this.emitter = new EventEmitter.getObj();
        this.emitter.once('scene:change_sky', this.updateSky.bind(this))

        this.colorCodes = {
            "hills_night": 0x16233B,
            "forest_night": 0x0A091E,
            "snow_night": 0x1A3860,
            "forest": 0x44524B,
            "city": 0x9FCFCF,
            "desert": 0xC5E6E2,
            "field": 0xBCE3F1,
            "city_night": 0x1b3960,
            "desert_night": 0x1b3960,
            "field_night": 0x1b3960
        }
        this.setScrollFactor(0, 0);
    }
    init() {


    }
    updateSky(currentSceneKey) {

        this.clear();
        this.fillStyle(this.colorCodes[currentSceneKey], 1);
        this.fillRect(0, 0, this.c_w, this.c_h);
    }

}