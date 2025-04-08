// scenes/HowToPlayUI.js
export class HowToPlayUI extends Phaser.Scene {
    constructor() {
        super({ key: 'HowToPlayUI' });
    }

    create() {
        const gameWidth = this.game.canvas.width;
        const gameHeight = this.game.canvas.height;

        // Dimmed background overlay
        this.add.rectangle(0, 0, gameWidth, gameHeight, 0x000000, 0.5)
            .setOrigin(0)
            .setDepth(999);

        // Draw popup box
        const popupWidth = gameWidth * 0.4;
        const popupHeight = gameHeight * 0.8;

        const popupX = (gameWidth - popupWidth) / 2;
        const popupY = (gameHeight - popupHeight) / 2;

        const popup = this.add.graphics();
        popup.fillStyle(0xffffff, 1);
        popup.fillRoundedRect(
            popupX, 
            popupY,
            popupWidth,
            popupHeight,
            20
        ).setDepth(1000);

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

        const padding = 40;
        const rowHeight = 60;
        const contentStartX = popupX + padding;
        const contentStartY = popupY + padding;

        // const startX = gameWidth / 2 - 250;
        // const startY = gameHeight / 2 - (gestures.length * 60) / 2;

        gestures.forEach((gesture, index) => {
            const y = contentStartY + index * rowHeight;

            // Static gesture image from sprite atlas
            this.add.image(contentStartX, y, 'gestures', gesture.frame)
                .setScale(0.5)
                .setOrigin(0, 0.5)
                .setDepth(1001);

            // Description text
            this.add.text(contentStartX + 100, y, gesture.description, {
                fontSize: '20px',
                color: '#000000',
                wordWrap: { width: popupWidth - 2 * padding - 100 }
            })
                .setOrigin(0, 0.5)
                .setDepth(1001);
        });

        // // Instructional text
        // this.add.text(gameWidth / 2, gameHeight / 2, 
        //     '📱 HOW TO PLAY 📱\n\n👉 Swipe left/right: Move\n👆 Swipe up: Jump\n👆 Tap: Shoot\n\nGood Luck!',
        //     {
        //         font: '22px Arial',
        //         fill: '#000',
        //         align: 'center',
        //         wordWrap: { width: popupWidth - 60 }
        //     }
        // ).setOrigin(0.5).setDepth(1001);

        // Close button
        const closeBtn = this.add.text(popupX + popupWidth / 2, popupY + popupHeight - padding, 'CLOSE', {
            font: '24px Arial',
            fill: '#ffffff',
            backgroundColor: '#ff3333',
            padding: { x: 16, y: 8 },
        }).setOrigin(0.5).setInteractive().setDepth(1002);

        closeBtn.on('pointerdown', () => {
            this.scene.resume('Game');       // Resume main game
            this.scene.setVisible(false);    // Hide this popup
            // this.scene.sleep();              // Optional: fully put it to sleep
        });
    }
}
