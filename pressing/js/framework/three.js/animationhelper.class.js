/**
 * @file animationhelper.class.js
 * @version 1.1.0
 */

import * as THREE from '../../lib/three.js/three.module.js';

export default class AnimationHelper {
    constructor(rootObject, animations) {
        this._animations = animations;

        this._mixer = new THREE.AnimationMixer(rootObject);
        this._mixer.addEventListener('finished', e => {
            if (e.action.finishedCallback !== null) {
                e.action.finishedCallback();
            }
        });

        this._action = null
    }

    update(elapsedSeconds) {
        this._mixer.update(elapsedSeconds);
    }

    stopAllAction() {
        this._mixer.stopAllAction();
    }

    playAction(animationName, repetitions = Infinity,
        crossFadeDuration = 0, timescale = 1, finishedCallback = null) {
        const animation = this._animations.find(animation => animation.name === animationName);
        if (animation === undefined) {
            throw new Error(`Animation "${animationName}" does not exist`);
        }

        const lastAction = this._action;

        this._action = this._mixer.clipAction(animation);
        this._action.stop();
        this._action.finishedCallback = finishedCallback;
        this._action.repetitions = repetitions;
        this._action.timeScale = timescale;
        this._action.clampWhenFinished = true;

        if (lastAction !== null) {
            if (crossFadeDuration > 0) {
                this._action.crossFadeFrom(lastAction, crossFadeDuration);
            } else {
                lastAction.stop();
            }
        }

        this._action.play();

        return this._action;
    }

    setTimeScale(value) {
        if (this._action !== null) {
            this._action.timeScale = value;
        }
    }

    getAction() {
        return this._action;
    }
}
