import {
    Global
  } from "../objects/global";
  
  import {
    setScaleFactor
  } from "../objects/scale_factor";
  import GameControl from "../objects/control";
  import EventEmitter from "../objects/event-emitter";
  import {
    SceneManager
  } from "../objects/SceneManager";
  import {
    Ape
  } from "../objects/Ape";
  import {
    Floor
  } from "../objects/Floor";
  import {
    WeaponHand
  } from "../objects/HandWithWeapon";
  import {
    GunFire
  } from "../objects/GunFire";
  import {
    EnemyManager
  } from "../objects/Enemy-Manager";
  import {
    CollisionArea
  } from "../objects/collision-area";
  import {
    UI
  } from "../objects/Ui";
  import {
    GameOver
  } from "../objects/GameOver";
  import Gesture from "../objects/Gesture";
import axios from "axios";
  
  export default class Game extends Phaser.Scene {
    constructor() {
      super({
        key: 'Game'
      });
  
  
      this.gameSpeed = 1;
      this.upX = 0;
      this.touchX = -1;
      this.prevTouchX = -1;
      this.gameReady = false;
      this.introActive = false;
      this.zoomTO = null;
      this.gameActive = false;
  
      this.onShare = this.onShare.bind(this);
      this.replayGame = this.replayGame.bind(this);
  
    }

    resumeGame() {
      // Resume gameplay
      this.pauseOverlay.setVisible(false);
      console.log("Game resumed!");
    }

    

    init() {
      this.emitter = new EventEmitter.getObj();
  
      this.emitter.on('show_drop_intro_and_activate', this.showHintAndActivate.bind(this));
      this.emitter.on('game:on_game_end', this.showScorePopup.bind(this));
      this.emitter.on('calc_life', this.calculateLife.bind(this));
      this.emitter.on('character:update_camera_bound', this.updateCameraBoundX.bind(this));
      this.emitter.on('game:on_replay', this.onReplay.bind(this));
      this.emitter.on('game:game_activate', this.activateGame.bind(this));
    }
    updateCameraBoundX(xPos) {
      this.cameras.main.setBounds(xPos - (Global.isMobileOnly ? 350 : 300) * this.scaleFact * (Global.isMobile ? 1.35 : 10) - this.extraLeftPer, -400 * this.scaleFact, this.c_w, this.c_h + 400 * this.scaleFact);
    }
  
    onShare() {
      var textArea;
      document.querySelector(".share-msg").classList.add("active");
      this.popupTimeout = setTimeout(function () {
        document.querySelector(".share-msg").classList.remove("active");
      }.bind(this), 1000)
  
      function isOS() {
        //can use a better detection logic here
        return navigator.userAgent.match(/ipad|iphone/i);
      }
  
      function createTextArea(text) {
        textArea = document.createElement('textArea');
        textArea.readOnly = true;
        textArea.contentEditable = true;
        textArea.value = text;
        document.body.appendChild(textArea);
      }
  
      function selectText() {
        var range, selection;
  
        if (isOS()) {
          range = document.createRange();
          range.selectNodeContents(textArea);
          selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
          textArea.setSelectionRange(0, 999999);
        } else {
          let copyField = document.getElementById("copyCodeFiled");
          copyField.select();
          copyField.setSelectionRange(0, 99999);
          document.execCommand("copy");
          copyField.blur();
        }
      }
  
      function copyTo() {
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      if (isOS())
        createTextArea(document.getElementById("copyCodeFiled").value);
      selectText();
      if (isOS()) {
        copyTo();
      }
    }
    replayGame() {
      /*     this.formReplay.removeEventListener("click", this.replayGame, true);
          this.formShare.removeEventListener("click", this.onShare, true); */
      document.querySelector("#game-sec").classList.remove("deactive")
  
      document.querySelector(".game-form").classList.remove("active")
  
      // document.querySelector("#game-leader").classList.remove("active");
      document.querySelector("#game-sec").classList.remove("deactive")
      // sounds.button.play();
      //document.querySelector(".kangaroo").classList.remove("active")
      EventEmitter.kill();
      this.scene.start('Game');
    }
  
  
    async create() {
      setScaleFactor.call(this, true);
  
  
      document.querySelector("#loader-sec").classList.add("active");
      Global.playCount++;
      Global.weaponKey = "hand";
      this.gameActive = false;
      Object.keys(Global.uiWeapons).forEach((key) => {
        Global.uiWeapons[key]['enabled'] && (Global.uiWeapons[key]['count'] = Global.uiWeapons[key]['maxCount']);
      });
  
      Global.scoreTotal = 0;
  
     
  
      this.proceedToStart();
  
      this.emitter.emit('game:game_activate');
  
    }
    createAnims() {
      this.anims.create({
        key: 'run',
        frames: this.anims.generateFrameNames("ape", {
          prefix: 'body',
          start: 0,
          end: 7,
          zeroPad: 4
        }),
        repeat: -1,
        frameRate: 13 
      });
      this.anims.create({
        key: 'jump',
        frames: this.anims.generateFrameNames("ape", {
          prefix: 'body',
          start: 8,
          end: 15,
          zeroPad: 4
        }),
        repeat: 0,
        frameRate: 16 
      });
      this.anims.create({
        key: 'jump2',
        frames: this.anims.generateFrameNames("ape", {
          prefix: 'body',
          start: 16,
          end: 19,
          zeroPad: 4
        }),
        repeat: 0,
        frameRate: 35 
      });
      this.anims.create({
        key: 'slide',
        frames: this.anims.generateFrameNames("ape", {
          prefix: 'body',
          start: 22,
          end: 29,
          zeroPad: 4
        }),
        repeat: 0,
        frameRate: 16 
      });
      this.anims.create({
        key: 'attack',
        frames: this.anims.generateFrameNames("ape", {
          prefix: 'body',
          start: 32,
          end: 39,
          zeroPad: 4
        }),
        repeat: 0,
        frameRate: 16 
      });
      this.anims.create({
        key: 'attack_on_jump',
        frames: this.anims.generateFrameNames("ape", {
          prefix: 'body',
          start: 42,
          end: 49,
          zeroPad: 4
        }),
        repeat: 0,
        frameRate: 16 
      });
      this.anims.create({
        key: 'attack_on_slide',
        frames: this.anims.generateFrameNames("ape", {
          prefix: 'body',
          start: 52,
          end: 59,
          zeroPad: 4
        }),
        repeat: 0,
        frameRate: 16 
      });
      this.anims.create({
        key: 'die',
        frames: this.anims.generateFrameNames("ape", {
          prefix: 'body',
          start: 60,
          end: 69,
          zeroPad: 4
        }),
        repeat: 0,
        frameRate: 16 
      });
      this.anims.create({
        key: 'bird_fly',
        frames: this.anims.generateFrameNames("bird", {
          prefix: 'bird',
          start: 0,
          end: 3,
          zeroPad: 4
        }),
        repeat: -1,
        frameRate: 15
      });
      this.anims.create({
        key: 'elephant_run',
        frames: this.anims.generateFrameNames("elephant", {
          prefix: 'elephant_front',
          start: 0,
          end: 9,
          zeroPad: 4
        }),
        repeat: -1,
        frameRate: 15
      });
      this.anims.create({
        key: 'elephant_run2',
        frames: this.anims.generateFrameNames("elephant_back", {
          prefix: 'elephant_back',
          start: 0,
          end: 9,
          zeroPad: 4
        }),
        repeat: -1,
        frameRate: 15
      });
      this.anims.create({
        key: 'gun1_fire',
        frames: this.anims.generateFrameNames("gun1_fire", {
          prefix: 'gun1_fire',
          start: 0,
          end: 5,
          zeroPad: 4
        }),
        repeat: 0,
        frameRate: 16
      });
      this.anims.create({
        key: 'ak47_fire',
        frames: this.anims.generateFrameNames("ak47_fire", {
          prefix: 'ak47_fire',
          start: 0,
          end: 5,
          zeroPad: 4
        }),
        repeat: 1,
        frameRate: 16
      });
      this.anims.create({
        key: 'guitar_fire',
        frames: this.anims.generateFrameNames("guitar_fire", {
          prefix: 'guitar_fire',
          start: 0,
          end: 9,
          zeroPad: 4
        }),
        repeat: 0,
        frameRate: 16
      });
      this.anims.create({
        key: 'tiger_run',
        frames: this.anims.generateFrameNames("tiger", {
          prefix: 'tiger',
          start: 0,
          end: 7,
          zeroPad: 4
        }),
        repeat: -1,
        frameRate: 15
      });
    }
  
    // activateGame() {
    //   if (this.home) {
    //     this.home.destroy(true);
    //     this.home = null;
    //   }
  
    //   this.gameActive = true;
    // }
  
  
    showHintAndActivate() {
      this.gameActive = true;
    }
    proceedToStart() {
      if(Global.playCount === 1){
        this.createAnims();
      }
      this.createScene();
     
    }
    createScene() {
      Global.isWeaponRepeatAllowed = false;
  
      this.matter.world.setGravity(0, 4);
      // this.matter.set60Hz();
      this.cameras.main.setBounds(100 * this.scaleFact - this.extraLeftPer, -400 * this.scaleFact, this.c_w, this.c_h + 400 * this.scaleFact);
  
  
  
      this.sceneMgr = new SceneManager(this);
      this.sceneMgr.setUp();
      this.sceneMgr.init();
  
      this.floor = new Floor(this.matter.world, this.c_w * .5, this.c_h - this.extraTop - 120 * this.scaleFact, 'floor');
      this.floor.setUp();
      this.floor.init();
  
      this.ape = new Ape(this.matter.world, 100 * 20 * this.scaleFact + this.extraLeftPer, this.c_h - this.extraTop - 600 * this.scaleFact * (Global.isMobile ? .25 : 2), 'ape'); //`ape_${this.apeKey}`)
      this.ape.setUp();
      this.ape.init();
  
      this.weaponHand = new WeaponHand(this, 100 * 20 * this.scaleFact + this.extraLeftPer, this.c_h - this.extraTop - 600 * this.scaleFact * (Global.isMobile ? 1 : 2))
      this.weaponHand.setUp();
      this.weaponHand.init();
  
      this.gunFire = new GunFire(this, 0, 0, 'gun1');
      this.gunFire.setUp();
      this.gunFire.init("gun1");
  
      this.enemyMgr = new EnemyManager(this);
      this.enemyMgr.setUp();
      this.enemyMgr.init();
  
      this.collisionArea = new CollisionArea(this);
      this.collisionArea.setUp();
      this.collisionArea.init();
  
      this.updateCameraBoundX(this.ape.x);
  
      this.control = new GameControl(this);
      this.control.setUp();
      this.control.init();
  
      this.gesture = new Gesture(this);
      this.gesture.setUp();
      this.gesture.init();
  
  
  
      this.gameUI = new UI(this);
      this.gameUI.setUp();
      this.gameUI.init();
  
  
   
  
  
  
      this.matter.world.on('collisionstart', (event, bodyA, bodyB) => {
        if (bodyA.gameObject.getData('isObstacle') ||
          bodyB.gameObject.getData('isObstacle')
        ) {
          this.emitter.emit('game:hit_with_obstacle');
        }
        if ((bodyA.gameObject.texture.key == "floor" && bodyB.gameObject.texture.key == `ape`) ||
          (bodyB.gameObject.texture.key == "floor" && bodyA.gameObject.texture.key == `ape`)) {
          this.emitter.emit('game:landed_on_terrain');
        }
        if ((bodyA.gameObject.texture.key == "coin" && bodyB.gameObject.texture.key == `ape`) ||
          (bodyB.gameObject.texture.key == "coin" && bodyA.gameObject.texture.key == `ape`)) {
          this.emitter.emit('game:coin_collected', bodyA.gameObject.texture.key == "coin" ? bodyA.gameObject : bodyB.gameObject);
        }
      });
  
      // if(Global.playCount>1){
      //   this.emitter.emit('game:start_game');
      // }else{
      //   Global.serverObj=new Server();     
      // }
      
   
      /*     this.emitter.emit('game:on_game_end');
          this.emitter.emit('game:show_leader_board'); */
    }
  
    activateGame(){
      Global.gameStarted = true;
      this.emitter.emit('game:start_game');
  
      document.querySelector("#loader-sec").classList.remove("active");
    }
    showScorePopup() {
      Global.gameFinished = true;
      // this.gameFinished=true;
      this.showScoreCard()
    }
    showScoreCard() {
      console.log(Global.scoreTotal)
      document.querySelector("#loader-sec").classList.remove("active");
      this.gameOver = new GameOver(this);
      this.gameOver.setUp();
      this.gameOver.init();
      this.submitScore(Global.scoreTotal)
    }
  
    async submitScore(score) {
      
      const userId = localStorage.getItem("userId");

      try {
        const res = await axios.put("http://localhost:5000/api/users/points", {
          userId,
          points:score
        })

        if (res.status === 200) {
          console.log(res.data.message)
        } else {
          console.log("Something went wrong!",res.data.message)
        }

      } catch (error) {
        console.log(error.response.data.message)
      }

    }
  
    calculateLife(data) {
      this.showMessage(0);
      Global.gameFinished = this.scoreBoard.onLifeLose(data['toFall']);
      if (Global.gameFinished) {
        setTimeout(() => {
          this.showCTA();
        }, 1000)
      }
    }
    onReplay() {
      EventEmitter.kill();
      this.scene.start("Game");
    }
  
  
  
    update(time, delta) {
      // this.matter.world.update(dt,1)
      if (this.gameFinished || !Global.gameStarted) return false;
  
      // delta=50;
      this.ape.update(delta);
      this.sceneMgr.update(delta);
  
      this.weaponHand.update(delta);
      this.enemyMgr.update(delta);
  
      this.emitter.emit('game:update')
  
  
    }
   
    onGameFinished() {
      this.gameFinished = true;
      this.showCTA();
    }
  }