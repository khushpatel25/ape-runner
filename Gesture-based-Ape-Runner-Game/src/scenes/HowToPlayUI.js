// scenes/HowToPlayUI.js
export class HowToPlayUI extends Phaser.Scene {
    constructor() {
        super({ key: 'HowToPlayUI' });
    }

    create() {
        const gameWidth = this.game.canvas.width;
        const gameHeight = this.game.canvas.height;
        const padding = 40;
        // Dimmed background overlay
        this.add.rectangle(0, 0, gameWidth, gameHeight, 0x000000, 0.5)
            .setOrigin(0)
            .setDepth(999);

        // Draw popup box
        const popupWidth = gameWidth * 0.37;
        const popupHeight = gameHeight * 0.8;

        const popupX = (gameWidth - popupWidth) / 2;
        const popupY = (gameHeight - popupHeight) / 2;

        const popup = this.add.graphics();
        popup.fillStyle(0x222223, 1);
        popup.fillRoundedRect(
            popupX, 
            popupY,
            popupWidth,
            popupHeight,
            20
        ).setDepth(1000);

       // Add "Play Gestures" title
       this.add.text(
        popupX + padding * 4, // Left-aligned with gesture images
        popupY + 25, // 25px from top edge
        '* Play Gestures *',
        {
            font: 'bold 22px Arial',
            color: '#edce13',
            wordWrap: { width: popupWidth - 2 * padding }
        }
        ).setOrigin(0, 0.5).setDepth(1001);
        console.log('Play Gestures title added at:', popupX + padding, popupY + 25);



        // Example gesture rows (update these with your frame names + descriptions)
        const gestures = [
            { frame: 'Closed_Fist', description: 'Slide motion' },
            { frame: 'Open_Palm', description: 'Perform a Jump' },
            { frame: 'Pointing_Up', description: 'Double Jump' },
            { frame: 'ILoveYou', description: 'Resume Game' },
            { frame: 'Thumb_Down', description: 'Drop a weapon' },
            { frame: 'Thumb_Up', description: 'Engage a weapon' },
            { frame: 'Victory', description: 'Pause Game' },
            { frame: 'high_five', description: 'Shield Activation' },
        ];

        // const padding = 40;
        const rowHeight = 60;
        const contentStartX = popupX + padding + 30;
        // const contentStartY = popupY + padding;
        const contentStartY = popupY + 100; // Increased to give title space


        gestures.forEach((gesture, index) => {
            const y = contentStartY + index * rowHeight;

            // Static gesture image from sprite atlas
            this.add.image(contentStartX, y, 'gestures', gesture.frame)
                .setScale(0.5)
                .setOrigin(0, 0.5)
                .setDepth(1001);

            // Description text
            this.add.text(contentStartX + 150, y, gesture.description, {
                fontSize: '20px',
                color: '#edce13',
                wordWrap: { width: popupWidth - 2 * padding - 150 }
            })
                .setOrigin(0, 0.5)
                .setDepth(1001);
        });

        const closeBtn = this.add.image(
            popupX + popupWidth + 20, // Just outside right edge
            popupY + 20, // Just below top edge
            'ui',
            'closeBtn0000'
        );
        closeBtn.setScale(0.3); // Match leaderboard button size
        closeBtn.setDepth(2001); // Above popup and text
        closeBtn.setInteractive();

        closeBtn.on('pointerdown', () => {
            this.scene.resume('Game');       // Resume main game
            this.scene.setVisible(false);    // Hide this popup
            // this.scene.sleep();              // Optional: fully put it to sleep
        });
    }
}
