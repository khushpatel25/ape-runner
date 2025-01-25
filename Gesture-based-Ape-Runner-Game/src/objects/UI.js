import EventEmitter from "./event-emitter";
import axios from 'axios';
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
        let leaderY = !Global.isMobileOnly ? this.extraTop + 1100 * this.scaleFact : this.extraTop + 1100 * this.scaleFact;
        let leaderX = !Global.isMobileOnly ? this.extraLeftPer + 100 * this.scaleFact : this.c_w * .8;
        this.scorePanel = this.create(scoreX, scoreY, 'ui', 'score_holder0000');
        // new addition
        this.leaderPanel = this.create(leaderX, leaderY, 'ui', 'leaderboardBtn0000');
        this.leaderPanel.setOrigin(Global.isMobileOnly ? 0.5 : 0, 0);
        this.leaderPanel.setScale((this.c_w - this.extraLeftPer * 2) * .000363);
        this.leaderPanel.setDepth(1000);
        this.leaderPanel.setScrollFactor(0);
        this.leaderPanel.setInteractive();
        
         // Create the leaderboard popup
        this.createLeaderboardPopup();


        // Add event listener for click or tap
        this.leaderPanel.on('pointerdown', () => {
            console.log('Leaderboard button clicked!');
            this.showLeaderboardPopup();
        });

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


    async fetchLeaderboardData() {
        try {
            const response = await axios.get('http://localhost:5001/api/users/getUsers');
            console.log(response.data);
            const leaderData = response.data.map( user => ({
                userName: user.userName,
                points: user.points
            }));
            console.log(leaderData);
            return leaderData;
        } catch (error) {
            console.error('Error fetching leaderboard data:', error);
            return [];
        }
    }

   // Method to create the leaderboard panel (initially hidden)
async createLeaderboardPopup() {
    this.leaderboardPopup = this.create(this.c_w * 0.5, this.c_h * 0.5, 'ui', 'panel0000');
    this.leaderboardPopup.setScale(this.scaleFact * 4);
    this.leaderboardPopup.setDepth(2000);
    this.leaderboardPopup.setScrollFactor(0);
    this.leaderboardPopup.setVisible(false); // Initially hidden

    // Fetch leaderboard data from the backend API
    this.tempData = await this.fetchLeaderboardData();

    // Log the fetched data
    console.log('Fetched Leaderboard Data:', this.tempData);

    if (this.tempData && this.tempData.length > 0) {
        this.leaderboardData = this.tempData;
    } else {
        // Fallback sample data if fetch fails
        this.leaderboardData = [
            { userName: "Zombie", points: 1500 },
            { userName: "Sheriff", points: 1200 },
            { userName: "Chris", points: 1100 },
            { userName: "Justin", points: 900 },
            { userName: "Jimmy", points: 500 }
        ];
    }

    // Calculate top-right position relative to the leaderboard popup
    let popupWidth = this.leaderboardPopup.width * this.leaderboardPopup.scaleX;
    let popupHeight = this.leaderboardPopup.height * this.leaderboardPopup.scaleY;

    // Define the X positions for each column
    let rankColumnX = this.leaderboardPopup.x - popupWidth * 0.45;
    let nameColumnX = rankColumnX + 60; // Custom spacing for name column
    let scoreColumnX = nameColumnX + 230; // Custom spacing for score column


    // Position for the leaderboard text inside the popup (centered)
    let startX = this.leaderboardPopup.x - popupWidth * 0.4;
    let startY = this.leaderboardPopup.y - popupHeight * 0.3;
    let lineHeight = 50; // Spacing between each entry

    // Create leaderboard text elements dynamically
    this.leaderboardEntries = [];
    this.leaderboardData.forEach((entry, index) => {
        const rank = index + 1;
        let rankText = this.scene.add.text(
            rankColumnX, 
            startY + index * lineHeight, 
            `${rank}`, 
            {
                fontFamily: 'pixelmix',
                fontSize: '18px',
                color: '#ffdd16',
                stroke: '#000000',
                strokeThickness: 9
            }
        );
        rankText.setDepth(2002);
        rankText.setScrollFactor(0);
        rankText.setVisible(false); // Initially hidden

        let nameText = this.scene.add.text(
            nameColumnX, 
            startY + index * lineHeight, 
            `${entry.userName}`, 
            {
                fontFamily: 'pixelmix',
                fontSize: '18px',
                color: '#ffdd16',
                stroke: '#000000',
                strokeThickness: 9
            }
        );
        nameText.setDepth(2002);
        nameText.setScrollFactor(0);
        nameText.setVisible(false); // Initially hidden

        let scoreText = this.scene.add.text(
            scoreColumnX, 
            startY + index * lineHeight, 
            `${entry.points}`, 
            {
                fontFamily: 'pixelmix',
                fontSize: '18px',
                color: '#ffdd16',
                stroke: '#000000',
                strokeThickness: 9
            }
        );
        scoreText.setDepth(2002);
        scoreText.setScrollFactor(0);
        scoreText.setVisible(false); // Initially hidden
        // Add all text elements to the leaderboard entries array
        this.leaderboardEntries.push({ rankText, nameText, scoreText });
    });
    // this.leaderboardData.forEach((entry, index) => {
    //     let text = this.scene.add.text(
    //         startX,
    //         startY + index * lineHeight,
    //         `${entry.rank}. ${entry.name} - ${entry.score}`,
    //         {
    //             fontFamily: 'pixelmix',
    //             fontSize: '24px',
    //             color: '#ffdd16',
    //             stroke: '#000000',
    //             strokeThickness: 9
    //         }
    //     );
    //     text.setDepth(2002);
    //     text.setScrollFactor(0);
    //     text.setVisible(false); // Initially hidden
    //     this.leaderboardEntries.push(text);
    // });


    // Close button for leaderboard
    // this.closeBtn = this.create(this.c_w * 0.5, this.c_h * 0.65, 'ui', 'closeBtn0000');
    this.closeBtn = this.create(this.leaderboardPopup.x + popupWidth * 0.58,this.leaderboardPopup.y - popupHeight * 0.45,'ui','closeBtn0000');
    this.closeBtn.setScale(0.3);  // Increase size
    this.closeBtn.setDepth(2001);
    this.closeBtn.setScrollFactor(0);
    this.closeBtn.setInteractive();
    this.closeBtn.setVisible(false);
    this.closeBtn.on('pointerdown', () => {
        this.leaderboardPopup.setVisible(false); // Hide leaderboard on close button click
        this.closeBtn.setVisible(false);
         // Hide all leaderboard entries
        //  this.leaderboardEntries.forEach(entry => entry.setVisible(false));
        // Hide all leaderboard entries when the close button is clicked
        this.leaderboardEntries.forEach(entry => {
            entry.rankText.setVisible(false);
            entry.nameText.setVisible(false);
            entry.scoreText.setVisible(false);
        });
    });

    this.add(this.leaderboardPopup);
    this.add(this.closeBtn);
}

// Method to show the leaderboard
showLeaderboardPopup() {
    this.leaderboardPopup.setVisible(true);
    this.closeBtn.setVisible(true);
    // this.leaderboardEntries.forEach(entry => entry.setVisible(true)); // Show all entries
    this.leaderboardEntries.forEach(entry => {
        entry.rankText.setVisible(true);
        entry.nameText.setVisible(true);
        entry.scoreText.setVisible(true);
    }); // Show all entries
}
hideLeaderboardPopup() {
    if (this.leaderboardPopup) {
        this.leaderboardPopup.setVisible(false);
        // this.leaderboardEntries.forEach(entry => entry.setVisible(false)); // Hide all entries
        this.leaderboardEntries.forEach(entry => {
            entry.rankText.setVisible(false);
            entry.nameText.setVisible(false);
            entry.scoreText.setVisible(false); // Hide all entries
        });
    }
}

}