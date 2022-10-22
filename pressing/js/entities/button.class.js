/**
 * @file button.class.js
 * @version 1.0.0
 */

import AudioManager from '../framework/audiomanager.class.js';
import Entity from '../framework/entity.class.js';

import CanvasPlane from '../framework/three.js/canvasplane.class.js';

import App from '../game/app.class.js';

import * as THREE from '../lib/three.js/three.module.js';

export default class Button extends Entity {
    static _init() {
        Button._materialIndicatorOn = new THREE.MeshPhongMaterial({
            color: new THREE.Color(0x00c000),
            emissive: new THREE.Color(0x00c000),
            emissiveIntensity: 0.8,
        });
        Button._materialIndicatorOff = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0),
        });
        Button._materialIndicatorAlarm = new THREE.MeshPhongMaterial({
            color: new THREE.Color(0xff0000),
            emissive: new THREE.Color(0xff0000),
            emissiveIntensity: 0.8,
        });
        Button._materialButtonOn = new THREE.MeshPhongMaterial({
            color: new THREE.Color(0x00ff00),
            emissive: new THREE.Color(0x00ff00),
            emissiveIntensity: 0.15,
        });
        Button._materialButtonOff = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0),
        });
        Button._materialButtonAlarm = new THREE.MeshPhongMaterial({
            color: new THREE.Color(0xff0000),
            emissive: new THREE.Color(0xff0000),
            emissiveIntensity: 0.5,
        });
        Button._materialButtonInfo = new THREE.MeshPhongMaterial({
            color: new THREE.Color(0x008800),
            emissive: new THREE.Color(0x008800),
            emissiveIntensity: 0.5,
        });

        Button._gameOverMessages = ['fatal failure', 'deadly deviation', 'baneful blunder', 'mortal miss', 'final flub', 'grave goof', 'terminal trap'];
        Button._lightIntensity = 2;
    }

    constructor(context, scene, options) {
        super(context, scene, options);

        this._sprites = document.querySelector('.sprites');

        this._player = scene.findEntityOfType(Entity.getTypeByName('Player'));
        this._animations = scene.findEntityOfType(Entity.getTypeByName('Animations'));

        this._mouseHeld = false;

        const buttonElement = document.querySelector('.button');

        buttonElement.addEventListener('mousedown', e => {
            if (e.button === 0) {
                this._mouseHeld = true;
            }
        }, false);

        buttonElement.addEventListener('mouseup', e => {
            if (e.button === 0) {
                this._mouseHeld = false;
            }
        }, false);

        buttonElement.addEventListener('touchstart', e => {
            this._mouseHeld = true;
        }, false);

        buttonElement.addEventListener('touchend', e => {
            this._mouseHeld = false;
        }, false);

        buttonElement.addEventListener('touchcancel', () => {
            this._mouseHeld = false;
        }, false);

        const tScene = scene.getThreeScene();

        this._button = tScene.getObjectByName('Button');
        const indicator = tScene.getObjectByName('Indicator');

        this._indicators = [indicator];

        for (let i = 1; i < 40; i++) {
            const newIndicator = indicator.clone();
            newIndicator.rotation.set(0, Math.PI * 2 / 40 * i, 0);
            this._indicators.push(newIndicator);
            tScene.add(newIndicator);
        }

        this._light0 = tScene.getObjectByName('Light000_Orientation');
        this._light1 = tScene.getObjectByName('Light001_Orientation');

        this._light0.decay = 6;

        this._light0.originalColor = this._light0.color.clone();
        this._light1.originalColor = this._light1.color.clone();

        this._canvasPlane = new CanvasPlane(512, 512, 0.66 / 512, 0.66 / 512, -256, -256);
        this._canvasPlane.rotateX(Math.PI / 2);
        this._canvasPlane.rotateZ(Math.PI);
        this._canvasPlane.rotateY(Math.PI);
        this._canvasPlane.position.y = 0.32;
        this._button.add(this._canvasPlane);

        this._targetLightIntensity = null;

        this._commands = null;
        this._command = null;
        this._lastCommand = null;
        this._commandDuration = null;
        this._commandSeconds = null;
        this._firstCommandUpdate = null;

        this._presses = null;
        this._pressed = null;

        this._jumpscareDone = false;

        this._lightTheme = null;
    }

    update(context) {
        super.update(context);

        const dt = context.time.elapsedSeconds;

        this._light1.intensity = this._targetLightIntensity < this._light1.intensity ?
            Math.max(this._targetLightIntensity, this._light1.intensity - 20 * dt * Button._lightIntensity) :
            Math.min(this._targetLightIntensity, this._light1.intensity + 20 * dt * Button._lightIntensity);

        Button._materialButtonOn.emissiveIntensity = this._command !== null && this._command.disableFlash ? 0.15
            : 0.35 - this._animations.getButtonHeight() * 0.2;

        this._updateTimer(context);

        if (this._command === null) {
            return;
        }

        const lastCommandSeconds = this._commandSeconds;

        const i0 = Math.floor(this._commandSeconds / this._commandDuration / 0.1);
        this._commandSeconds = this._commandSeconds - dt;
        const i1 = Math.floor(this._commandSeconds / this._commandDuration / 0.1);

        if (this._commandSeconds > 0 && i0 !== i1) {
            AudioManager.play('sound__countdown');
        }

        let pressChange = this._firstCommandUpdate;

        if (this._command.getState === undefined) {
            this._mouseHeld = false;
        }

        if (this._mouseHeld !== this._pressed) {
            this._pressed = this._mouseHeld;

            pressChange = true;

            if (this._pressed) {
                AudioManager.play('sound__button_press');

                this._animations.buttonPress();
            } else {
                AudioManager.play('sound__button_release');

                this._animations.buttonRelease();
            }
        }

        if (this._animations.wasButtonFullyDepressed()) {
           this._presses++;

           pressChange = true;
        }

        if (this._command.update !== undefined) {
            this._command.update(lastCommandSeconds, this._commandSeconds, this._presses, this._pressed, pressChange);
            this._firstCommandUpdate = false;
        }

        const timeout = this._commandSeconds <= 0;
        const state = this._command.getState === undefined ? timeout ? true : null
            : this._command.getState(timeout, this._presses, this._pressed);

        if (state !== null) {
            this._setLightTheme('off');

            this._clearCanvas();

            AudioManager.play('sound__switch');

            this._animations.buttonRelease();

            const command = this._command;
            const delay = command.getDelay === undefined ? 1000 + Math.random() * 1500 : command.getDelay();
            this._lastCommand = command;
            this._command = null;

            context.time.setTimeout(() => {
                if (command.isFinal) {
                    this._win(context);
                } else if (state) {
                    AudioManager.play('sound__correct');

                    this._nextCommand();
                } else {
                    this._lose(context);
                }
            }, delay);
        }
    }

    reset(context) {
        this._createCommands(context);

        this._light0.color.copy(this._light0.originalColor);
        this._light1.color.copy(this._light1.originalColor);

        this._light1.intensity = 0;

        this._targetLightIntensity = 0;

        this._setLightTheme('off');

        this._clearCanvas();

        context.time.setTimeout(() => {
            this._nextCommand(true);
        }, 2000);
    }

    _updateTimer(context) {
        const t = this._lightTheme === 'off' || this._commandSeconds <= 0 ? 0
            : this._commandSeconds / this._commandDuration;
        const n = Math.floor(t * this._indicators.length);

        this._indicators.forEach((indicator, i) => {
            if (this._lightTheme === 'alarm') {
                indicator.material = ((context.time.totalSeconds * 20 + i) % 10) < 4
                    ? Button._materialIndicatorOff : Button._materialIndicatorAlarm;
            } else {
                indicator.material = n <= i ? Button._materialIndicatorOff : Button._materialIndicatorOn;
            }
        });
    }

    _setLightTheme(theme) {
        if (theme === this._lightTheme) {
            return;
        }

        this._lightTheme = theme;

        this._light0.intensity = theme === 'off' ? 0 : 2;

        this._button.material = theme === 'off' ? Button._materialButtonOff : theme === 'on' ?
            Button._materialButtonOn : theme === 'info' ? Button._materialButtonInfo : Button._materialButtonAlarm;
    }

    _lose(context) {
        AudioManager.play('sound__wrong');

        this._setLightTheme('alarm');

        this._clearCanvas();

        const message = Button._gameOverMessages[Math.floor(Math.random() * Button._gameOverMessages.length)];

        this._drawText(message, 0, -34);
        this._drawSprite(3, 0, 68); // Skull

        this._targetLightIntensity = 30 * Button._lightIntensity;

        this._light0.color.setHex(0xff0000);
        this._light1.color.setHex(0xff0000);

        this._player.lose(context);
        this._animations.lose();

        context.time.setTimeout(() => {
            this._targetLightIntensity = 0;
        }, 7000);

        context.time.setTimeout(() => {
            this.getScene().reset(context);
        }, 11500);
    }

    _win(context) {
        AudioManager.stop('music');

        context.time.setTimeout(() => {
            AudioManager.play('sound__flood');
        }, 1000);

        context.time.setTimeout(() => {
            this._light0.color.setHex(0xff0000);
            this._light1.color.setHex(0xff0000);

            this._setLightTheme('alarm');

            this._player.win();
        }, 2000);

        for (let i = 0; i < 14; i++) {
            context.time.setTimeout(() => {
                this._clearCanvas();

                AudioManager.play('sound__countdown');

                this._drawText('ascending', 0, -32);
                this._drawText(`${'='.repeat(i)}>`, 0, 32);
            }, 2000 + i * 500);
        }

        context.time.setTimeout(() => {
            this._clearCanvas();

            this._drawText('you did great!', 0, -40);

            this._drawSprite(9, 0, 64); // Skull or smile
        }, 10000);

        context.time.setTimeout(() => {
            this._clearCanvas();

            this._drawText('shutting down');
        }, 13000);

        context.time.setTimeout(() => {
            this._clearCanvas();

            this._setLightTheme('off');

            this._light0.intensity = 0;
            this._targetLightIntensity = 0;
        }, 18000);

        context.time.setTimeout(() => {
            AudioManager.play('sound__surface');
        }, 21000);

        context.time.setTimeout(() => {
            this._animations.win();
        }, 24000);

        context.time.setTimeout(() => {
            AudioManager.play('sound__creak');

            this.getScene().setBlurAmount(0.05, 0.007);
        }, 25000);

        context.time.setTimeout(() => {
            this._targetLightIntensity = 40 * Button._lightIntensity;

            this._light1.decay = 0.001;
            this._light1.position.set(-5, 5, 0);
            this._light1.color.setHex(0xffd065);
        }, 28000);

        context.time.setTimeout(() => {
            AudioManager.play('music__ending', 1, true);
        }, 30000);

        context.time.setTimeout(() => {
            this._animations.animateRat('RatEnding');
        }, 36000);

        context.time.setTimeout(() => {
            document.querySelector('.the-end').style.visibility = 'visible';
        }, 46000);
    }


    _nextCommand(first = false) {
        if (!first) {
            App.hideCredits();

            AudioManager.play('music__ingame', 1, true, false, 'music');
        }

        this._animations.wasButtonFullyDepressed();

        this._clearCanvas();

        this._command = this._commands.shift();
        this._commandDuration = 0;
        this._command.setup();
        this._commandSeconds = this._commandDuration;
        this._firstCommandUpdate = true;

        this._mouseHeld = false;

        this._presses = 0;
        this._pressed = false;

        if (first) {
            this._light1.position.set(0, 0.5, 0);
            this._light1.distance = 9;
        } else {
            this._light1.position.set(0, 0, -0.5);
            this._light1.distance = 0;
        }

        this._targetLightIntensity = 20 * Button._lightIntensity;

        this._setLightTheme(this._command.getState === undefined ? 'info' : 'on');

        AudioManager.play('sound__switch');
    }

    _createCommands(context) {
        const defaultDuration = 6;

        const groupOrder = [0, 1, 1, 8, 25, 5, 9, 3, 10, 2, 11, 5, 3, 12, 2, 13, 4, 27, 23, 14, 5, 5,
            28, 3, 15, 24, 16, 6, 5, 17, 7, 3, 18, 4, 2, 7, 19, 5, 7, 5, 20, 21, 26, 22];

        const cats = 2 + Math.floor(Math.random() * 5);
        const subtracted = Math.floor(Math.random() * 5);
        const targetHour = 3 + Math.floor(Math.random() * 6);
        let pressesRemaining0 = 2 + Math.floor(Math.random() * 5);
        let pressesRemaining1 = 4 + Math.floor(Math.random() * 8);
        let pressesRemaining2 = 200;
        let pressesRemaining3 = 10;
        let holdingDuration = 0;
        let timeUntilSpider = null;
        let isHuman = null;
        let likeJumpscares = false;

        const groups = [[{ // Group 0
            setup: () => {
                this._drawSprite(10, 0, 0, 500, 500); // Title
            },
            update: (lastSeconds, seconds, presses, pressed, pressChange) => {
                if (lastSeconds > -4 && seconds <= -4) {
                    this._drawText('press', 0, 185, 40);
                }
            },
            getState: (timeout, presses, pressed) => presses === 0 ? null : true,
        }], [{ // Group 1
            presses: 1,
            setup: () => {
                this._commandDuration = defaultDuration;

                this._drawText('press');
            },
            getState: (timeout, presses, pressed) => presses === 0 && !timeout ? null : presses > 0,
        }, {
            presses: 0,
            setup: () => {
                this._commandDuration = defaultDuration * 0.75;

                this._drawText('do not press');
            },
            getState: (timeout, presses, pressed) => presses === 0 && !timeout ? null : presses === 0,
        }], [{ // Group 2
            setup: () => {
                this._commandDuration = defaultDuration * 2.5;

                this._drawText('press once for each', 0, -32, 39);
                this._drawText('word in this sentence', 0, 32, 37);
            },
            getState: (timeout, presses, pressed) => !timeout ? null : presses === 8,
        }, {
            setup: () => {
                this._commandDuration = defaultDuration;

                this._drawText('press less than 2 times', 0, 0, 34);
            },
            getState: (timeout, presses, pressed) => !timeout ? null : presses < 2,
        }, {
            setup: () => {
                this._commandDuration = defaultDuration * 1.5;

                this._drawText('press more than 5 times', 0, 0, 35);
            },
            getState: (timeout, presses, pressed) => !timeout ? null : presses > 5,
        }], [{ // Group 3
            setup: () => {
                this._commandDuration = defaultDuration * 1.2;

                this._drawText('press once per corner', 0, -36, 38);
                this._drawSprite(6, 0, 68); // Circle
            },
            getState: (timeout, presses, pressed) => !timeout ? null : presses === 0,
        }, {
            setup: () => {
                this._commandDuration = defaultDuration * 1.2;

                this._drawText('press once per corner', 0, -36, 38);
                this._drawSprite(5, 0, 68); // Triangle
            },
            getState: (timeout, presses, pressed) => !timeout ? null : presses === 3,
        }, {
            setup: () => {
                this._commandDuration = defaultDuration * 1.5;

                this._drawText('press once per corner', 0, -36, 38);
                this._drawSprite(4, 0, 68); // Square
            },
            getState: (timeout, presses, pressed) => !timeout ? null : presses === 4,
        }, {
            setup: () => {
                this._commandDuration = defaultDuration * 2.5;

                this._drawText('press once per corner', 0, -44, 38);
                this._drawSprite(7, 0, 86); // Star
            },
            getState: (timeout, presses, pressed) => !timeout ? null : presses === 10,
        }], [{ // Group 4
            setup: () => {
                this._commandDuration = defaultDuration;

                this._drawText('press if you\'re a human', 0, 0, 36);
            },
            getState: (timeout, presses, pressed) => {
                if (presses === 0 && !timeout) {
                    return null;
                }

                if (isHuman === null) {
                    isHuman = presses > 0 ? true : null;
                    return true;
                } else {
                    return isHuman === (presses > 0);
                }
            },
        }, {
            setup: () => {
                this._targetPresses = [0, Infinity];
                this._commandDuration = defaultDuration;
                this._waitForTimeout = false;

                this._drawText('press if you\'re a robot', 0, 0, 36);
            },
            getState: (timeout, presses, pressed) => {
                if (presses === 0 && !timeout) {
                    return null;
                }

                if (isHuman === null) {
                    isHuman = presses > 0 ? false : null;
                    return true;
                } else {
                    return isHuman === (presses === 0);
                }
            },
        }], [{ // Group 5
            setup: () => {
                this._commandDuration = defaultDuration;

                this._drawText('double press');
            },
            getState: (timeout, presses, pressed) => presses < 2 && !timeout ? null : presses === 2,
        }, {
            setup: () => {
                this._commandDuration = defaultDuration;

                this._drawText('press twice');
            },
            getState: (timeout, presses, pressed) => presses < 2 && !timeout ? null : presses === 2,
        }, {
            setup: () => {
                this._commandDuration = defaultDuration * 0.5;

                this._drawText('would you kindly not press', 0, 0, 32);
            },
            getState: (timeout, presses, pressed) => presses === 0 && !timeout ? null : presses === 0,
        }, {
            setup: () => {
                this._commandDuration = defaultDuration;

                this._drawText('press and hold');
            },
            getState: (timeout, presses, pressed) => !timeout ? null : pressed,
        }, {
            setup: () => {
                this._commandDuration = defaultDuration * 2;

                this._drawText(`press 1+2+3-${subtracted} times`, 0, 0, 42);
            },
            getState: (timeout, presses, pressed) => !timeout ? null : presses === 6 - subtracted,
        }, {
            setup: () => {
                this._commandDuration = defaultDuration / 2;

                this._drawText('quickly don\'t press!!!', 0, 0, 40);
            },
            getState: (timeout, presses, pressed) => presses === 0 && !timeout ? null : presses === 0,
        }, {
            setup: () => {
                this._commandDuration = defaultDuration;
            },
            update: (lastSeconds, seconds, presses, pressed, pressChange) => {
                if (pressChange) {
                    this._clearCanvas();

                    this._drawText(`${pressesRemaining0 - presses} presses remaining`, 0, 0, 40);
                }
            },
            getState: (timeout, presses, pressed) => !timeout ? null : presses === pressesRemaining0,
        }], [{ // Group 6
            setup: () => {
                this._commandDuration = defaultDuration;
            },
            update: (lastSeconds, seconds, presses, pressed, pressChange) => {
                if (pressChange) {
                    this._clearCanvas();

                    this._drawText(`${pressesRemaining1 - presses} presses remaining`, 0, 0, 40);

                    this._drawSprite(1); // Spider
                }
            },
            getState: (timeout, presses, pressed) => presses === 0 && !timeout ? null : presses === 0,
        }], [{ // Group 7
            setup: () => {
                this._commandDuration = defaultDuration * 1.5;

                this._drawText('press and hold', 0, -32, 43);
                this._drawText('longer than 2 seconds', 0, 32, 37);
            },
            update: (lastSeconds, seconds, presses, pressed, pressChange) => {
                if (pressed) {
                    const last = holdingDuration;
                    holdingDuration += lastSeconds - seconds;
                }
            },
            getState: (timeout, presses, pressed) => !timeout && holdingDuration <= 2 ? null : holdingDuration > 2,
        }, {
            setup: () => {
                this._drawText('press and hold until', 0, -32, 38);
                this._drawText('you see a spider', 0, 32, 40);
            },
            update: (lastSeconds, seconds, presses, pressed, pressChange) => {
                if (timeUntilSpider === null) {
                    if (pressed) {
                        timeUntilSpider = 15;

                        this._clearCanvas();
                    }
                } else {
                    const last = timeUntilSpider;
                    timeUntilSpider -= lastSeconds - seconds;

                    if (timeUntilSpider < 10 && last >= 10) {
                        this._drawText('release');
                    }

                    if (timeUntilSpider < 7 && last >= 7) {
                        this._clearCanvas();
                    }

                    if (timeUntilSpider < 5 && last >= 5) {
                        this._drawText('stop!');
                    }

                    if (timeUntilSpider < 2 && last >= 2) {
                        this._clearCanvas();
                    }

                    if (timeUntilSpider < 0 && last >= 0) {
                        this._drawSprite(1); // Spider
                    }
                }
            },
            getState: (timeout, presses, pressed) => timeUntilSpider === null || pressed ? null : timeUntilSpider <= 0,
        }, {
            setup: () => {
                this._commandDuration = 8;

                this._drawText('p____');
            },
            update: (lastSeconds, seconds, presses, pressed, pressChange) => {
                if (seconds < 6 && lastSeconds >= 6) {
                    this._clearCanvas();
                    this._drawText('p___s');
                }

                if (seconds < 5 && lastSeconds >= 5) {
                    this._clearCanvas();
                    this._drawText('pr__s');
                }

                if (seconds < 4 && lastSeconds >= 4) {
                    this._clearCanvas();
                    this._drawText('pr_ss');
                }

                if (seconds < 3 && lastSeconds >= 3) {
                    this._clearCanvas();
                    this._drawText('press');
                }
            },
            getState: (timeout, presses, pressed) => presses === 0 && !timeout ? null : this._commandSeconds < 3 && presses > 0,
        }], [{ // Group 8
            setup: () => {
                this._commandDuration = defaultDuration * 0.75;

                this._drawText('same as last');

                this._animations.animateRat('RatWalk');
            },
            getState: (timeout, presses, pressed) => presses === 0 && !timeout ? null
                : this._lastCommand.presses > 0 ? presses > 0 : presses === 0,
        }], [{ // Group 9
            setup: () => {
                this._commandDuration = defaultDuration * 0.75;

                this._drawText('always press when', 0, -32, 40);
                this._drawText('you see a rat', 0, 32, 40);
            },
        }], [{ // Group 10
            setup: () => {
                this._commandDuration = defaultDuration;

                this._drawText('do not press');
                this._drawSprite(0, 0, 64, 160, 160); // Rat
            },
            getState: (timeout, presses, pressed) => presses === 0 && !timeout ? null : presses > 0,
        }], [{ // Group 11
            setup: () => {
                this._commandDuration = defaultDuration * 0.75;

                this._drawText('press when cats are even', 0, 0, 33);
            },
        }], [{ // Group 12
            setup: () => {
                this._commandDuration = defaultDuration * 1.2;

                for (let i = 0; i < cats; i++) {
                    this._drawSprite(2, -cats * 32 + i * 64 + 32, 0, 80, 80); // Cat
                }
            },
            getState: (timeout, presses, pressed) => presses === 0 && !timeout ? null : cats % 2 === 0 ? presses > 0 : presses === 0,
        }], [{ // Group 13
            setup: () => {
                this._commandDuration = defaultDuration * 0.75;

                this._drawText('never press when', 0, -32, 43);
                this._drawText('you see a spider', 0, 32, 43);
            },
        }], [{ // Group 14
            setup: () => {
                this._commandDuration = defaultDuration * 1.5;

                this._drawText('press once per cat earlier', 0, 0, 32);
            },
            getState: (timeout, presses, pressed) => !timeout ? null : presses === cats,
        }], [{ // Group 15
            setup: () => {
                this._commandDuration = defaultDuration * 0.75;

                this._drawText('the next statement is a lie', 0, 0, 32);
            },
        }], [{ // Group 16
            setup: () => {
                this._commandDuration = defaultDuration * 2;

                this._drawText('do press');
            },
            getState: (timeout, presses, pressed) => presses === 0 && !timeout ? null : presses === 1,
        }], [{ // Group 17
            setup: () => {
                this._commandDuration = defaultDuration;

                this._drawText('press to pay respect', 0, 0, 41);
            },
            getState: (timeout, presses, pressed) => presses === 0 && !timeout ? null : true,
        }], [{ // Group 18
            setup: () => {
                this._commandDuration = defaultDuration * 1.25;
                this._drawText('do not press');

                this._animations.animateRat('RatStandButton', true);
            },
            getState: (timeout, presses, pressed) => {
                const state = presses === 0 && !timeout ? null : presses === 1;
                if (state) {
                    this._animations.animateRat('RatLeaveButton');
                }
                return state;
            },
        }], [{ // Group 19
            setup: () => {
                this._commandDuration = defaultDuration * 3;
            },
            update: (lastSeconds, seconds, presses, pressed, pressChange) => {
                if (pressChange || seconds < 1 && lastSeconds >= 1) {
                    this._clearCanvas();

                    if (presses === 200) {
                        this._drawText('are you a wizard', 0, 0, 40);
                    } else if (seconds < 1) {
                        this._drawText('close enough');
                    } else {
                        this._drawText(`about ${pressesRemaining2 - presses} presses remaining`, 0, 0, 30);
                    }
                }
            },
            getState: (timeout, presses, pressed) => !timeout ? null : true,
            disableFlash: true,
        }], [{ // Group 20
            setup: () => {
                this._commandDuration = 20;

                this._drawText('press after half-time', 0, 0, 38);
            },
            update: (lastSeconds, seconds, presses, pressed, pressChange) => {
                if (seconds < 13 && lastSeconds >= 13) {
                    this._animations.spiderScare();
                    this._player.spiderScare();
                }
                if (seconds < 12 && lastSeconds >= 12) {
                    this.getScene().setBlurAmount(0.03, 0.02);
                }
                if (seconds < 12 && lastSeconds >= 12) {
                    AudioManager.play('sound__spider');
                }
                if (seconds < 8 && lastSeconds >= 8) {
                    this._animations.hideSpider();
                }
            },
            getState: (timeout, presses, pressed) => !timeout ? null : presses === 0,
        }], [{ // Group 21
            setup: () => {
                this._commandDuration = defaultDuration * 4;
            },
            update: (lastSeconds, seconds, presses, pressed, pressChange) => {
                if (Math.floor(seconds * 4) !== Math.floor(lastSeconds * 4)) {
                    this._clearCanvas();

                    this._drawText('press more than', 0, -128, 38);
                    this._drawText('once per corner', 0, -74, 38);

                    let firstX = null;
                    let firstY = null;
                    let lastX = null;
                    let lastY = null;

                    for (let i = 0; i < 10; i++) {
                        const a = Math.random() * Math.PI * 2;
                        const r = 120 + Math.random();

                        const x = Math.cos(a) * r;
                        const y = 80 + Math.sin(a) * r;
                        if (i === 0) {
                            firstX = x;
                            firstY = y;
                            lastX = x;
                            lastY = y;
                        } else {
                            this._drawLine(x, y, lastX, lastY, 5);
                            lastX = x;
                            lastY = y;
                        }

                        if (i === 9) {
                            this._drawLine(x, y, firstX, firstY, 5);
                        }
                    }
                }
            },
            getState: (timeout, presses, pressed) => !timeout ? null : presses >= 16,
            disableFlash: true,
        }], [{ // Group 22
            setup: () => {
                this._drawText('press to ascend');
            },
            getState: (timeout, presses, pressed) => presses === 0 ? null : true,
            isFinal: true,
        }], [{ // Group 23
            setup: () => {
                this._commandDuration = defaultDuration * 1.75;
            },
            update: (lastSeconds, seconds, presses, pressed, pressChange) => {
                if (pressChange) {
                    this._clearCanvas();

                    this._drawText('what time is it?', 0, 40, 30);

                    this._drawCircle(0, 0, 228, 5, 8);

                    for (let i = 0; i < 12; i++) {
                        const a = i / 12 * Math.PI * 2;
                        const x = Math.sin(a) * 180;
                        const y = -Math.cos(a) * 180;

                        this._drawSprite(targetHour === i ? 9 : 3, x, y, 96, 96); // Skull or smile

                        if (presses % 12 === i) {
                            this._drawLine(0, 0, x * 0.8, y * 0.8, 8);
                        }
                    }
                }
            },
            getState: (timeout, presses, pressed) => !timeout ? null : (presses % 12) === targetHour,
        }], [{ // Group 24
            setup: () => {
                this._commandDuration = defaultDuration * 0.75;

                this._drawText('the next command is wrong', 0, 0, 32);
            },
        }], [{ // Group 25
            setup: () => {
                this._commandDuration = defaultDuration * 0.75;

                this._drawText('remember this number', 0, -32, 37);
                this._drawText(Math.floor(Math.random() * 100).toString(), 0, 32, 50);
            },
        }], [{ // Group 26
            setup: () => {
                this._commandDuration = defaultDuration;

                this._drawText('press if you', 0, -32, 40);
                this._drawText('remember the number', 0, 32, 39);
            },
            update: (lastSeconds, seconds, presses, pressed, pressChange) => {
                if (pressChange && presses > 0) {
                    this._clearCanvas();

                    this._drawText('good memory', 0, 0, 40);

                    this._commandSeconds = Math.min(this._commandSeconds, 2);
                }
            },
            getState: (timeout, presses, pressed) => !timeout ? null : true,
        }], [{ // Group 27
            setup: () => {
                this._commandDuration = defaultDuration;

                this._drawText('press if you like', 0, -32, 40);
                this._drawText('jumpscares', 0, 32, 45);
            },
            update: (lastSeconds, seconds, presses, pressed, pressChange) => {
                if (pressChange && presses > 0) {
                    likeJumpscares = true;
                }
            },
            getState: (timeout, presses, pressed) => {
                if (presses > 0 || timeout) {
                    likeJumpscares = presses > 0;
                    if (!this._jumpscareDone && presses > 0) {
                        AudioManager.stop('music');
                    }
                    return true;
                }
                return null;
            },
            getDelay: () => {
                return likeJumpscares && !this._jumpscareDone ? 8000 : 2000;
            },
        }], [{ // Group 28
            setup: () => {
                this._commandDuration = defaultDuration * 2;
            },
            update: (lastSeconds, seconds, presses, pressed, pressChange) => {
                if (pressChange) {
                    this._clearCanvas();

                    this._drawText(`${pressesRemaining3 - presses} presses remaining`, 0, 0, 39);
                }
            },
            getState: (timeout, presses, pressed) => {
                if (likeJumpscares && presses > 7) {
                    this._animations.jumpscare();
                    this.getScene().setBlurAmount(0.05, 0.5);
                    this._jumpscareDone = true;

                    return true;
                }

                return !timeout ? null : presses === pressesRemaining3;
            },
            getDelay: () => {
                return likeJumpscares ? 5000 : 2000;
            },
        }]];

        const shuffled = groups.map(group => {
            const a = [];

            while (group.length > 0) {
                a.push(group.splice(Math.floor(Math.random() * group.length), 1)[0]);
            }

            return a;
        });

        const groupIndex = shuffled.map(() => 0);

        this._commands = groupOrder.map(group => shuffled[group][groupIndex[group]++]);
    }

    _clearCanvas() {
        const ctx = this._canvasPlane.getContext2D();

        ctx.clearRect(0, 0, 512, 512);

        this._canvasPlane.updateTexture();
    }

    _drawText(text, offsetX = 0, offsetY = 0, fontSize = 50) {
        const ctx = this._canvasPlane.getContext2D();

        const upperCase = text.toUpperCase();

        ctx.font = `${fontSize}px DefaultFont`;
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#ffffff10';
        ctx.lineJoin = 'round';

        for (let i = 0; i < 5; i++) {
            ctx.lineWidth = 4 + i * i;
            ctx.strokeText(upperCase, 256 + offsetX, 268 + offsetY);
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillText(upperCase, 256 + offsetX, 268 + offsetY);

        this._canvasPlane.updateTexture();
    }

    _drawSprite(index, offsetX = 0, offsetY = 0, sizeX = 256, sizeY = 256) {
        const ctx = this._canvasPlane.getContext2D();

        const sx = index % 4 * 512;
        const sy = Math.floor(index / 4) * 512;

        ctx.drawImage(this._sprites, sx, sy, 512, 512, 256 - sizeX / 2 + offsetX, 256 - sizeY / 2 + offsetY, sizeX, sizeY);

        this._canvasPlane.updateTexture();
    }

    _drawLine(x0, y0, x1, y1, lineWidth) {
        const ctx = this._canvasPlane.getContext2D();

        ctx.strokeStyle = '#ffffff10';

        ctx.beginPath();

        ctx.moveTo(x0 + 256, y0 + 256);
        ctx.lineTo(x1 + 256, y1 + 256);

        for (let i = 0; i < 5; i++) {
            ctx.lineWidth = lineWidth + 4 + i * i;
            ctx.stroke();
        }

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = lineWidth;
        ctx.stroke();

        this._canvasPlane.updateTexture();
    }

    _drawCircle(x, y, radius, lineWidth) {
        const ctx = this._canvasPlane.getContext2D();

        ctx.strokeStyle = '#ffffff10';

        ctx.beginPath();

        ctx.arc(x + 256, y + 256, radius, 0, Math.PI * 2);

        for (let i = 0; i < 5; i++) {
            ctx.lineWidth = lineWidth + 4 + i * i;
            ctx.stroke();
        }

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = lineWidth;
        ctx.stroke();

        this._canvasPlane.updateTexture();
    }
}

Button._init();
Button.p_register();
