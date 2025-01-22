import EventEmitter from "./event-emitter";
import { Global } from "./global";
import { setScaleFactor } from "./scale_factor";
import InputText from 'phaser3-rex-plugins/plugins/inputtext.js';

export class GameOver extends Phaser.GameObjects.Group{
    

    constructor(game){
        super(game);
    }

    setUp(){
        setScaleFactor.call(this,false);

        this.emitter=new EventEmitter.getObj();

      
    }
    init(){
        this.bg= this.scene.add.graphics();
        this.add(this.bg);
        this.bg.setScrollFactor(0);
        this.setDepth(1000);
        this.bg.fillStyle(0x000000,0.75);
        this.bg.fillRect(0,0,this.c_w,this.c_h);

        this.popup = this.create(this.c_w*.5,this.c_h*.5,"ui","score_popup0000");

     
        this.popup.setScale(this.scaleFact*5);
        this.popup.setDepth(1000);
        this.popup.setScrollFactor(0);

        this.gameScore = this.scene.add.text(this.c_w*.5,this.popup.y-this.popup.height*.19*this.popup.scaleY, Global.scoreTotal,{
            fontFamily: 'pixelmix',
            fontSize: `${(this.c_w-this.extraLeftPer*2)*.0283}px`,
            color:'#ffdd16',
            stroke: '#000000',
            strokeThickness: 9
        });
        this.add(this.gameScore);
        this.gameScore.setOrigin(0.5);
        this.gameScore.setDepth(1000);
        this.gameScore.setScrollFactor(0);

 
        this.replayBtn = this.create(this.c_w*.5,this.popup.y+this.popup.height*.2*this.popup.scaleY,"ui","replayBtn0000");
        this.replayBtn.setScale(this.scaleFact*7);
        this.replayBtn.setDepth(1000);
        this.replayBtn.setScrollFactor(0);
        this.replayBtn.setInteractive({cursor:'pointer'}).on('pointerdown',this.onReplay.bind(this));



       
    }
    onNameEnter(v){
        Global.userName = v.target.value.trim();

        if(Global.userName.length>0){
            this.playBtn.setAlpha(1);
        }else{
            this.playBtn.setAlpha(0.3);
        }
    }
    onExit(){

    }
    onLeader(){
        this.emitter.emit('game:show_leader_board');
    }
    show(){
        this.setVisible(true);
    }
    hide(){
        this.setVisible(false);
    }
    onReplay(){
      
        this.emitter.emit('game:on_replay');
       
    }
}