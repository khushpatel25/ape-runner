import EventEmitter from "./event-emitter";
import {
    Global
} from "./global";
import {
    setScaleFactor
} from "./scale_factor";

export class Elephant extends Phaser.GameObjects.Sprite {
    gameFinished = false;
    sceneIndex = 0;
    canSlideThroughLeg = true;
    delta = 1;
    
    constructor(game, x, y, key, frame) {
        super(game, x, y, key, frame);

        this.scene.add.existing(this);

        this.animated=false;

    }
    setUp() {
        setScaleFactor.call(this, false);

        this.emitter = new EventEmitter.getObj();
        this.emitter.on('scene:on_update_depth', this.addOrRemoveExtraDepth.bind(this));
        this.emitter.on('scene:change_scene', this.updateSceneIndex.bind(this));

        this.setScale(this.scaleFact * 6 * (Global.isMobile ? 0.35 : 1));
        this.setDepth(104);
        this.setOrigin(0.5, 1.0);
        this.setData('keyUsed', 'elephant');

       
        
        this.backSide = this.scene.add.sprite(0, 0, 'elephant_back');
        this.backSide.setDepth(99);
        this.backSide.setOrigin(0.5, 1.0);
        this.backSide.setScale(this.scaleFact * 6 * (Global.isMobile ? 0.35 : 1));


    }
    updateSceneIndex() {
        this.sceneIndex++;
    }
    init() {
        this.run();
        this.backSide.setAlpha(1);
    }
    canSlideThrough() {
        return this.canSlideThroughLeg;
    }
    addOrRemoveExtraDepth(extraDepth) {
        this.setDepth(this.depth + extraDepth);
        this.backSide.setDepth(this.backSide.depth + extraDepth);
    }
    run() {
        this.play('elephant_run');
        this.backSide.play('elephant_run2');
    }
    idle() {
        this.stop();
    }
    die() {
        this.idle();
        this.scene.tweens.add({
            targets: [this, this.backSide],
            alpha: {
                from: 1,
                to: 0
            },
            ease: 'Linear', // 'Cubic', 'Elastic', 'Bounce', 'Back'
            duration: 200,
            yoyo: true,
            repeat: 2, // -1: infinity
            yoyo: false,
            onComplete: function () {
                this.emitter.emit('enemy:add_to_created', this);
            }.bind(this)
        });
    }
    update(delta) {
        if (this.gameFinished) return false;

        this.delta = delta;
        this.x -= (4 + this.sceneIndex * .75 * 2) * this.scaleFact * 10 * (Global.isMobile ? 0.25 : 1) * this.delta * 0.03;
        this.backSide.setPosition(this.x, this.y);
    }
}