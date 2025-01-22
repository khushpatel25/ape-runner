import EventEmitter from "./event-emitter";
import {
    Global
} from "./global";
import {
    setScaleFactor
} from "./scale_factor";

export class GameScene extends Phaser.GameObjects.Group {

    sceneSplits = [];
    unusedSplits = [];
    depthIndex = 0;
    constructor(game) {
        super(game);
    }

    setUp() {
        setScaleFactor.call(this, false);

        this.emitter = new EventEmitter.getObj();


    }
    init(sceneData) {
        this.depthIndex = 0;
        this.sceneSplits = [];
        this.unusedSplits = [];
        sceneData.forEach((data) => {
            this.addLayer(this.c_w * .5, data, true);
        });
    }
    update() {
        let splitsToRemove = [];
        this.sceneSplits.forEach((split) => {
            if (split.x + split.width * .5 * split.scaleX < (this.scene.cameras.main.scrollX * split.getData('scrollFact') + this.c_w + 200 * this.scaleFact) && !split.getData("nextAdded")) {
                split.setData("nextAdded", true);
                this.lastX = split.x + split.width * split.scaleX; //+(this.lakeIndex%2==1?-190/4:-0)*this.scaleFact;
                this.addLayer(this.lastX, split.getData('dataObj'));
            }
            if (split.x + split.width * .5 * split.scaleX + 50 * this.scaleFact < (this.scene.cameras.main.scrollX * split.getData('scrollFact') + 0 * this.scaleFact)) {
                splitsToRemove.push(split);
            }
        });
        splitsToRemove.forEach((split) => {
            this.sceneSplits.splice(this.sceneSplits.indexOf(split), 1);
            split.setVisible(false);
            split.setActive(false);

            this.unusedSplits.push(split);
        })
    }

    addLayer(xPos, data, adjustXPos = false) {
        let used = this.checkIfExistInUsed(data['key']);

        if (used) {
            this.layer = used;
            this.layer.setPosition(xPos, this.c_h - this.extraTop * (data['origin'].y == 0 ? -1 : 1) - data['y'] * this.c_h);
            this.layer.setVisible(true);
            this.layer.setActive(true);
            this.layer.setDepth(this.depthIndex + data['depth']);
        } else {
            this.layer = this.create(xPos, this.c_h - this.extraTop * (data['origin'].y == 0 ? -1 : 1) - data['y'] * this.c_h, data['key']);
            if (data['scaleWithWidth']) {
                this.layer.setScale(this.c_w * .0021); //scaleFact*data['scaleFact']*(Global.isMobile?0.4:1));
            } else {
                this.layer.setScale(this.scaleFact * data['scaleFact'] * (Global.isMobile ? 0.4 : 1));
            }
            if (adjustXPos) {
                let layerW = this.layer.width * this.layer.scaleX;
                if (layerW < this.c_w) {
                    this.layer.x -= Math.abs(this.c_w - this.layer.width * this.layer.scaleX)
                }

            }

            this.layer.setDepth(this.depthIndex + data['depth']); //this.depth+
            this.layer.setData('depthAssgined', this.depthIndex + data['depth']);
            this.layer.setOrigin(data['origin'].x, data['origin'].y);
            this.layer.setScrollFactor(data['scrollFactor'], 0);



            this.layer.setData('dataObj', data);
            this.layer.setData('scrollFact', data['scrollFactor']);
            this.layer.setData('keyUsed', data['key']);

            if (data['isAnimated']) {
                this.scene.anims.create({
                    key: data['animData']['key'],
                    frames: this.scene.anims.generateFrameNames(data['animData']['baseKey'], {
                        prefix: data['animData']['baseKey'],
                        start: data['animData']['start'],
                        end: data['animData']['end'],
                        zeroPad: data['animData']['padding']
                    }),
                    repeat: data['animData']['repeat'],
                    frameRate: data['animData']['fps']
                });
                this.layer.play(data['animData']);
            }
        }
        this.layer.setData("nextAdded", false);


        this.sceneSplits.push(this.layer);
    }
    changeDepthTo(depthIndex) {
        this.depthIndex = depthIndex;
    }
    getDepthAssigned() {
        return this.depthIndex;
    }
    getAllChilds() {
        return this.children.entries;
    }
    checkIfExistInUsed(keyToUse) {
        let itemToSend = null;
        this.unusedSplits.forEach((item, index) => {
            if (itemToSend == null && item.getData('keyUsed') === keyToUse) {
                itemToSend = item;
            }
        });
        // let itemToUse = null;
        if (itemToSend != null) {
            this.unusedSplits.splice(this.unusedSplits.indexOf(itemToSend), 1);
        }
        return itemToSend;
    }
}