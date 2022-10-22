/**
 * @file app.class.js
 * @version 1.0.0
 */

import AudioManager from '../framework/audiomanager.class.js';
import ModelManager from '../framework/modelmanager.class.js';
import Time from '../framework/time.class.js';

import Context from './context.class.js';

import * as THREE from '../lib/three.js/three.module.js';

import Ingame from '../scenes/ingame.class.js';

import config from '../resources/config.js';
import resources from '../resources/resources.js';

export default class App {
    static _init() {
        App.version = '0.0.0';

        App._creditsVisible = false;

        window.addEventListener('load', () => {
            const elementLoading = document.querySelector('.loading');
            const elementCredits = document.querySelector('.credits');
            const linkShowCredits = document.querySelector('.show-credits');

            linkShowCredits.addEventListener('click', () => {
                App._creditsVisible = !App._creditsVisible;

                elementCredits.style.visibility = App._creditsVisible ? 'visible' : 'hidden';
            });

            const font = new FontFace(resources.font.name, `url(./fonts/${resources.font.path})`);

            font.load()
                .then(font => {
                    document.fonts.add(font);
                    return AudioManager.asyncLoadSounds();
                })
                .then(() => ModelManager.asyncLoadModels())
                .then(() => {
                    elementLoading.style.visibility = 'hidden';
                    linkShowCredits.style.visibility = 'visible';

                    AudioManager.asyncPlaySilenceOnUserGesture();

                    new App();
                });
        });
    }

    constructor() {
        this._time = new Time();

        this._clock = new THREE.Clock(false);

        this._canvas = document.querySelector('canvas');

        this._renderer = new THREE.WebGLRenderer({
            canvas: this._canvas,
            antialias: config.renderer.antialias,
            powerPreference: 'high-performance',
        });

        this._renderer.setPixelRatio(window.devicePixelRatio);

        this._context = new Context(this, this._time, this._renderer);

        this._scene = new Ingame(this._context);

        window.addEventListener('resize', this._handleResize.bind(this));
        this._handleResize();

        this._clock.start();
        this._renderer.setAnimationLoop(this._update.bind(this));
    }

    _handleResize() {
        this._renderer.setSize(window.innerWidth, window.innerHeight);

        if (this._scene !== null) {
            this._scene.handleResize(this._context);
        }
    }

    _update(time) {
        this._context.time.addElapsedSeconds(Math.min(this._clock.getDelta(), config.maxTimestep));

        if (this._scene !== null) {
            this._scene.update(this._context);
        }
    }

    static isCreditsVisible() {
        return App._creditsVisible;
    }

    static hideCredits() {
        document.querySelector('.show-credits').style.visibility = 'hidden';
    }
}

App._init();
