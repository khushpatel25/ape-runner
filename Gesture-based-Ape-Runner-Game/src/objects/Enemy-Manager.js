import EventEmitter from "./event-emitter";
import { Global } from "./global";
import { setScaleFactor } from "./scale_factor";
import { shuffle } from './array-util';
import { Tiger } from "./Tiger";
import { Elephant } from "./Elephant";
import { Bird } from "./Bird";
import { Obstacle } from "./Obstacles";

export class EnemyManager extends Phaser.GameObjects.Group {
    enemyList = [];
    createdEnemies = [];
    healthUpdated = false;
    healthCooldown = false;
    lastCollisionTime = 0;

    constructor(game) {
        super(game);
    }

    setUp() {
        setScaleFactor.call(this, false);

        this.emitter = EventEmitter.getObj();
        this.emitter.on('enemy:add_next_enemy', this.addNextEnemy.bind(this));
        this.emitter.on('enemy:check_weapon_on_enemies', this.onAttackCheck.bind(this));
        this.emitter.on('character:check_player_on_enemies', this.onPlayerHitCheck.bind(this));
        this.emitter.on('enemy:add_to_created', this.addDeadEnemyToCreatedList.bind(this));

        this.enemies = ['bird', /* 'obstacle', */ 'elephant', 'tiger'];
    }

    init() {
        this.health = 100;
        this.healthUpdated = false;
        this.healthCooldown = false;
        this.lastCollisionTime = 0;
        this.emitter.emit('ui:health_updated', this.health); // Emit initial health
        console.log("EnemyManager initialized: Health reset to 100");
    }

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
        console.log(`Added enemy: ${this.enemies[0]}`);
    }

    onAttackCheck(x, y, w, h) {
        let weaponRect = new Phaser.Geom.Rectangle(x, y, w, h);
        this.checkCollision(weaponRect, "weapon", false);
    }

    onPlayerHitCheck(x, y, w, h, slideActive) {
        const currentTime = Date.now();
        if (currentTime - this.lastCollisionTime < 1000) {
            console.log("onPlayerHitCheck skipped due to debounce");
            return;
        }
        console.log(`onPlayerHitCheck called: x=${x}, y=${y}, w=${w}, h=${h}, slideActive=${slideActive}`);
        let playerRect = new Phaser.Geom.Rectangle(x, y, w, h);
        this.checkCollision(playerRect, "player", slideActive);
        this.lastCollisionTime = currentTime;
    }

    checkCollision(bound, boundType, slideActive) {
        this.enemyList.forEach((enemy) => {
            if (enemy.getData('attacked') || (enemy.x - (enemy.width * .5 * enemy.scaleX) > this.c_w + this.scene.cameras.main.scrollX)) {
                console.log(`Enemy skipped: attacked=${enemy.getData('attacked')}, position=${enemy.x}, cameraX=${this.scene.cameras.main.scrollX}, c_w=${this.c_w}`);
                return false;
            }

            let enemyBound = enemy.getBounds();
            console.log(`Enemy bounds: x=${enemyBound.x}, y=${enemyBound.y}, w=${enemyBound.width}, h=${enemyBound.height}`);
            console.log(`Player bounds: x=${bound.x}, y=${bound.y}, w=${bound.width}, h=${bound.height}`);

            if (Phaser.Geom.Intersects.RectangleToRectangle(enemyBound, bound)) {
                console.log(`Collision detected with ${enemy.getData('keyUsed')}`);
                this.handleCollision(enemy, boundType, slideActive);
            } else {
                console.log(`No collision with ${enemy.getData('keyUsed')}`);
                const dx = Math.abs(enemyBound.x - bound.x);
                const dy = Math.abs(enemyBound.y - bound.y);
                if (dx < 200 && dy < 200) {
                    console.log(`Forcing hit for debugging: ${enemy.getData('keyUsed')} is close enough`);
                    this.handleCollision(enemy, boundType, slideActive);
                }
            }
        });
    }

    handleCollision(enemy, boundType, slideActive) {
        if (boundType === "weapon") {
            console.log(`Weapon hit enemy: ${enemy.getData('keyUsed')}`);
            enemy.setData('attacked', true);
            enemy.die();
            this.addDeadEnemyToCreatedList(enemy); // Remove enemy when hit by weapon
        } else if (boundType === "player") {
            if (!(slideActive && enemy.canSlideThrough()) && !Global.shieldActive) {
                console.log(`Player hit ${enemy.getData('keyUsed')}! Health: ${this.health}, HealthUpdated: ${this.healthUpdated}, Cooldown: ${this.healthCooldown}`);

                if (!this.healthCooldown) {
                    if (this.health === 100 && !this.healthUpdated) {
                        this.health = 66;
                        this.emitter.emit('ui:health_updated', this.health);
                        this.emitter.emit('sheild:activate');
                        console.log("First hit: Health reduced to 66% from 100%");
                        this.healthUpdated = true;
                        this.healthCooldown = true;
                        // Do NOT remove enemy or mark as attacked - let it stay active
                        setTimeout(() => {
                            this.healthCooldown = false;
                            console.log("Health cooldown reset");
                            this.emitter.emit('sheild:deactivate');
                        }, 1000);  
                    } else if (this.health === 66) {
                        this.health = 33; // Second hit: 66% → 33%
                        this.emitter.emit('ui:health_updated', this.health);
                        this.emitter.emit('sheild:activate');
                        console.log("Second hit: Health reduced to 33% from 66%");
                        this.healthCooldown = true;
                        setTimeout(() => {
                            this.healthCooldown = false;
                            console.log("Health cooldown reset");
                            this.emitter.emit('sheild:deactivate');
                        }, 1000);
                    } else if (this.health === 33) {
                        this.health = 0; // Final hit: 33% -> 0%
                        console.log("Third hit: Health reduced to 0% from 50%");
                        this.emitter.emit('ui:health_updated', this.health);
                        this.emitter.emit('scene:on_die');
                        this.healthUpdated = false;
                        this.healthCooldown = true;
                        // Do NOT remove enemy or mark as attacked - let it stay active
                        setTimeout(() => {
                            this.healthCooldown = false;
                            console.log("Health cooldown reset");
                        }, 1000);
                    }
                } else {
                    console.log("Health update skipped due to cooldown");
                }
            } else {
                console.log("Collision ignored: Slide or shield active");
            }
        }
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
        console.log(`Enemy added to createdEnemies: ${enemy.getData('keyUsed')}`);
    }

    update(delta) {
        let enemiesToRemove = [];
        this.enemyList.forEach((enemy) => {
            if (enemy.getData('attacked')) {
                console.log(`Enemy ${enemy.getData('keyUsed')} skipped in update due to attacked state`);
                return false;
            }
            enemy.update(delta);
            if (enemy.x + enemy.width * .5 * enemy.scaleX - 0 * this.scaleFact < this.scene.cameras.main.scrollX) {
                enemiesToRemove.push(enemy);
            }
        });
        enemiesToRemove.forEach((enemy) => {
            this.enemyList.splice(this.enemyList.indexOf(enemy), 1);
            enemy.setVisible(false);
            enemy.setActive(false);
            enemy.idle();
            this.createdEnemies.push(enemy);
            console.log(`Enemy removed from scene: ${enemy.getData('keyUsed')}`);
        });
    }
}