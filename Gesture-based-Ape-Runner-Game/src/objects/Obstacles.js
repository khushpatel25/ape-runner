import {
    shuffle
} from "./array-util";
import EventEmitter from "./event-emitter";
import {
    Global
} from "./global";
import {
    setScaleFactor
} from "./scale_factor";

export class Obstacle extends Phaser.GameObjects.Sprite {
    gameFinished = false;
    sceneIndex = 0;
    canSlideBelow = false;
    framesAll = ['obstacles0000', 'obstacles0001', 'obstacles0002', 'obstacles0003']
    constructor(game, x, y, key, frame) {
        super(game, x, y, key, frame);

        this.scene.add.existing(this);

    }
    setUp() {
        setScaleFactor.call(this, false);

        this.emitter = new EventEmitter.getObj();
        this.emitter.on('scene:on_update_depth', this.addOrRemoveExtraDepth.bind(this));
        this.emitter.on('scene:change_scene', this.updateSceneIndex.bind(this));

        this.setScale(this.scaleFact * 5.5 * (Global.isMobile ? 0.35 : 1));
        this.setDepth(99);
        this.setOrigin(0.5, 1.0);
        this.setData('keyUsed', 'obstacle');
    }
    updateSceneIndex() {
        this.sceneIndex++;
    }
    init() {
        this.framesAll = shuffle(this.framesAll);
        if (this.framesAll[0] == 'obstacles0002' || this.framesAll[0] == 'obstacles0003') {
            this.y += 410 * this.scaleFact;
        }
        this.setFrame(this.framesAll[0]);
    }
    addOrRemoveExtraDepth(extraDepth) {
        this.setDepth(this.depth + extraDepth);
    }
    canSlideThrough() {
        return this.canSlideBelow;
    }

    idle() {

    }
    die() {
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
    update() {

    }
}