import EventEmitter from "../objects/event-emitter";
import { Global } from "../objects/global";
import axios from 'axios';  // Import axios
import {
    setScaleFactor
} from "../objects/scale_factor";

export default class LeaderBoardUI extends Phaser.Scene {
    constructor() {
        super({ 
            key: 'LeaderBoardUI'
        
        }); // Register this as a new scene
    }

    init() {
        // this.leaderPanel = this.add.image(Global.leaderX, Global.leaderY, 'ui', 'leaderboardBtn0000');
        // this.leaderPanel.setOrigin(Global.isMobileOnly ? 0.5 : 0, 0);
        // this.leaderPanel.setScale((this.c_w - this.extraLeftPer * 2) * .000363);
        // this.leaderPanel.setDepth(1000);
        // this.leaderPanel.setScrollFactor(0);
        // this.leaderPanel.setInteractive();
        // setScaleFactor.call(this, false);
        // Accessing the game canvas width and height directly
        
        console.log('LeaderBoardUI: init() method called');
        // Create the leaderboard popup
        this.createLeaderboardPopup();

        // // Add event listener for click or tap
        // this.leaderPanel.on('pointerdown', () => {
        //     console.log('Leaderboard button clicked!');
        //     this.showLeaderboardPopup();
        // });
    }

    async fetchLeaderboardData() {
        try {
            const response = await axios.get('http://localhost:5001/api/users/getUsers');
            console.log("inside leaderbaordUI file feth data", response.data);
            const leaderData = response.data.map(user => ({
                userName: user.userName,
                points: user.maxScore
            }));
            console.log(leaderData);
            return leaderData;
        } catch (error) {
            console.error('Error fetching leaderboard data:', error);
            return [];
        }
    }

    async createLeaderboardPopup() {
        console.log('createLeaderboardPopup() called');
        // Define offset values to move the leaderboard

        let gameWidth = this.game.canvas.width;
        let gameHeight = this.game.canvas.height;
        let scaleFact = window.innerHeight / (window.innerWidth + this.extraLeftPer * 3) * (.15) * Global.dpr;
        console.log("Game Canvas Width: ", gameWidth);
        console.log("Game Canvas Height: ", gameHeight);
    
        this.leaderboardPopup = this.add.image(gameWidth * 0.5, gameHeight * 0.5, 'ui', 'panel0000');

// Adjust the leaderboard position with custom values
// this.leaderboardPopup = this.add.image(1000,500, 'ui', 'panel0000');
        
        this.leaderboardPopup.setScale(0.35);
        this.leaderboardPopup.setDepth(1003);
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
            let rankText = this.add.text(
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

            let nameText = this.add.text(
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

            let scoreText = this.add.text(
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

        // Close button for leaderboard
        this.closeBtn = this.add.image(this.leaderboardPopup.x + popupWidth * 0.58, this.leaderboardPopup.y - popupHeight * 0.45, 'ui', 'closeBtn0000');
        this.closeBtn.setScale(0.3);  // Increase size
        this.closeBtn.setDepth(2001);
        this.closeBtn.setScrollFactor(0);
        this.closeBtn.setInteractive();
        this.closeBtn.setVisible(false); // Initially hidden
        this.closeBtn.on('pointerdown', () => {
            this.leaderboardPopup.setVisible(false); // Hide leaderboard on close button click
            this.closeBtn.setVisible(false);
            // Hide all leaderboard entries when the close button is clicked
            this.leaderboardEntries.forEach(entry => {
                entry.rankText.setVisible(false);
                entry.nameText.setVisible(false);
                entry.scoreText.setVisible(false);
            });

            // Resume the game scene
            this.scene.resume('Game'); // Resumes the game scene 

            // Hide or stop the leaderboard UI scene
            this.scene.scene.stop('LeaderBoardUI');
        });

        // this.add(this.leaderboardPopup);
        // this.add(this.closeBtn);

        // Ensure the popup is ready before showing it
        this.events.emit('leaderboardCreated'); 
    }

    

    // Method to show the leaderboard
    showLeaderboardPopup() {
        console.log("Showing Leaderboard.....");
        this.leaderboardPopup.setVisible(true);
        this.closeBtn.setVisible(true);

        this.leaderboardEntries.forEach(entry => {
            entry.rankText.setVisible(true);
            entry.nameText.setVisible(true);
            entry.scoreText.setVisible(true);
        }); // Show all entries
    }

    // Method to hide the leaderboard
    hideLeaderboardPopup() {
        if (this.leaderboardPopup) {
            this.leaderboardPopup.setVisible(false);

            this.leaderboardEntries.forEach(entry => {
                entry.rankText.setVisible(false);
                entry.nameText.setVisible(false);
                entry.scoreText.setVisible(false); // Hide all entries
            });
        }
    }

    // create() {
    //     this.emitter = new EventEmitter.getObj();

    //     // Semi-transparent background overlay
    //     this.bgOverlay = this.add.graphics();
    //     this.bgOverlay.fillStyle(0x000000, 0.75);
    //     this.bgOverlay.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    //     this.bgOverlay.setDepth(5000); // Ensure it's on top

    //     // Leaderboard Panel
    //     this.leaderboardPopup = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'panel0000');
    //     this.leaderboardPopup.setScale(4);
    //     this.leaderboardPopup.setDepth(5001);

    //     // Close Button
    //     this.closeBtn = this.add.image(this.cameras.main.width * 0.75, this.cameras.main.height * 0.35, 'closeBtn0000');
    //     this.closeBtn.setScale(0.3);
    //     this.closeBtn.setDepth(5002);
    //     this.closeBtn.setInteractive();
    //     this.closeBtn.on('pointerdown', () => {
    //         this.scene.stop(); // Close the UI scene
    //         this.scene.resume('Game'); // Resume the main game
    //     });

    //     // Fetch leaderboard data and display it
    //     this.displayLeaderboard();
    // }

}
