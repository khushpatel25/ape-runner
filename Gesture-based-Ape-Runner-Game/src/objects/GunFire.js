import EventEmitter from "./event-emitter";
import {
    Global
} from "./global";
import {
    setScaleFactor
} from "./scale_factor";

export class GunFire extends Phaser.GameObjects.Sprite {

    weaponKey = null;
    isJumping = false;
    firePos = {};
    
    constructor(game, x, y, key = 'gun1_fire', frame) {
        super(game, x, y, key, frame);

        this.scene.add.existing(this);

        this.animated=false;
    }
    setUp() {
        setScaleFactor.call(this, false);

        this.emitter = new EventEmitter.getObj();

        this.emitter.on('gun:fire', this.fire.bind(this));
        this.emitter.on('gun:change_fire', this.changeFireType.bind(this));
        this.emitter.on('gun:on_update', this.updateWithGun.bind(this));
        this.emitter.on('scene:on_update_depth', this.addOrRemoveExtraDepth.bind(this));
        this.emitter.on('scene:on_die', this.die.bind(this));
        // this.emitter.on('game:hit_with_obstacle',this.blink.bind(this));



        this.setScale(this.scaleFact * 4 * (Global.isMobile ? 0.35 : 1));
        this.setDepth(103);
        this.setOrigin(0, 0.5);

        this.firePos = {
            '00': {
                x: -5,
                y: -3
            },
            '01': {
                x: -2,
                y: -14
            },
            '02': {
                x: -2,
                y: -19
            },
            '03': {
                x: 0,
                y: -23
            },
            '04': {
                x: 3,
                y: -20
            },
            '05': {
                x: 3,
                y: -20
            },
            '06': {
                x: 3,
                y: -23
            },
            '07': {
                x: 5,
                y: -27
            },
            '08': {
                x: 5,
                y: -25
            },
            '09': {
                x: -4,
                y: -17
            },

            '10': {
                x: -10,
                y: -44
            },
            '11': {
                x: -20,
                y: -44
            },
            '12': {
                x: -27,
                y: -42
            },
            '13': {
                x: -30,
                y: -37
            },
            '14': {
                x: -38,
                y: -33
            },
            '15': {
                x: -45,
                y: -33
            },
            '16': {
                x: -35,
                y: -35
            },
            '17': {
                x: -27,
                y: -40
            },
            '18': {
                x: -20,
                y: -47
            },
            '19': {
                x: -20,
                y: -42
            },

            '20': {
                x: -2,
                y: -25
            },
            '21': {
                x: -10,
                y: -16
            },
            '22': {
                x: -9,
                y: -22
            },
            '23': {
                x: -7,
                y: -26
            },
            '24': {
                x: -12,
                y: -27
            },
            '25': {
                x: -12,
                y: 5
            },
            '26': {
                x: -12,
                y: 5
            },
            '27': {
                x: -12,
                y: 5
            },
            '28': {
                x: -12,
                y: 5
            },
            '29': {
                x: -12,
                y: 5
            },

            '30': {
                x: -2,
                y: -4
            },
            '31': {
                x: -2,
                y: -15
            },
            '32': {
                x: -2,
                y: -15
            },
            '33': {
                x: -2,
                y: -11
            },
            '34': {
                x: -2,
                y: -11
            },
            '35': {
                x: -2,
                y: -11
            },
            '36': {
                x: -2,
                y: -11
            },
            '37': {
                x: -2,
                y: -11
            },
            '38': {
                x: -2,
                y: -11
            },
            '39': {
                x: -2,
                y: -11
            },

            '40': {
                x: -5,
                y: -57
            },
            '41': {
                x: -5,
                y: -54
            },
            '42': {
                x: -5,
                y: -51
            },
            '43': {
                x: -1,
                y: -51
            },
            '44': {
                x: -1,
                y: -55
            },
            '45': {
                x: 1,
                y: -60
            },
            '46': {
                x: 0,
                y: -60
            },
            '47': {
                x: 2,
                y: -60
            },
            '48': {
                x: 0,
                y: -60
            },
            '49': {
                x: -3,
                y: -58
            },
            '50': {
                x: -2,
                y: -24
            },
            '51': {
                x: -5,
                y: -20
            },
            '52': {
                x: -5,
                y: -10
            },
            '53': {
                x: 0,
                y: -18
            },
            '54': {
                x: -8,
                y: 2
            },
            '55': {
                x: -10,
                y: 20
            },
            '56': {
                x: -10,
                y: 20
            },
            '57': {
                x: -8,
                y: 20
            },
            '58': {
                x: -12,
                y: 20
            },
            '59': {
                x: -12,
                y: 20
            }
        }

    }
    init(weaponKey) {

        this.weaponKey = weaponKey;

       
       

        this.on('animationcomplete', (v) => {

            if (v.key == `${this.weaponKey}_fire`) {
                this.hide();
                this.emitter.emit('weapon:attack_completed');
                this.emitter.emit('scene:clear_area');
            }
        });

        // this.play(`${this.apeWeaponKey}_fire`)
        this.hide();

    }
    updateWithGun(x, y, framename) {
        if (!this.visible) return false;

        let offsetIndex = framename; //.split('00')[1];
        let gunPositionX = x + (this.firePos[offsetIndex].x + (this.weaponKey == 'ak47' ? 100 : this.weaponKey == 'guitar' ? 20 : 0)) * this.scaleFact * 10 * (Global.isMobile ? .35 : 1);
        let gunPositionY = y + (this.firePos[offsetIndex].y + (this.weaponKey == 'ak47' ? 2 : this.weaponKey == 'guitar' ? 4 : 0)) * this.scaleFact * 10 * (Global.isMobile ? .35 : 1);

        let xPadd = this.frame.cutWidth / this.frame.realWidth;
        xPadd = xPadd * this.frame.width * this.scaleX + 300 * this.scaleFact;
        this.emitter.emit('scene:update_area', gunPositionX - this.scene.cameras.main.scrollX, gunPositionY - this.frame.cutHeight * this.scaleY * 0.1, this.frame.cutWidth, this.frame.cutHeight * this.scaleY * 0.2, false);
        this.setPosition(gunPositionX, gunPositionY);
    }
    addOrRemoveExtraDepth(extraDepth) {
        this.setDepth(this.depth + extraDepth);
    }
    fire() {
        this.setVisible(true);
        this.setActive(true);

        this.play(`${this.weaponKey}_fire`)
    }
    die() {
        this.gameFinished = true;
        this.stop();
        this.hide();
    }
    hide() {
        this.setVisible(false);
        this.setActive(false);
    }
    changeFireType(weaponKey) {
        this.weaponKey = weaponKey;
    }

    onAttack(attackMode) {
        if (attackMode['case'] != null) {
            this.play(`${this.weaponKey}_${attackMode['case']}`, true, attackMode['skipTo']);
        } else {
            this.play(`${this.weaponKey}_attack`);

        }

    };



    onGameFinished() {
        this.gameFinished = true;
        this.stop();
    }
}