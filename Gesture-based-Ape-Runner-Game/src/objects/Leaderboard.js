import EventEmitter from "./event-emitter";
import { Global } from "./global";

export class Leaderboard extends Phaser.GameObjects.Group {
    constructor(scene) {
        super(scene);
        this.scene = scene;
        this.emitter = new EventEmitter.getObj();
        this.init();
    }

    init() {
        // Create a semi-transparent background
        this.bg = this.scene.add.graphics();
        this.bg.fillStyle(0x000000, 0.75);
        this.bg.fillRect(0, 0, this.scene.c_w, this.scene.c_h);
        this.bg.setDepth(2000);
        this.bg.setScrollFactor(0);
        this.add(this.bg);
        
        // Create leaderboard popup
        this.popup = this.scene.add.sprite(this.scene.c_w * 0.5, this.scene.c_h * 0.5, "ui", "panel0000");
        this.popup.setScale(5);
        this.popup.setDepth(2001);
        this.popup.setScrollFactor(0);
        this.add(this.popup);

        // Add leaderboard title
        this.titleText = this.scene.add.text(this.scene.c_w * 0.5, this.popup.y - 100, "Leaderboard", {
            fontFamily: 'Arial',
            fontSize: '48px',
            color: '#ffffff',
            align: 'center',
        }).setOrigin(0.5);
        this.add(this.titleText);

        // Add dummy leaderboard entries (replace with real data)
        this.entries = [
            { rank: 1, name: "Player1", score: 5000 },
            { rank: 2, name: "Player2", score: 3000 },
            { rank: 3, name: "Player3", score: 2000 }
        ];
        
        let startY = this.popup.y - 50;
        this.entries.forEach((entry, index) => {
            let text = this.scene.add.text(this.scene.c_w * 0.5, startY + (index * 40),
                `${entry.rank}. ${entry.name}: ${entry.score}`, 
                { fontSize: '32px', color: '#ffff00', align: 'center' }
            ).setOrigin(0.5);
            this.add(text);
        });

        // Close button
        this.closeBtn = this.scene.add.sprite(this.scene.c_w * 0.5, this.popup.y + 150, "ui", "replayBtn0000");
        this.closeBtn.setInteractive({ cursor: 'pointer' });
        this.closeBtn.on('pointerdown', this.hide.bind(this));
        this.closeBtn.setDepth(2002);
        this.add(this.closeBtn);

        this.hide();  // Hide initially
    }

    show() {
        this.setVisible(true);
    }

    hide() {
        this.setVisible(false);
    }
}
