import {
    Global
  } from './global';
  
  function setScaleFactor(isRoot) {
    let dimenson = {
      width: window.innerWidth * Global.dpr,
      height: window.innerHeight * Global.dpr
    }
    let c_w, c_h;
    if (isRoot) {
      c_w = this.game.canvas.width;
      c_h = this.game.canvas.height;
      this.c_w = c_w;
      this.c_h = c_h;
    } else {
      c_w = this.scene.game.canvas.width;
      c_h = this.scene.game.canvas.height;
      this.c_w = c_w;
      this.c_h = c_h;
    }
    this.extraTop = Math.abs(parseFloat(document.getElementsByTagName("canvas")[0].style.marginTop)) / dimenson.width * c_w;
    this.extraLeftPer = Math.abs(parseFloat(document.getElementsByTagName("canvas")[0].style.marginLeft)) / dimenson.height * c_h;
  
    this.scaleFact = window.innerHeight / (window.innerWidth + this.extraLeftPer * 3) * (.15) * Global.dpr;
  
  }
  
  export {
    setScaleFactor
  }