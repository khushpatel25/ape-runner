import EventEmitter from "./event-emitter";
import {
    Global
} from "./global";
import {
    setScaleFactor
} from "./scale_factor";

export class CollisionArea extends Phaser.GameObjects.Graphics {
    lastY = 0;
    xToWidthDiff = 0;
    shouldSumCollisionArea = false;
    constructor(game) {
        super(game);

        this.scene.add.existing(this);
    }
    setUp() {
        setScaleFactor.call(this, false);

        this.setDepth(200);
        this.emitter = new EventEmitter.getObj();
        this.emitter.on('scene:update_area', this.updateArea.bind(this));
        this.emitter.on('scene:clear_area', this.clearArea.bind(this));
        this.emitter.on('scene:on_update_depth', this.addOrRemoveExtraDepth.bind(this));
        this.emitter.on('scene:update_collision_area_info', this.saveCollisionAreaState.bind(this));

        this.setScrollFactor(0, 0);
    }
    init() {
        this.lastY = 0;

    }
    saveCollisionAreaState(shouldSumCollisionArea) {
        this.shouldSumCollisionArea = shouldSumCollisionArea;
    }
    addOrRemoveExtraDepth(extraDepth) {
        this.setDepth(this.depth + extraDepth);
    }
    updateArea(x, y, w, h, jumpActive) {

        if (!this.shouldSumCollisionArea || jumpActive) {

            this.xToWidthDiff = 0;
        } else {
            this.xToWidthDiff = x;
        }
        this.lastY = y;

        let checkX = x - this.xToWidthDiff;
        let checkY = y;
        let checkW = w + this.xToWidthDiff;
        let checkH = h;
        this.emitter.emit('enemy:check_weapon_on_enemies', checkX + this.scene.cameras.main.scrollX, checkY, checkW, checkH);

    }
    clearArea() {
        this.clear();
    }

}