import { Global } from "../objects/global";



export default class PreLoader extends Phaser.Scene {
  constructor() {
    super({ key: 'PreLoader' })
  }

  init(){
    window.addEventListener('resize',Global.onResize,true);
    Global.onResize();

  }
  onProgress(v){}
  preload() {

  }
  create(){
   
      this.scene.start("Loader");
  }

}