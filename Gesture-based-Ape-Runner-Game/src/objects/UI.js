import EventEmitter from "./event-emitter";
import {
    Global
} from "./global";
import {
    setScaleFactor
} from "./scale_factor";
import InputText from 'phaser3-rex-plugins/plugins/inputtext.js';

export class UI extends Phaser.GameObjects.Group {

    gameFinished = false;
    activeWeapon = null;
    scoreMultiplier = 1;
    constructor(game) {
        super(game);
    }

    setUp() {
        setScaleFactor.call(this, false);

        this.emitter = new EventEmitter.getObj();
        this.emitter.on('ui:update_weapon_status', this.updateWeaponStatus.bind(this));
        this.emitter.on('ui:addScore', this.addScore.bind(this));
        this.emitter.on('scene:change_scene', this.updateMultiplier.bind(this));
        this.emitter.on('game:on_game_end', this.onGameFinished.bind(this));


        Object.keys(Global.uiWeapons).forEach((key, i) => {
            if (Global.uiWeapons[key]['enabled']) {
                this.activeWeapon = key;
            }
        });
        this.scoreMultiplier = 1;

    }
    init() {
        this.gameFinished = false;
        let scoreX = !Global.isMobileOnly ? this.extraLeftPer + 100 * this.scaleFact : this.c_w * .5;
        let scoreY = !Global.isMobileOnly ? this.extraTop + 80 * this.scaleFact : this.extraTop + 80 * this.scaleFact;
        this.scorePanel = this.create(scoreX, scoreY, 'ui', 'score_holder0000');

        this.scorePanel.setOrigin(Global.isMobileOnly ? 0.5 : 0, 0);
        this.scorePanel.setScale((this.c_w - this.extraLeftPer * 2) * .000363);
        this.scorePanel.setDepth(1000);
        this.scorePanel.setScrollFactor(0);
        let lastItem = null;
        Object.keys(Global.uiWeapons).forEach((key, i) => {
            let xPos = !Global.isMobileOnly ? this.scorePanel.x + this.scorePanel.width * this.scorePanel.scaleX + 900 * (this.c_w - this.extraLeftPer * 2) * .000363 * .18 * (i + .1) : (i % 2 == 0 ? 120 * this.scaleFact + this.extraLeftPer : lastItem.x + lastItem.width * lastItem.scaleX * 1.05);
            let yPos = !Global.isMobileOnly ? this.extraTop + 80 * this.scaleFact : (this.c_h * .45 + ((this.c_w - this.extraLeftPer * 2) * .07) * (Math.floor(i / 2) - 2));
            this[`weapon${key}_bg`] = this.create(xPos, yPos, 'ui', `weapon_bg_default0000`)
            this[`weapon${key}_bg`].setOrigin(0);
            this[`weapon${key}_bg`].setScale((this.c_w - this.extraLeftPer * 2) * .000363);
            this[`weapon${key}_bg`].setDepth(1000);
            this[`weapon${key}_bg`].setScrollFactor(0);
            this[`weapon${key}`] = this.create(xPos, yPos, 'ui', `${key}_${Global.isMobileOnly?'mobile':'desktop'}0000`)
            this[`weapon${key}`].setOrigin(0);
            this[`weapon${key}`].setScale((this.c_w - this.extraLeftPer * 2) * .000363);
            this[`weapon${key}`].setDepth(1000);
            this[`weapon${key}`].setScrollFactor(0);
            lastItem = this[`weapon${key}`];

            if (!Global.uiWeapons[key]['enabled']) {
                this[`weapon_count_overlay`] = this.create(xPos, yPos, 'ui', `weapon_bg_locked0000`)
                this[`weapon_count_overlay`].setOrigin(0);
                this[`weapon_count_overlay`].setScale((this.c_w - this.extraLeftPer * 2) * .000363);
                this[`weapon_count_overlay`].setDepth(1000);
                this[`weapon_count_overlay`].setScrollFactor(0);
                this[`weapon_count_overlay`].setAlpha(0.85);
            } else {
                if (Global.isMobileOnly) {
                    this[`weapon${key}`].setInteractive({
                        cursor: 'pointer'
                    }).on('pointerdown', function (key) {
                        if (this.gameFinished || !Global.gameStarted) return false;
                        this.emitter.emit("game:update_weapon", key);
                        this.emitter.emit("game:apply_weapon");
                    }.bind(this, key));
                }

            }


        });
        if (Global.isMobileOnly) {
            this.actionBtn = this.create(this.c_w - 80 * this.scaleFact - this.extraLeftPer, this.c_h * .51 + this.extraTop / 2, 'ui', 'attackBtn0000');
            this.actionBtn.setScale((this.c_w - this.extraLeftPer * 2) * .000363);
            this.actionBtn.setDepth(1000);
            this.actionBtn.setScrollFactor(0);
            this.actionBtn.setOrigin(1, 0.5);

            this.jumpBtn = this.create(this.c_w - 80 * this.scaleFact - this.extraLeftPer, this.c_h * .51 + this.extraTop / 2 - this.actionBtn.scaleX * this.actionBtn.height * 1.05, 'ui', 'jumpBtn0000');
            this.jumpBtn.setScale((this.c_w - this.extraLeftPer * 2) * .000363);
            this.jumpBtn.setDepth(1000);
            this.jumpBtn.setScrollFactor(0);
            this.jumpBtn.setOrigin(1, 0.5);

            this.slideBtn = this.create(this.c_w - 80 * this.scaleFact - this.extraLeftPer, this.c_h * .51 + this.extraTop / 2 + this.actionBtn.scaleX * this.actionBtn.height * 1.05, 'ui', 'slideBtn0000');
            this.slideBtn.setScale((this.c_w - this.extraLeftPer * 2) * .000363);
            this.slideBtn.setDepth(1000);
            this.slideBtn.setScrollFactor(0);
            this.slideBtn.setOrigin(1, 0.5);
            let btnTO = null;
            this.actionBtn.setInteractive().on('pointerdown', function () {
                if (this.gameFinished || !Global.gameStarted) return false;
                this.actionBtn.setAlpha(0.75);
                clearTimeout(btnTO);
                btnTO = setTimeout(function (btn) {
                    btn.setAlpha(1);
                }.bind(this, this.actionBtn), 200);
                this.emitter.emit("control:on_down", 32);
            }.bind(this));

            this.jumpBtn.setInteractive().on('pointerdown', function () {
                if (this.gameFinished || !Global.gameStarted) return false;
                this.jumpBtn.setAlpha(0.75);
                clearTimeout(btnTO);
                btnTO = setTimeout(function (btn) {
                    btn.setAlpha(1);
                }.bind(this, this.jumpBtn), 200);
                this.emitter.emit("control:on_down", 38);
            }.bind(this));

            this.slideBtn.setInteractive().on('pointerdown', function () {
                if (this.gameFinished || !Global.gameStarted) return false;
                this.slideBtn.setAlpha(0.75);
                clearTimeout(btnTO);
                btnTO = setTimeout(function (btn) {
                    btn.setAlpha(1);
                }.bind(this, this.slideBtn), 200);
                this.emitter.emit("control:on_down", 40);
            }.bind(this));


        }
        let countX = Global.isMobileOnly ? this.c_w - 80 * this.scaleFact - this.extraLeftPer : this.scorePanel.x + this.scorePanel.width * this.scorePanel.scaleX + 900 * (this.c_w - this.extraLeftPer * 2) * .000363 * .18 * (10 + .18)
        this[`weapon_count_bg`] = this.create(countX, this.extraTop + 80 * this.scaleFact, 'ui', `weapon_count_bg0000`)
        this[`weapon_count_bg`].setOrigin(Global.isMobileOnly ? 1 : 0, 0);
        this[`weapon_count_bg`].setScale((this.c_w - this.extraLeftPer * 2) * .000363);
        this[`weapon_count_bg`].setDepth(1000);
        this[`weapon_count_bg`].setScrollFactor(0);



        this[`weapon_count_txt`] = this.scene.add.text(this[`weapon_count_bg`].x + this[`weapon_count_bg`].width * .5 * (Global.isMobileOnly ? -1 : 1) * this[`weapon_count_bg`].scaleX, this.extraTop + 80 * this.scaleFact + this[`weapon_count_bg`].height * .5 * this[`weapon_count_bg`].scaleY, '00', {
            fontFamily: 'pixelmix',
            fontSize: `${(this.c_w-this.extraLeftPer*2)*.0183}px`,
            color: '#fedc16',
            stroke: '#000000',
            strokeThickness: 7
        });
        this[`weapon_count_txt`].setOrigin(0.5);
        this[`weapon_count_txt`].setDepth(1000);
        this[`weapon_count_txt`].setScrollFactor(0);
        this.scoreTxt = this.scene.add.text(this.scorePanel.x + this.scorePanel.width * .93 * (1 - this.scorePanel.originX) * this.scorePanel.scaleX, this.scorePanel.y + this.scorePanel.height * .3 * this.scorePanel.scaleY, '00', {
            fontFamily: 'pixelmix',
            fontSize: `${(this.c_w-this.extraLeftPer*2)*.015}px`,
            color: '#ffffff'
        });
        this.scoreTxt.setOrigin(1, 0.5);
        this.scoreTxt.setDepth(1000);
        this.scoreTxt.setScrollFactor(0);

        this.highscoreTxt = this.scene.add.text(this.scorePanel.x + this.scorePanel.width * .93 * (1 - this.scorePanel.originX) * this.scorePanel.scaleX, this.scorePanel.y + this.scorePanel.height * .72 * this.scorePanel.scaleY, '00', {
            fontFamily: 'pixelmix',
            fontSize: `${(this.c_w-this.extraLeftPer*2)*.015}px`,
            color: '#ffffff'
        });
        this.highscoreTxt.setOrigin(1, 0.5);
        this.highscoreTxt.setDepth(1000);
        this.highscoreTxt.setScrollFactor(0);


 

    }
    updateMultiplier() {
        if (this.scoreMultiplier >= 3) return false;
        this.scoreMultiplier += 0.25;
    }
    updateWeaponStatus(highlightBg = false) {
        Object.keys(Global.uiWeapons).forEach((key, i) => {
            if (key !== Global.weaponKey || !highlightBg) {
                this[`weapon${key}_bg`].setFrame(`weapon_bg_default0000`);
            } else {
                this[`weapon${key}_bg`].setFrame(`weapon_bg_active0000`);
            }
        });
        if (!highlightBg) return false;

        let count = Global.uiWeapons[Global.weaponKey]['count'];
        this[`weapon_count_txt`].setText(count >= 0 ? (`${count<10?"0":""}${count}`) : 'unlimited');
        if (count < 0) {
            this[`weapon_count_txt`].setFontSize(`${(this.c_w-this.extraLeftPer*2)*.0183*.6}px`);
        } else {
            this[`weapon_count_txt`].setFontSize(`${(this.c_w-this.extraLeftPer*2)*.0183}px`);
        }

        if (Global.uiWeapons[Global.weaponKey]['count'] == 0) {
            this[`weapon_count_overlay`] = this.create(this[`weapon${Global.weaponKey}_bg`].x, this[`weapon${Global.weaponKey}_bg`].y, 'ui', `weapon_bg_locked0000`)
            this[`weapon_count_overlay`].setOrigin(0);
            this[`weapon_count_overlay`].setScale((this.c_w - this.extraLeftPer * 2) * .000363);
            this[`weapon_count_overlay`].setDepth(1000);
            this[`weapon_count_overlay`].setScrollFactor(0);
            this[`weapon_count_overlay`].setAlpha(0.85);
            this[`weapon${Global.weaponKey}_bg`].setFrame(`weapon_bg_default0000`);
        }
    }
    addScore() {
        Global.scoreTotal += 5 * this.scoreMultiplier;
        this.scoreTxt.setText(Global.scoreTotal.toFixed(2));
    }
    onGameFinished() {
        this.gameFinished = true;
    }
}