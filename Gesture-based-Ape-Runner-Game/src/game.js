import 'phaser'
import '@babel/polyfill/noConflict'
import axios from 'axios';
import Loader from './scenes/Loader';
import Game from './scenes/Game';
import InputTextPlugin from 'phaser3-rex-plugins/plugins/inputtext-plugin.js';

import PreLoader from './scenes/Preloader';
import { isMobile, isMobileOnly } from 'mobile-device-detect';

import './style.scss';
import { Global } from './objects/global';

let DEFAULT_WIDTH = 1280;
let DEFAULT_HEIGHT = 720;
Global.isMobile = false;//isMobile;
Global.isMobileOnly = isMobile;
Global.viewMode = "landscape";
Global.dpr = 1;
/* if(isMobile){
  Global.viewMode="portrait";
  DEFAULT_WIDTH = 720;
  DEFAULT_HEIGHT = 1280;
} */


document.getElementById("start_game_button").addEventListener("click", async () => {
  const username = document.getElementById("username_input").value;
  const password = document.getElementById("password_input").value;

  // Validate Username
  if (!username.trim()) {
    alert("Please enter a valid username!");
    return;
  }

  if (!password) {
    alert("Please enter a valid password!");
    return;
  }

  try {

    const res = await axios.post("http://localhost:5001/api/users/register", {
      username,
      password
    })

    console.log({res})

    if (res.status === 201 || res.status === 200) {
      console.log("Username registered successfully:", res.data);

      // Store the username in localStorage for later use
      localStorage.setItem("username", username);
      localStorage.setItem("userId",res.data.userId)

      // Hide the username input and start the game
      document.getElementById("username_field").style.display = "none";

      // Initialize the game (replace with your actual game initialization function)
      gameStart();
    } else {
      alert(res.data.message);
    }
  } catch (error) {
    console.log(error)
    alert(error.response.data.message);
  }

});


const gameStart = () => {

  const game = new Phaser.Game({
    type: Phaser.CANVAS,
    transparent: false,
    scale: {
      parent: 'game-sec',
      mode: (Global.isMobile) ? Phaser.Scale.ENVELOP : Phaser.Scale.ENVELOP,
      autoCenter: Phaser.Scale.CENTER_BOTH,//CENTER_HORIZONTALLY,
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT
    },
    pixelArt: false,
    dom: {
      createContainer: false
    },
    scene: [PreLoader, Loader, Game],
    physics: {
      default: 'matter',
      matter: {
        gravity: {
          y: 9.8
        },
        debug: false

      }
    },
    /* fps: {
        target: 60,
        forceSetTimeOut: true,
        smoothStep:false,
    }, */plugins: {

      global: [{
        key: 'rexInputTextPlugin',
        plugin: InputTextPlugin,
        start: true
      }
        // ...
      ],
      scene: [
        {
          key: 'rexDebugDraw',
          plugin: RexPlugins.GameObjects.DebugDrawPlugin,
          start: true
        }
      ]
    }
  })

};

// gameStart()
