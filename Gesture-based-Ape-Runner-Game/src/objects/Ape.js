import EventEmitter from "./event-emitter";
import {
    Global
} from "./global";
import {
    setScaleFactor
} from "./scale_factor";

export class Ape extends Phaser.Physics.Matter.Sprite {
    jumpActive = false;
    slideActive = false;
    attackActive = false;
    animKey = null;
    maxY = 0;
    gameFinished = false;
    transitionKey = null;
    sceneIndex = 1;
    attackAfterReset = false;
    enemyIndex = 0;
    enemyIndexSum = 0;
    scoreIncLimit = 0;
    delta = 1;
   

    constructor(world, x, y, key, frame) {

        super(world, x, y, key, frame);

        this.scene.add.existing(this);
    }
    setUp() {
        setScaleFactor.call(this, false);

        this.emitter = new EventEmitter.getObj();
        this.emitter.on('control:on_down', this.onAction.bind(this));
        this.emitter.on('control:disable_jump', this.disableJump.bind(this));
        this.emitter.on('game:start_game', this.startGame.bind(this));
        this.emitter.on('game:landed_on_terrain', this.resetAndRun.bind(this));
        this.emitter.on('game:hit_with_obstacle', this.blink.bind(this));
        this.emitter.on('weapon:attack_completed', this.resetAndRun.bind(this));
        this.emitter.on('weapon:set_attackA_after_reset', this.setAttackAfterReset.bind(this));
        this.emitter.on('scene:on_update_depth', this.addOrRemoveExtraDepth.bind(this));
        this.emitter.on('scene:on_die', this.die.bind(this));
        this.emitter.on('sheild:activate', this.updateShield.bind(this, true));
        this.emitter.on('sheild:deactivate', this.updateShield.bind(this, false));
        
        this.setScale(this.scaleFact * 8 * (Global.isMobile ? 0.35 : 1));
        this.setDepth(100);
        this.createBody(Global.isMobile ? 0.75 : .8);
        this.setOrigin(0.5, 0.6);

        this.scene.cameras.main.startFollow(this, true, 1, .001);

    }
    init() {
        Global.shieldActive=false;
        this.maxY = this.y;
        this.gameFinished = false;
  
        this.enemyIndexSum = 0;

        
       

        this.on('animationcomplete', (v) => {
            if (v.key == `slide` || v.key == `attack` || v.key == `attack_on_slide` || v.key == `attack_on_jump`) {
                if (v.key == 'slide' && this.attackActive && !this.attackAfterReset) return false;

                let testTime = 0;
                if (v.key == `slide`) {
                    testTime = 300;
                }
                setTimeout(() => {
                    this.resetAndRun();
                    if (this.attackAfterReset) {
                        this.attackAfterReset = false;

                    }
                    if (v.key === 'attack') {
                        this.emitter.emit('scene:clear_area');
                    }
                }, testTime);

            }
        });
        this.setFixedRotation(true);
        this.transitionKey = 'samurai';
        this.setNextEnemyOffset();

        // this.emitter.emit('character:update_camera_bound',this.x);
        this.showOrHide(false);
    }
    startGame() {
        this.showOrHide(true);
        this.resetAndRun();
    }
    showOrHide(status) {
        this.setVisible(status)
    }
    addOrRemoveExtraDepth(extraDepth) {
        this.setDepth(this.depth + extraDepth);
    }
    setAttackAfterReset() {
        this.attackAfterReset = true;
    }
    onAction(actionKey) {
        switch (actionKey) {
            case 38:
                this.jump();
                break;
            case 40:
                this.slide();
                break;
            case 32:
                this.attack();
                break;
        }
    }
    updateShield(shieldActive){
        Global.shieldActive=shieldActive;

        if(Global.shieldActive){
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
    slide() {
        if (this.jumpActive || this.slideActive) return false;
        this.slideActive = true;


        if (this.animKey !== 'slide') {

            this.play(`slide`);
            this.emitter.emit('character:on_slide', this.animKey == 'attack', this.anims.currentFrame.index);

            this.animKey = 'slide';

        }
    }
    setNextEnemyOffset() {
        this.nextEnemyOffset = Phaser.Math.Between(500, 1000)*2; //(750,1500);
        this.enemyIndexSum += this.nextEnemyOffset * (this.sceneIndex * .25 + 1);

    }
    attack() {

        if (this.attackActive) return false;
        if (Global.weaponKey == "hand" || (Global.weaponKey !== "hand" && Global.uiWeapons[Global.weaponKey]['count'] == 0)) return false;

        Global.uiWeapons[Global.weaponKey]['count'] > 0 && (Global.uiWeapons[Global.weaponKey]['count']--);
        // this.emitter.emit('ui:update_weapon_status');
        this.attackActive = true;
        this.emitter.emit('character:on_attack', this.animKey == 'jump' ? '_on_jump' : this.animKey == 'slide' ? '_on_slide' : '', this.animKey == 'run' ? 0 : this.anims.currentFrame.index);
        this.animKey = 'attack';
    }
    createBody(Fact) {
        this.setBody({
            type: 'rectangle',
            x: this.x,
            y: this.y,
            width: this.width * this.scaleX * .15,
            height: this.height * this.scaleY * .8 * Fact
        });
        this.setMass(1);
        this.setFixedRotation(true);
        this.setFriction(0);

    }
    update(delta) {

        this.delta = delta;


        if (!(this.gameFinished || !Global.gameStarted))
            this.x += (8 * 2 + this.sceneIndex * 1 * 1) * this.scaleFact * 10 * (Global.isMobile ? 0.3 : 1) * this.delta * 0.03;

        this.emitter.emit('character:on_update', this.x, this.y, this.sceneIndex);
        if (this.gameFinished || !Global.gameStarted) return false;
        let apeProgress = Math.floor(this.x / (10000 * (this.sceneIndex * .25 + 1)));

        let nextEnemyProgress = this.x;
        let scoreProgress = Math.floor(this.x / (750 * 2));

        if (scoreProgress > this.scoreIncLimit) {
            this.scoreIncLimit++;
            this.emitter.emit('ui:addScore');
        }
        if (nextEnemyProgress > this.enemyIndexSum) {

            this.emitter.emit('enemy:add_next_enemy');
            this.setNextEnemyOffset();
        }
        if (apeProgress > this.sceneIndex) {
            this.sceneIndex++;
            this.emitter.emit('scene:change_scene', this.x);
        }

        this.emitter.emit('character:update_camera_bound', this.x);


        this.emitter.emit('character:check_player_on_enemies', this.x - this.width * this.scaleX * .25, this.y - this.height * this.scaleY * .2, this.width * this.scaleX * .5, this.height * this.scaleY * .4, this.slideActive);
    }
    die() {
        this.gameFinished = true;
        this.anims.play({
            key: `die`,
            startFrame: 0
        }, true);
        this.emitter.emit('game:on_game_end');
    }
    jump() {
        if (this.gameFinished) return false;
        if (this.jumpActive) return false;


        this.emitter.emit('character:zoom_out');
        this.jumpActive = true;
        if (this.animKey !== 'jump' || window.isDoubleJump) {
            this.play(`jump`);
            this.emitter.emit('character:on_jump', this.animKey == 'attack', this.anims.currentFrame.index);
            this.animKey = 'jump';
        }
        this.applyForce(new Phaser.Math.Vector2(0, -.1 * (Global.isMobile ? 1.25 : 1) * 0.8)); //(-this.c_h)*.005*.14));//1*this.scaleFact));//this.c_w*.004
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
    disableJump() {}
    resetAndRun(alignWeaponMotion = false, type) {
        if (this.gameFinished || !Global.gameStarted) return false;


        if (this.y + 40 * this.scaleFact > this.maxY)
            this.emitter.emit('character:zoom_in');

        if (this.animKey !== 'run') {
            this.animKey = 'run';
            (!alignWeaponMotion) && (this.emitter.emit('character:on_run', this.anims.currentFrame ? this.anims.currentFrame.index : 0)); // && (!this.attackActive || this.slideActive)
            this.play(`run`);
        }
        if (alignWeaponMotion) {
            this.emitter.emit('character:align_weapon_with_body', this.anims.currentFrame.index);
        }



        this.jumpActive = false;
        this.slideActive = false;
        this.attackActive = false;

        if (window.isDoubleJump) {

            window.isDoubleJump = false;
            setTimeout(this.jump.bind(this), 100);
        }
    }
    onGameFinished() {
        this.gameFinished = true;
        this.stop();
    }
}