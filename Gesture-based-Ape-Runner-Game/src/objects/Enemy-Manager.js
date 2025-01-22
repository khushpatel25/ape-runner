import EventEmitter from "./event-emitter";
import {
    Global
} from "./global";
import {
    setScaleFactor
} from "./scale_factor";
import {
    shuffle
} from './array-util';
import {
    Tiger
} from "./Tiger";
import {
    Elephant
} from "./Elephant";
import {
    Bird
} from "./Bird";
import {
    Obstacle
} from "./Obstacles";

export class EnemyManager extends Phaser.GameObjects.Group {
    enemyList = [];
    createdEnemies = [];
    constructor(game) {
        super(game);
    }

    setUp() {
        setScaleFactor.call(this, false);

        this.emitter = new EventEmitter.getObj();
        this.emitter.on('enemy:add_next_enemy', this.addNextEnemy.bind(this));
        this.emitter.on('enemy:check_weapon_on_enemies', this.onAttackCheck.bind(this));
        this.emitter.on('character:check_player_on_enemies', this.onPlayerHitCheck.bind(this));
        this.emitter.on('enemy:add_to_created', this.addDeadEnemyToCreatedList.bind(this));

        this.enemies = ['bird', /* 'obstacle', */ 'elephant', 'tiger'];

    }
    init() {}
    addNextEnemy() {

        this.enemies = shuffle(this.enemies);
        let used = this.checkIfExistInCreated(this.enemies[0]);

        switch (this.enemies[0]) {
            case "tiger":
                this.enemy = used ? used : new Tiger(this.scene, 0, 0, 'tiger');
                this.enemy.setPosition(this.scene.cameras.main.scrollX + this.c_w + 1500 * this.scaleFact, this.c_h - this.extraTop - 200 * this.scaleFact);
                break;
            case "elephant":
                this.enemy = used ? used : new Elephant(this.scene, 0, 0, 'elephant');
                this.enemy.setPosition(this.scene.cameras.main.scrollX + this.c_w + 1500 * this.scaleFact, this.c_h - this.extraTop - 200 * this.scaleFact);
                break;
            case "bird":
                this.enemy = used ? used : new Bird(this.scene, 0, 0, 'bird');
                this.enemy.setPosition(this.scene.cameras.main.scrollX + this.c_w + 1500 * this.scaleFact, this.c_h - this.extraTop - 1400 * this.scaleFact);
                break;
            case "obstacle":
                this.enemy = used ? used : new Obstacle(this.scene, 0, 0, 'obstacle');
                this.enemy.setPosition(this.scene.cameras.main.scrollX + this.c_w + 1500 * this.scaleFact, this.c_h - this.extraTop - 400 * this.scaleFact);
                break;
        }

        this.add(this.enemy);
        this.enemyList.push(this.enemy);

        if (used) {

            this.enemy.setAlpha(1);
            this.enemy.setVisible(true);
            this.enemy.setActive(true);
            this.enemy.init();
        } else {
            this.enemy.setUp();
            this.enemy.init();
        }

        this.enemy.setData('attacked', false);


    }
    onAttackCheck(x, y, w, h) {
        let weaponRect = new Phaser.Geom.Rectangle(x, y, w, h);
        this.checkCollision(weaponRect, "weapon", false);
    }
    onPlayerHitCheck(x, y, w, h, slideActive) {
        let playerRect = new Phaser.Geom.Rectangle(x, y, w, h);
        this.checkCollision(playerRect, "player", slideActive);
    }
    checkCollision(bound, boundType, slideActive) {
        this.enemyList.forEach((enemy) => {
            if (enemy.getData('attacked') || (enemy.x - (enemy.width * .5 * enemy.scaleX) > this.c_w + this.scene.cameras.main.scrollX)) return false;
            let enemyBound = enemy.getBounds();

            if (enemy.getData('keyUsed') == 'obstacle') {
                enemyBound.x += enemy.width * .48 * enemy.scaleX;
                enemyBound.width -= enemy.width * .96 * enemy.scaleX;
                bound.x += bound.width * .25;
                bound.width -= bound.width * .5;
            } else {
                enemyBound.x += enemy.width * .25 * enemy.scaleX;
                enemyBound.width -= enemy.width * .6 * enemy.scaleX;
            }
            enemyBound.y += enemy.height * .25 * enemy.scaleY;
            enemyBound.height -= enemy.height * .25 * enemy.scaleY;

            if (Phaser.Geom.Intersects.RectangleToRectangle(enemyBound, bound)) {
                if (boundType === "weapon") {
                    enemy.setData('attacked', true);
                    enemy.die();
                } else if (boundType === "player") {
                    if (!(slideActive && enemy.canSlideThrough()) && !Global.shieldActive) {
                        this.emitter.emit('scene:on_die');
                    }

                    /*  enemy.setData('attacked',true);
                     enemy.die(); */
                }

            }
        });
    }
    checkIfExistInCreated(keyToUse) {
        let itemToSend = null;
        this.createdEnemies.forEach((item, index) => {
            if (itemToSend == null && item.getData('keyUsed') === keyToUse) {
                itemToSend = item;
            }
        });
        if (itemToSend != null) {
            this.createdEnemies.splice(this.createdEnemies.indexOf(itemToSend), 1);
        }
        return itemToSend;
    }
    addDeadEnemyToCreatedList(enemy) {

        this.enemyList.splice(this.enemyList.indexOf(enemy), 1);
        enemy.setVisible(false);
        enemy.setActive(false);
        this.createdEnemies.push(enemy);
    }
    update(delta) {
        let enemiesToRemove = [];
        this.enemyList.forEach((enemy) => {
            if (enemy.getData('attacked')) return false;
            enemy.update(delta);
            if (enemy.x + enemy.width * .5 * enemy.scaleX - 0 * this.scaleFact < (this.scene.cameras.main.scrollX)) {
                enemiesToRemove.push(enemy);
            }
        });
        enemiesToRemove.forEach((enemy) => {
            this.enemyList.splice(this.enemyList.indexOf(enemy), 1);
            enemy.setVisible(false);
            enemy.setActive(false);
            enemy.idle();
            this.createdEnemies.push(enemy);
        })
    }
}