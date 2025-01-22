import EventEmitter from "./event-emitter";
import {
    Global
} from "./global";
import {
    setScaleFactor
} from "./scale_factor";

export class WeaponHand extends Phaser.GameObjects.Sprite {
    animKey = null;
    weaponKey = null;
    isJumping = false;
    positionPadding = {};
    isAttackActive = false;
    gameFinished = false;
    keyIndex = -1;
    fireWeapons = [];
    constructor(game, x, y, key, frame = "fire1") {
        super(game, x, y, key, frame);

        this.scene.add.existing(this);

    }
    setUp() {
        this.animKey = null;
        this.weaponKey = null;
        this.isJumping = false;
        this.positionPadding = {};
        this.isAttackActive = false;
        this.gameFinished = false;
        this.keyIndex = -1;
        this.fireWeapons = [];

        setScaleFactor.call(this, false);

        this.emitter = new EventEmitter.getObj();

        this.emitter.on('game:on_game_end', this.onGameFinished.bind(this));
        this.emitter.on('character:on_update', this.updateWithBody.bind(this));
        this.emitter.on('character:on_run', this.onRun.bind(this));
        this.emitter.on('character:on_jump', this.onJump.bind(this));
        this.emitter.on('character:on_slide', this.onSlide.bind(this));
        this.emitter.on('character:on_attack', this.onAttack.bind(this));
        this.emitter.on('character:align_weapon_with_body', this.runTo.bind(this));
        this.emitter.on('game:apply_weapon', this.applyWeapon.bind(this));
        this.emitter.on('scene:on_update_depth', this.addOrRemoveExtraDepth.bind(this));
        this.emitter.on('scene:on_die', this.die.bind(this));
        this.emitter.on('game:update_weapon', this.updateWeapon.bind(this));
        this.emitter.on('game:drop_weapon', this.dropWeapon.bind(this));
        this.emitter.on('sheild:activate', this.updateShield.bind(this, true));
        this.emitter.on('sheild:deactivate', this.updateShield.bind(this, false));


        this.setScale(this.scaleFact * 8 * (Global.isMobile ? 0.35 : 1));
        this.setDepth(102);
        this.setOrigin(0.5, 0.6);

        this.positionPadding = {
            "hand": {
                x: -26,
                y: 13,
                isMovable: false,
                isWeaponRepeatAllowed: true,
                shouldCollisionAreaRemember: false
            },
            "big_sword": {
                x: -26,
                y: 0,
                isMovable: false,
                isWeaponRepeatAllowed: true,
                shouldCollisionAreaRemember: false
            },
            "gun1": {
                x: 300,
                y: 15,
                isMovable: false,
                isWeaponRepeatAllowed: false,
                shouldCollisionAreaRemember: false
            },
            "hammer": {
                x: -30,
                y: 0,
                isMovable: false,
                isWeaponRepeatAllowed: true,
                shouldCollisionAreaRemember: false
            },
            "armShuriken": {
                x: 600,
                y: 0,
                isMovable: true,
                isWeaponRepeatAllowed: false,
                shouldCollisionAreaRemember: true
            }, //225
            "vibranium_shield": {
                x: 227,
                y: 8,
                isMovable: true,
                isWeaponRepeatAllowed: false,
                shouldCollisionAreaRemember: true
            },
            "halberd": {
                x: -30,
                y: -5,
                isMovable: false,
                isWeaponRepeatAllowed: true,
                shouldCollisionAreaRemember: false
            },
            "mjhat": {
                x: 220,
                y: -2,
                isMovable: true,
                isWeaponRepeatAllowed: false,
                shouldCollisionAreaRemember: true
            },
            "samurai": {
                x: -30,
                y: 0,
                isMovable: false,
                isWeaponRepeatAllowed: true,
                shouldCollisionAreaRemember: false
            },
            "ak47": {
                x: -22,
                y: 10,
                isMovable: false,
                isWeaponRepeatAllowed: false,
                shouldCollisionAreaRemember: false
            },
            "guitar": {
                x: -20,
                y: 10,
                isMovable: false,
                isWeaponRepeatAllowed: false,
                shouldCollisionAreaRemember: false
            }
        };
        this.fireWeapons = ['gun1', 'ak47', 'guitar']

    }
    init() {

        this.weaponKey = "hand";
        this.maxY = this.y;
        this.gameFinished = false;
        this.slowFact = 1;
        let weaponKeys = Object.keys(this.positionPadding);

        if(Global.playCount === 1){
            weaponKeys.forEach((weaponKey) => {
                this.scene.anims.create({
                    key: `${weaponKey}_run`,
                    frames: this.scene.anims.generateFrameNames(`${weaponKey}`, {
                        prefix: `${weaponKey}`,
                        start: 0,
                        end: 7,
                        zeroPad: 4
                    }),
                    repeat: -1,
                    frameRate: 13 * this.slowFact
                });
                this.scene.anims.create({
                    key: `${weaponKey}_jump`,
                    frames: this.scene.anims.generateFrameNames(`${weaponKey}`, {
                        prefix: `${weaponKey}`,
                        start: 8,
                        end: 15,
                        zeroPad: 4
                    }),
                    repeat: 0,
                    frameRate: 16 * this.slowFact
                });
                this.scene.anims.create({
                    key: `${weaponKey}_jump2`,
                    frames: this.scene.anims.generateFrameNames(`${weaponKey}`, {
                        prefix: `${weaponKey}`,
                        start: 16,
                        end: 19,
                        zeroPad: 4
                    }),
                    repeat: 0,
                    frameRate: 35 * this.slowFact
                });
                this.scene.anims.create({
                    key: `${weaponKey}_slide`,
                    frames: this.scene.anims.generateFrameNames(`${weaponKey}`, {
                        prefix: `${weaponKey}`,
                        start: 22,
                        end: 29,
                        zeroPad: 4
                    }),
                    repeat: 0,
                    frameRate: 16 * this.slowFact
                });
                this.scene.anims.create({
                    key: `${weaponKey}_attack`,
                    frames: this.scene.anims.generateFrameNames(`${weaponKey}`, {
                        prefix: `${weaponKey}`,
                        start: 32,
                        end: 39,
                        zeroPad: 4
                    }),
                    repeat: 0,
                    frameRate: 16 * this.slowFact
                });
                this.scene.anims.create({
                    key: `${weaponKey}_attack_on_jump`,
                    frames: this.scene.anims.generateFrameNames(`${weaponKey}`, {
                        prefix: `${weaponKey}`,
                        start: 42,
                        end: 49,
                        zeroPad: 4
                    }),
                    repeat: 0,
                    frameRate: 16 * this.slowFact
                });
                this.scene.anims.create({
                    key: `${weaponKey}_attack_on_slide`,
                    frames: this.scene.anims.generateFrameNames(`${weaponKey}`, {
                        prefix: `${weaponKey}`,
                        start: 52,
                        end: 59,
                        zeroPad: 4
                    }),
                    repeat: 0,
                    frameRate: 16 * this.slowFact
                });
                this.scene.anims.create({
                    key: `${weaponKey}_die`,
                    frames: this.scene.anims.generateFrameNames(`${weaponKey}`, {
                        prefix: `${weaponKey}`,
                        start: 60,
                        end: 69,
                        zeroPad: 4
                    }),
                    repeat: 0,
                    frameRate: (weaponKey == "hand" ? 20 : 16) * this.slowFact
                });
    
    
    
            });
        }
      




        this.on('animationcomplete', (v) => {
            if (v.key.indexOf('_attack') !== -1) {
                this.stop();
                this.emitter.emit('weapon:attack_completed', true, 'attack');
                this.emitter.emit('scene:clear_area');
            }
        });

        this.keyIndex = -1;
        Object.keys(this.positionPadding).forEach((key, index) => {
            if (this.weaponKey == key) {
                this.keyIndex = index;
            }
        });


    }

    addOrRemoveExtraDepth(extraDepth) {
        this.setDepth(this.depth + extraDepth);
    }
    die() {
        this.gameFinished = true;
        this.stop();
        this.play({
            key: `${this.weaponKey}_die`,
            startFrame: 0
        }, true);
    }
    updateWeapon(weaponKey) {
        if (this.isAttackActive) return false;
        if (weaponKey !== "hand" && Global.uiWeapons[weaponKey]['count'] == 0) return false;

        this.weaponKey = weaponKey;
        Global.weaponKey = weaponKey;
        this.emitter.emit('ui:update_weapon_status', true);
        Global.isWeaponMovable = this.positionPadding[weaponKey]['isMovable'];
        Global.isWeaponRepeatAllowed = this.positionPadding[weaponKey]['isWeaponRepeatAllowed']
        let lastIndex = this.anims.currentFrame ? this.anims.currentFrame.index : 0;
        lastIndex = lastIndex > 0 ? lastIndex - 1 : lastIndex;

        if (this.weaponKey === 'ak47' || this.weaponKey === 'gun1' || this.weaponKey === 'guitar') {
            this.emitter.emit('gun:change_fire', this.weaponKey);
        }
        this.play({
            key: `${this.weaponKey}_${this.animKey}`,
            startFrame: lastIndex
        }, true);
    }
    applyWeapon() {
        if (this.isAttackActive) return false;

        if (this.weaponKey == null) return false;


        let paddX = this.frame.customData['spriteSourceSize'].x; //this.frame.customData&&this.frame.customData['spriteSourceSize'].x||0;
        paddX = paddX / this.frame.cutWidth * this.width * this.scaleX;
        this.emitter.emit("control:on_down", 32);

        this.emitter.emit('scene:update_collision_area_info', this.positionPadding[this.weaponKey]['shouldCollisionAreaRemember']);
    }
    dropWeapon() {
        this.weaponKey = "hand";
        Global.weaponKey = "hand";
        this.isAttackActive = false;

        let lastIndex = this.anims.currentFrame ? this.anims.currentFrame.index : 0;
        lastIndex = lastIndex > 0 ? lastIndex - 1 : lastIndex;

        this.play({
            key: `${this.weaponKey}_${this.animKey}`,
            startFrame: lastIndex
        }, true);
        this.emitter.emit('ui:update_weapon_status', false);

    }
    onRun(skipTo) {
        this.animKey = 'run';

        if (this.isAttackActive) {
            this.emitter.emit('scene:clear_area');

            if (Global.uiWeapons[this.weaponKey]['count'] <= 0) {
                this.weaponKey = "hand";
            }
        }
        this.isAttackActive = false;
        skipTo = skipTo > 7 ? 7 : skipTo;
        this.play({
            key: `${this.weaponKey}_run`,
            startFrame: skipTo
        }, true);
        this.isJumping = false;
    };
    runTo(skipTo) {
        this.animKey = 'run';
        if (this.isAttackActive) {

            if (Global.uiWeapons[this.weaponKey] && Global.uiWeapons[this.weaponKey]['count'] == 0) {
                this.weaponKey = "hand";
            }
        }
        this.isAttackActive = false;
        skipTo = skipTo > 7 ? 7 : skipTo;
        this.play({
            key: `${this.weaponKey}_run`,
            startFrame: skipTo
        }, true);
    }
    onJump(isAttackMode, attackIndex) {

        if (isAttackMode) {
            this.play({
                key: `${this.weaponKey}_attack_on_jump`,
                startFrame: attackIndex
            }, true);
        } else {
            this.play(`${this.weaponKey}_jump`);
        }
        this.animKey = 'jump';
        this.isJumping = true;
    };
    onSlide(isAttackMode, attackIndex) {

        if (isAttackMode) {
            this.play({
                key: `${this.weaponKey}_attack_on_slide`,
                startFrame: attackIndex
            }, true);
        } else {
            this.play(`${this.weaponKey}_slide`);
        }
        this.animKey = 'slide';

    };
    onAttack(attackMode, skipTo) {

        if (this.weaponKey == 'gun1' || this.weaponKey == 'ak47' || this.weaponKey == 'guitar') {
            this.emitter.emit('gun:fire');
        } else {

 
            if (skipTo >= 2) {
                this.play({
                    key: `${this.weaponKey}_attack${attackMode}`,
                    startFrame: (Global.isWeaponMovable && skipTo > 7) ? skipTo : 2
                }, true);
            } else {
                this.play({
                    key: `${this.weaponKey}_attack${attackMode}`,
                    startFrame: skipTo
                }, true);
            }
            


        }
        this.isAttackActive = true;
    };

    update() {


        if (this.gameFinished) return false;
        if (Object.keys(this.frame.customData).length == 0) return false;

        if (this.fireWeapons.indexOf(this.weaponKey) == -1 && this.isAttackActive) {
            let xPadd = this.frame.cutWidth / this.frame.realWidth;
            let yPadd = this.frame.cutHeight / this.frame.realHeight;
            xPadd = xPadd * this.frame.width * this.scaleX + 800 * this.scaleFact;

            if (this.weaponKey !== "hand")
                this.emitter.emit('scene:update_area', this.frame.x + xPadd + (this.animKey === 'slide' ? 200 * this.scaleFact : 0), this.y - this.frame.cutHeight * this.scaleY * 0.45 + (this.animKey === 'slide' ? 400 * this.scaleFact : this.animKey === 'jump' ? -300 * this.scaleFact : 0), (Global.isMobileOnly ? 1400 : 900) * this.scaleFact, this.frame.cutHeight * this.scaleY * 0.9, (this.animKey === 'jump')); //this.frame.cutWidth
        }



    }
    jump() {
        if (this.gameFinished) return false;
        if (this.jumpActive) return false;


    }
    blink() {
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            ease: 'Linear.Out',
            duration: 150,
            delay: 0,
            yoyo: true,
            repeat: 7
        });
        this.scene.cameras.main.shake(500, 0.01)
    }
    updateShield(shieldActive){

        if(shieldActive){
            this.shieldTwn && this.shieldTwn.remove();

            this.shieldTwn= this.scene.tweens.add({
                targets: this,
                alpha: 0,
                ease: 'Linear.Out',
                duration: 150,
                delay: 0,
                yoyo: true,
                repeat: -1
            });
        }else{
            this.shieldTwn && this.shieldTwn.remove();
            this.alpha=1
        }
    }
    updateWithBody(x, y) {


        this.setPosition(x + this.positionPadding[this.weaponKey].x * 10 * (Global.isMobile ? .35 : 1) * this.scaleFact, y + this.positionPadding[this.weaponKey].y * 10 * (Global.isMobile ? .35 : 1) * this.scaleFact);
        this.emitter.emit('gun:on_update', this.x - this.width * this.scaleX * .35, this.y, this.frame.name.split(`${this.weaponKey}00`)[1]);
    }


    onGameFinished() {
        this.gameFinished = true;
        this.stop();
    }
}