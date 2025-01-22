import EventEmitter from "./event-emitter";
import {
  setScaleFactor
} from "./scale_factor";
import {
  GestureRecognizer,
  FilesetResolver,
  DrawingUtils
} from "./task-vision";

export default class Gesture extends Phaser.GameObjects.Group {
  constructor(game) {
    super(game);
    this.lastGesture = null; // Property to store the last detected gesture
    this.noGestureTimeout = null; // Property to store the timeout ID
    this.lastUpdateTime = 0; // Timestamp for throttling updates
    this.lastPredictTime = 0; // Timestamp for throttling gesture predictions
    this.lastPosition = null; // Store last position of the hand for movement detection
    this.lastMovementDetected = false; // Track if last action was a movement
    this.lastSwipeDirection = null;
    this.swipeOrUpTO = null;
    this.gestureStatus = 0;
    this.currentX = 0;
    this.swipeMoved = false;
    this.deltaX = 0;
    this.gestureKeys = {
     
      'Open_Palm': 38,
      'Closed_Fist': 40,
      'swipe_left': -1,
      'swipe_right': 1,
      'Thumb_Up': 2,
      'Thumb_Down': 3,
      'Victory': 4,
      'Pointing_Up': 38,
      'ILoveYou':10
    }
  }

  setUp() {
    setScaleFactor.call(this, false);
    this.emitter = EventEmitter.getObj();
    this.emitter.on('game:update', this.update.bind(this));
    this.emitter.on('game:paused', this.onPaused.bind(this));

    this.webcamRunning = false;
    this.runningMode = "VIDEO";
    this.videoEle = null;
    this.lastVideoTime = 0;
    this.results = null;
    this.canvasCtx = null;
  }

  init() {
    this.addGesture();
    this.videoEle = document.getElementById("webcam");
    navigator.mediaDevices.getUserMedia({
      video: {
        width: window.innerWidth,
        height: window.innerHeight
      } // Adjusted to a lower resolution
    }).then(async function (stream) {
      this.videoEle.srcObject = stream;
      this.vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );
      this.gestureRecognizer = await GestureRecognizer.createFromOptions(this.vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
          delegate: "GPU"
        },
        runningMode: this.runningMode,
        numHands: 1
      });
      this.webcamRunning = true;
      this.emitter.emit('game:game_activate');
    }.bind(this));
  }

  async predictWebcam() {
    const now = Date.now();
    if (now - this.lastPredictTime < 200) {
      return;
    }
    this.lastPredictTime = now;

    if (this.runningMode === "IMAGE") {
      this.runningMode = "VIDEO";
      await this.gestureRecognizer.setOptions({
        runningMode: "VIDEO"
      });
    }

    if (this.videoEle.currentTime !== this.lastVideoTime) {
      this.lastVideoTime = this.videoEle.currentTime;
      this.results = this.gestureRecognizer.recognizeForVideo(this.videoEle, now);
    }

    // Process results
    this.processResults();
  }

  
  processResults() {
    if (this.results && this.results.gestures.length > 0) {
      const currentGesture = this.results.gestures[0][0]['categoryName'];
      // Only print if the current gesture is different from the last one
      if (currentGesture == "ILoveYou" && this.scene.scene.isPaused('Game') && this.lastGesture != currentGesture && currentGesture != "Open_Palm") {
        this.onResume();
        this.lastGesture = currentGesture;
        
        this.onGestureIdentified(this.lastGesture);
        setTimeout( this.onGestureMissing.bind(this),1000)
      }
      if (this.scene.scene.isPaused('Game') && currentGesture == "None") {
        this.lastGesture = currentGesture; 
      }
  
      if ((currentGesture !== this.lastGesture) && currentGesture !== "None" && !this.scene.scene.isPaused('Game')) {
        // Update lastGesture
        if (currentGesture !== this.lastGesture && currentGesture != "Open_Palm") {
          this.lastGesture = currentGesture;
        }
  
        // Clear any existing delay if a gesture is detected
        if (this.noGestureTimeout) {
          clearTimeout(this.noGestureTimeout);
          this.noGestureTimeout = null;
        }
  
        if (currentGesture === "Pointing_Up") {
          if (this.swipeOrUpTO == null) {
            this.swipeOrUpTO = setTimeout(this.decidePointingUp.bind(this), 250);
          }
        } else {
          this.swipeOrUpTO = null;
          this.lastPosition = null;
          this.swipeMoved = false;
          this.currentX = 0;
          this.lastSwipeDirection = null;
  
          // Detect high five if gesture is "Open_Palm" with fingers spread and lastGesture is not "high_five"
          if (currentGesture === "Open_Palm") {
            let isHighFive = this.isOpenHandWithFingersSpread(this.results.landmarks[0]);
            if (isHighFive && this.lastGesture !== 'high_five') {
              this.lastGesture = "high_five";
              this.emitter.emit('sheild:activate');
              this.onGestureIdentified(this.lastGesture);
            } else if (!isHighFive && this.lastGesture != 'Open_Palm') {
              this.lastGesture = "Open_Palm";
              this.onGestureIdentified(this.lastGesture);
            }
          } else {
            this.emitter.emit('sheild:deactivate');
            this.onGestureIdentified(this.lastGesture);
          }
        }
      } else if (currentGesture == "None") {
        if (this.scene.scene.isPaused('Game')) {
          return false;
        }
        if (!this.noGestureTimeout) {
          this.noGestureTimeout = setTimeout(() => {
            this.onGestureMissing();
            this.swipeOrUpTO = null;
            this.lastGesture = null; // Reset if no gesture detected
            this.lastPosition = null;
            this.swipeMoved = false;
            this.currentX = 0;
          }, 250); // Adjust the delay (in milliseconds) as needed
        }
      }
      if (currentGesture === "Pointing_Up") {
        if (this.scene.scene.isPaused('Game')) {
          return false;
        }
        this.detectMovement();
      }
    }else  if (!this.noGestureTimeout) {
      console.log("noGestureTimeout")
      this.noGestureTimeout = setTimeout(() => {
        this.onGestureMissing();
        this.swipeOrUpTO = null;
        this.lastGesture = null; // Reset if no gesture detected
        this.lastPosition = null;
        this.swipeMoved = false;
        this.currentX = 0;
      }, 250); // Adjust the delay (in milliseconds) as needed
    }
  }
  
 
  
  

  
  isOpenHandWithFingersSpread(landmarks) {
    const [thumbTip, indexTip, middleTip, ringTip, pinkyTip] = [
      landmarks[4],   // Thumb tip
      landmarks[8],   // Index finger tip
      landmarks[12],  // Middle finger tip
      landmarks[16],  // Ring finger tip
      landmarks[20],  // Pinky tip
    ];
  
    // Calculate distances between adjacent fingertips
    const distances = [
      this.distanceBetweenPoints(indexTip, middleTip),
      this.distanceBetweenPoints(middleTip, ringTip),
      this.distanceBetweenPoints(ringTip, pinkyTip)
    ];
  
    // Define a threshold for "spread" based on experimentation (you may need to adjust this value)
    const spreadThreshold = 0.085;
  
    // Check if each distance exceeds the threshold
    return distances.every((d) => d > spreadThreshold);
  }
  distanceBetweenPoints(point1, point2) {
    return Math.sqrt(
      Math.pow(point1.x - point2.x, 2) +
      Math.pow(point1.y - point2.y, 2) +
      Math.pow(point1.z - point2.z, 2)
    );
  }
  onGestureMissing() {
    if (!this.gestureStatus) return false;

    this.gestureStatus = 0
    this.scene.tweens.add({
      targets: this.gesture,
      scale: 0,
      ease: 'Back.In', // 'Cubic', 'Elastic', 'Bounce', 'Back'
      duration: 250
    });

    this.emitter.emit('sheild:deactivate');
    this.currentX=0;
    this.lastPosition=null;
  }
  onGestureIdentified(gesture) {
    // if(this.gesture.frame.name === gesture && this.gestureStatus == 1) return false;
    if (gesture == "None") {
      this.onGestureMissing();
      return false
    };

    this.gesture.setFrame(gesture);

    // if(this.gestureStatus) return false;


    if (Object.keys(this.gestureKeys).indexOf(gesture) != -1) {
      if (gesture === 'Pointing_Up') {
        window.isDoubleJump = true;
      }
      this.emitter.emit('gesture:activate', {
        'keyCode': this.gestureKeys[gesture]
      });
      this.emitter.emit('gesture:deactivate', {
        'keyCode': this.gestureKeys[gesture]
      });
    }


    if(this.gestureStatus!=1 || (this.gestureStatus==1 && (gesture==this.gesture.frame.name && ['swipe_left','swipe_right'].indexOf(gesture)==-1)))
    
      this.scene.tweens.add({
      targets: this.gesture,
      scale: {
        'from': 0,
        'to': this.scaleFact * 7
      },
      ease: 'Back.Out', // 'Cubic', 'Elastic', 'Bounce', 'Back'
      duration: 250
    });
    this.gestureStatus = 1;

  }
  decidePointingUp() {
    if (!this.swipeMoved) {
      this.lastGesture = 'Pointing_Up';
      this.onGestureIdentified(this.lastGesture);
    } else {
      console.log("Swipe Moved!", this.deltaX);
    }


    this.lastSwipeDirection = null;
    this.swipeOrUpTO = null;
    this.lastPosition = null;
    this.swipeMoved = false;
  }
  detectMovement() {
    const handLandmarks = this.results.landmarks[0]; // Assuming the first set of landmarks corresponds to the hand

    if (!handLandmarks) return false;

    this.currentX = handLandmarks[0].x; // Use the x-coordinate of the hand's central landmark (e.g., wrist or palm center)
    let moved = false;

    if (this.lastPosition) {
      this.deltaX = this.currentX - this.lastPosition.x;
      if (Math.abs(this.deltaX) > 0.03) {
        this.swipeMoved = true;
      }
      if (this.deltaX > 0.03 /* && this.lastSwipeDirection != 'left' */) { // Threshold to determine "right" movement
        this.onGestureIdentified('swipe_left');
        this.lastSwipeDirection = 'left';
        this.swipeOrUpTO && clearTimeout(this.swipeOrUpTO);
        this.lastMovementDetected = true; // Update last movement detected flag
      } else if (this.deltaX < -0.03 /* && this.lastSwipeDirection != 'right' */) { // Threshold to determine "left" movement
        this.onGestureIdentified('swipe_right');
        this.lastSwipeDirection = 'right';
        this.swipeOrUpTO && clearTimeout(this.swipeOrUpTO);
        this.lastMovementDetected = true; // Update last movement detected flag
      } else {
        this.lastMovementDetected = false; // Reset if no movement detected
      }
    }

    // Update lastPosition
    this.lastPosition = {
      x: this.currentX
    };
    // return moved;
  }

  addGesture() {
    this.gesture = this.create(
      this.c_w*.5,
        /* this.c_w - this.extraLeftPer - 800 * this.scaleFact, */
        this.extraTop + 2000 * this.scaleFact,
        'gestures'
      )
      .setScale(0)
      .setScrollFactor(0)
      .setDepth(1000);
  }

  update() {
    if (this.webcamRunning && Date.now() - this.lastUpdateTime >= 100) { // Throttle updates
      this.predictWebcam();
      this.lastUpdateTime = Date.now();
    }
      // this.predictWebcam();
    // this.predictWebcam();
  }
  onPaused(){
    
    this.onGestureMissing();
    this.scene.scene.pause();
    this.pausedTI= setInterval(this.resumeGameCheck.bind(this), 250)

  }
  onResume(){
    this.scene.scene.resume("Game");
    this.lastGesture=null;
    this.pausedTI && clearInterval(this.pausedTI)
  }
  resumeGameCheck(){
    this.predictWebcam();
  }
}