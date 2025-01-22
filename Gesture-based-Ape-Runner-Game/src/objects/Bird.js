import EventEmitter from "./event-emitter";
import {
    Global
} from "./global";
import {
    setScaleFactor
} from "./scale_factor";

export class Bird extends Phaser.GameObjects.Sprite {
    gameFinished = false;
    sceneIndex = 0;
    canSlideBelowLeg = true;
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

        this.setScale(this.scaleFact * 7.5 * (Global.isMobile ? 0.35 : 1));
        this.setDepth(104);
        this.setOrigin(0.5, 1.0);
        this.setData('keyUsed', 'bird');

   
    }
    updateSceneIndex() {
        this.sceneIndex++;
    }
    init() {
        this.fly();
    }
    addOrRemoveExtraDepth(extraDepth) {
        this.setDepth(this.depth + extraDepth);
    }
    canSlideThrough() {
        return this.canSlideBelowLeg;
    }
    fly() {
        this.play('bird_fly');
        this.flyTwn = this.scene.tweens.add({
            targets: this,
            y: `+=${200*this.scaleFact}`,
            ease: 'Cubic.InOut', // 'Cubic', 'Elastic', 'Bounce', 'Back'
            duration: 200,
            yoyo: true,
            repeat: -1
        });
    }
    idle() {
        this.stop();
        this.flyTwn.stop();
    }

    die() {
        this.idle();
        this.flyTwn.stop();
        this.scene.tweens.add({
            targets: this,
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
        this.x -= (3 + this.sceneIndex * .75 * 2) * this.scaleFact * 10 * (Global.isMobile ? 0.25 : 1) * this.delta * 0.03;
    }
}