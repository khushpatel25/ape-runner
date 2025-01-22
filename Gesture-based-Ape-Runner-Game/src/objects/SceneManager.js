import EventEmitter from "./event-emitter";
import {
    Global
} from "./global";
import {
    setScaleFactor
} from "./scale_factor";
import {
    GameScene
} from "./GameScene";
import {
    Sky
} from "./Sky";

export class SceneManager extends Phaser.GameObjects.Group {
    sceneConfig = {};
    currentSceneKey = null;
    sceneKeys = [];
    sceneIndex = 0;
    sceneObj = null;
    prevSceneObj = null;
    usedTerrains = [];
    sceneChangeTO = null;
    constructor(game) {
        super(game);
    }

    setUp() {
        setScaleFactor.call(this, false);

        this.emitter = new EventEmitter.getObj();
        this.emitter.on('scene:change_scene', this.createScene.bind(this))
        this.emitter.on('scene:on_die', this.die.bind(this));
    }
    init() {
        this.prevSceneObj = null;
        this.usedTerrains = [];
        this.sceneKeys = ['forest', 'field', 'volcano', 'snow_night', 'forest_night', 'hills_night'];
        this.sceneConfig = {
            "hills_night": [{
                    key: 'hills_night_layer1',
                    scrollFactor: 0.02,
                    y: 1,
                    origin: {
                        x: 0.5,
                        y: 0
                    },
                    scaleFact: 33,
                    depth: 2
                },
                {
                    key: 'hills_night_layer2',
                    scrollFactor: 0.4,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 3
                },
                {
                    key: 'hills_night_layer3',
                    scrollFactor: 0.6,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 4
                },
                {
                    key: 'hills_night_layer4',
                    scrollFactor: 0.8,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 5
                },
                {
                    key: 'hills_night_layer5',
                    scrollFactor: 1,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 105
                },
                {
                    key: 'hills_night_layer6',
                    scrollFactor: 1,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 105
                }

            ],
            "snow_night": [{
                    key: 'snow_night_layer1',
                    scrollFactor: 0,
                    y: 1,
                    origin: {
                        x: 0.5,
                        y: 0
                    },
                    scaleFact: 33,
                    depth: 2
                },
                {
                    key: 'snow_night_layer2',
                    scrollFactor: 0.05,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 3
                },
                {
                    key: 'snow_night_layer3',
                    scrollFactor: 0.2,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 4
                },
                {
                    key: 'snow_night_layer4',
                    scrollFactor: 0.3,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 5
                },
                {
                    key: 'snow_night_layer5',
                    scrollFactor: 0.4,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 6
                },
                {
                    key: 'snow_night_layer6',
                    scrollFactor: 0.6,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 7
                },
                {
                    key: 'snow_night_layer7',
                    scrollFactor: 0.8,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 8
                },
                {
                    key: 'snow_night_layer8',
                    scrollFactor: 0.8,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 9
                },
                {
                    key: 'snow_night_layer9',
                    scrollFactor: 1,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 10
                },
                {
                    key: 'snow_night_layer10',
                    scrollFactor: 1,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 105
                }
            ],
            "forest_night": [{
                    key: 'forest_night_layer1',
                    scrollFactor: 0.2,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 2
                },
                {
                    key: 'forest_night_layer2',
                    scrollFactor: 0.4,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 3
                },
                {
                    key: 'forest_night_layer3',
                    scrollFactor: 0.6,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 4
                },
                {
                    key: 'forest_night_layer4',
                    scrollFactor: 1,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 5
                },
                {
                    key: 'forest_night_layer5',
                    scrollFactor: 1,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 105
                },
                {
                    key: 'forest_night_layer6',
                    scrollFactor: 1,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 105
                }

            ],
            "forest": [{
                    key: 'forest_layer1',
                    scrollFactor: 0.2,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 2
                },
                {
                    key: 'forest_layer2',
                    scrollFactor: 0.4,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 3
                },
                {
                    key: 'forest_layer3',
                    scrollFactor: 0.6,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 4
                },
                {
                    key: 'forest_layer4',
                    scrollFactor: 1,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 5
                },
                {
                    key: 'forest_layer5',
                    scrollFactor: 1,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 105
                },
            ],
            "volcano": [{
                    key: 'volcano_anim',
                    scrollFactor: 0,
                    y: 1,
                    origin: {
                        x: 0.5,
                        y: 0
                    },
                    scaleFact: 33,
                    depth: 1,
                    isAnimated: true,
                    animData: {
                        key: 'volcano',
                        'baseKey': 'volcano_anim',
                        'prefix': 'volcano_anim',
                        'start': 0,
                        'end': 2,
                        'padding': 4,
                        'fps': 5,
                        'repeat': -1
                    },
                    scaleWithWidth: true
                },
                {
                    key: 'volcano_layer1',
                    scrollFactor: 0.2,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 2
                },
                {
                    key: 'volcano_layer2',
                    scrollFactor: 0.4,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 3
                },
                {
                    key: 'volcano_layer3',
                    scrollFactor: 0.6,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 4
                },
                {
                    key: 'volcano_layer4',
                    scrollFactor: 1,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 5
                },
                {
                    key: 'volcano_layer5',
                    scrollFactor: 1,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 6
                },
                {
                    key: 'volcano_layer6',
                    scrollFactor: 1,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 7
                },
                {
                    key: 'volcano_layer7',
                    scrollFactor: 1,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 8
                },
                {
                    key: 'volcano_layer8',
                    scrollFactor: 1,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 9
                }
            ],
            "city": [{
                    key: 'city_layer1',
                    scrollFactor: 0.2,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 2
                },
                {
                    key: 'city_layer2',
                    scrollFactor: 0.4,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 3
                },
                {
                    key: 'city_layer3',
                    scrollFactor: 0.6,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 4
                },
                {
                    key: 'city_layer4',
                    scrollFactor: 1,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 5
                },
                {
                    key: 'city_layer5',
                    scrollFactor: 1,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 6
                },
                {
                    key: 'city_layer6',
                    scrollFactor: 0.1,
                    y: .65,
                    origin: {
                        x: 0.5,
                        y: 0.5
                    },
                    scaleFact: 10,
                    depth: 1
                }
            ],
            "desert": [{
                    key: 'desert_layer1',
                    scrollFactor: 1,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 6
                },
                {
                    key: 'desert_layer2',
                    scrollFactor: 1,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 5
                },
                {
                    key: 'desert_layer3',
                    scrollFactor: 0.6,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 4
                },
                {
                    key: 'desert_layer4',
                    scrollFactor: 0.4,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 3
                },
                {
                    key: 'desert_layer5',
                    scrollFactor: 0.2,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 2
                },
                {
                    key: 'desert_layer6',
                    scrollFactor: 0.1,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 0.5
                    },
                    scaleFact: 10,
                    depth: 1
                }
            ],
            "field": [{
                    key: 'field_layer1',
                    scrollFactor: 1,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 6
                },
                {
                    key: 'field_layer2',
                    scrollFactor: 1,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 5
                },
                {
                    key: 'field_layer3',
                    scrollFactor: 0.6,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 4
                },
                {
                    key: 'field_layer4',
                    scrollFactor: 0.4,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 3
                },
                {
                    key: 'field_layer5',
                    scrollFactor: 0.2,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 2
                },
                {
                    key: 'field_layer6',
                    scrollFactor: 0.1,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 0.5
                    },
                    scaleFact: 10,
                    depth: 1
                }
            ],
            "city_night": [{
                    key: 'night_bg',
                    scrollFactor: 0,
                    y: 1,
                    origin: {
                        x: .5,
                        y: 0
                    },
                    scaleFact: 33,
                    depth: 1
                },
                {
                    key: 'city_night_layer1',
                    scrollFactor: 0.005,
                    y: 0.7,
                    origin: {
                        x: 0.5,
                        y: 0.5
                    },
                    scaleFact: 8,
                    depth: 2
                },
                {
                    key: 'city_night_layer2',
                    scrollFactor: 0.2,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 3
                },
                {
                    key: 'city_night_layer3',
                    scrollFactor: 0.3,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 4
                },
                {
                    key: 'city_night_layer4',
                    scrollFactor: .6,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 5
                },
                {
                    key: 'city_night_layer5',
                    scrollFactor: 1,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 6
                },
                {
                    key: 'city_night_layer6',
                    scrollFactor: 1,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 7
                }
            ],
            "desert_night": [{
                    key: 'night_bg',
                    scrollFactor: 0,
                    y: 1,
                    origin: {
                        x: .5,
                        y: 0
                    },
                    scaleFact: 33,
                    depth: 1
                },
                {
                    key: 'city_night_layer1',
                    scrollFactor: 0.005,
                    y: 0.7,
                    origin: {
                        x: 0.5,
                        y: 0.5
                    },
                    scaleFact: 8,
                    depth: 2
                },
                {
                    key: 'desert_night_layer4',
                    scrollFactor: 0.2,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 3
                },
                {
                    key: 'desert_night_layer3',
                    scrollFactor: 0.2,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 4
                },
                {
                    key: 'desert_night_layer2',
                    scrollFactor: 0.6,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 5
                },
                {
                    key: 'desert_night_layer1',
                    scrollFactor: 1,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 6
                }
            ],
            "field_night": [{
                    key: 'night_bg',
                    scrollFactor: 0,
                    y: 1,
                    origin: {
                        x: .5,
                        y: 0
                    },
                    scaleFact: 33,
                    depth: 1
                },
                {
                    key: 'field_night_layer1',
                    scrollFactor: 1,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 7
                },
                {
                    key: 'field_night_layer2',
                    scrollFactor: 1,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 6
                },
                {
                    key: 'field_night_layer3',
                    scrollFactor: 0.45,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 5
                },
                {
                    key: 'field_night_layer4',
                    scrollFactor: 0.35,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 4
                },
                {
                    key: 'field_night_layer5',
                    scrollFactor: 0.2,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 3
                },
                {
                    key: 'field_night_layer6',
                    scrollFactor: 0.03,
                    y: 0,
                    origin: {
                        x: 0.5,
                        y: 1
                    },
                    scaleFact: 33,
                    depth: 2
                }
            ]
        }
        this.createScene();
        this.update();
    }
    createScene() {

        this.currentSceneKey = this.sceneKeys[this.sceneIndex];
        if (this.sceneIndex > this.sceneKeys.length - 2) {
            this.sceneIndex = 0;
        } else {
            this.sceneIndex++;
        }
        if (this.sceneObj) {
            this.prevSceneObj = this.sceneObj;
            this.sceneObj.setDepth(110);
            this.sceneObj.changeDepthTo(110);
            this.sky.setDepth(111);
            this.sceneObj.children.entries.forEach((item) => {
                item.setDepth(this.sceneObj.getDepthAssigned() + item.getData('depthAssgined'));

            });
            this.sceneChangeTO = setTimeout(function (sceneObj) {
                sceneObj.clear(true, true);
                sceneObj.destroy(true, true);
                this.remove(sceneObj);
                sceneObj = null;
                this.prevSceneObj = null;
                this.emitter.emit('scene:on_update_depth', -110);
            }.bind(this, this.sceneObj), 1500);
            this.emitter.emit('scene:on_update_depth', 110);
        }

        let sceneData = this.sceneConfig[this.currentSceneKey];
        this.sceneObj = new GameScene(this.scene);
        this.sceneObj.setDepth(0);
        this.sceneObj.setUp();
        this.sceneObj.init(sceneData);

        this.add(this.sceneObj);
        this.sky = new Sky(this.scene);
        this.sceneObj.add(this.sky);
        this.sky.setUp();
        this.sky.init();

        this.emitter.emit('scene:change_sky', this.currentSceneKey)

    }
    die() {
        clearTimeout(this.sceneChangeTO);
    }
    update() {
        this.sceneObj.update();
        (this.prevSceneObj) && (this.prevSceneObj.update());
    }
}