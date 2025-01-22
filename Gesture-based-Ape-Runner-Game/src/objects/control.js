import {
    Global
} from './global';
import EventEmitter from "./event-emitter";


export default class GameControl extends Phaser.GameObjects.Group {
    gameFinished = false;
    gameActive = false;
    activeKeys = [];

    weaponTriggerIndex = -1;
    uiWeapons = {
        'halberd': 81,
        'hammer': 87,
        'big_sword': 69,
        'samurai': 82,
        'mjhat': 65,
        'armShuriken': 83,
        'vibranium_shield': 68,
        'ak47': 90,
        'gun1': 88,
        'guitar': 67
    }
    constructor(game) {
        super(game);
    }
    setUp() {
        this.emitter = new EventEmitter.getObj();
        this.emitter.on('game:on_game_end', this.onGameFinished.bind(this));
        this.emitter.on('game:game_activate', this.activate.bind(this));
        this.emitter.on('scene:on_die', this.die.bind(this));

        this.emitter.on('gesture:activate', this.onKeydown.bind(this));
        this.emitter.on('gesture:deactivate', this.onKeyUp.bind(this));

    }
    init() {
        this.gameFinished = false;
        this.gameActive = false;

        this.scene.input.keyboard.on('keydown', this.onKeydown.bind(this));
        this.scene.input.keyboard.on('keyup', this.onKeyUp.bind(this));
    }
    pauseGame(){
        setTimeout(() => {
             this.emitter.emit('game:paused');
            
        }, 250)
        
    }
 
    onKeydown(v) {
        if (v.keyCode == -1 || v.keyCode == 1) {
            this.triggerWeaponUpdate(v.keyCode);
            return false;
        }
        if (v.keyCode == 2) {
            this.emitter.emit('game:apply_weapon');
            return false;
        }
        if (v.keyCode == 3) {
            this.emitter.emit('game:drop_weapon');
            return false;
        }
        if (v.keyCode == 4) {
            this.pauseGame();
            return false;
        }

        if (this.gameFinished || !this.gameActive || !Global.gameStarted) return false;
        if (this.activeKeys.indexOf(v.keyCode) !== -1) return false;

        this.activeKeys.push(v.keyCode);
        this.emitter.emit("control:on_down", v.keyCode);
    }
    triggerWeaponUpdate(toUpdate) {
        this.weaponTriggerIndex += toUpdate
        if (this.weaponTriggerIndex >= 10) {
            this.weaponTriggerIndex = 0;
        }
        if (this.weaponTriggerIndex < 0) {
            this.weaponTriggerIndex = 9;
        }
        this.emitter.emit('game:update_weapon', Object.keys(this.uiWeapons)[this.weaponTriggerIndex]);
    }
    onKeyUp(v) {
        if (this.gameFinished || !this.gameActive || !Global.gameStarted) return false;
        Object.keys(this.uiWeapons).forEach((key) => {
            if (this.uiWeapons[key] === v.keyCode) {
                this.emitter.emit("game:update_weapon", key);
                this.emitter.emit("game:apply_weapon");

            }
        });

        if (this.activeKeys.indexOf(v.keyCode) !== -1) {
            this.activeKeys.splice(this.activeKeys.indexOf(v.keyCode), 1);
            if (v.keyCode == 38) {
                this.emitter.emit("control:disable_jump", {});
            }
        }
    }
    shutdown() {
        this.scene.input.off('pointerdown');
        this.scene.input.off('pointerup');
        this.scene.input.keyboard.off('keydown');
        this.scene.input.keyboard.off('keyup');

    }
    activate() {
        this.gameActive = true;
    }
    onGameFinished() {
        this.gameFinished = true;
    }
    die() {
        this.shutdown();
    }
}