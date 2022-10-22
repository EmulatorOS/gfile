/**
 * @file player.class.js
 * @version 1.0.0
 */

import AudioManager from '../framework/audiomanager.class.js';
import Entity from '../framework/entity.class.js';
import ModelManager from '../framework/modelmanager.class.js';
import AnimationHelper from '../framework/three.js/animationhelper.class.js';

import * as THREE from '../lib/three.js/three.module.js';

export default class Player extends Entity {
    static _init() {
        Player._tmpV20 = new THREE.Vector2();
    }

    constructor(context, scene, options) {
        super(context, scene, options);

        const tScene = scene.getThreeScene();

        this._rig = tScene.getObjectByName('Camera');

        this._camera = new THREE.PerspectiveCamera(10, 1, 0.08, 150);
        this._camera.name = 'PlayerCamera';
        this._camera.rotateX(-Math.PI / 2);
        this._rig.add(this._camera);

        const gltf = ModelManager.getModel('world');

        this._animator = new AnimationHelper(this._rig, gltf.animations);

        this._cameraShake = 0;
    }

    handleResize(context) {
        super.handleResize(context);

        const size = context.renderer.getSize(Player._tmpV20);

        this._camera.aspect = size.x / size.y;
        this._camera.fov = 28.5;
        this._camera.updateProjectionMatrix();
    }

    update(context) {
        super.update(context);

        const dt = context.time.elapsedSeconds;

        this._animator.update(dt);

        if (this._cameraShake > 0) {
            this._rig.rotateX((Math.sin(context.time.totalSeconds * 17.72)
                * Math.sin(context.time.totalSeconds * 8)) * this._cameraShake);
            this._rig.rotateZ((Math.sin(context.time.totalSeconds * 16.56)) * this._cameraShake);

            this._cameraShake = Math.max(0, this._cameraShake - dt * 0.001);
        }
    }

    reset(context) {
        this._animator.playAction('PlayerLookButton', Infinity, 0, 0.5);
    }

    spiderScare() {
       this._animator.playAction('PlayerLookForward', 1, 0.5, 1, () => {
           this._animator.playAction('PlayerLookButton', Infinity, 0, 0.5);
       });
    }

    lose(context) {
        this._animator.playAction('PlayerLose', 1, 0.5);

        AudioManager.stop('music');

        context.time.setTimeout(() => {
            AudioManager.play('sound__flood', 1, false, true, 'flood');
        }, 500);

        context.time.setTimeout(() => {
            AudioManager.stop('flood');
            AudioManager.play('sound__underwater', 1, false, true, 'underwater');

            this.getScene().setUnderwater(true);
        }, 4400);
    }

    win() {
        this._animator.playAction('PlayerWin', 1, 0.5, 1, () => {
           this._animator.playAction('PlayerWinLoop');
        });

        this._cameraShake = 0.025;
    }

    getCamera() {
        return this._camera;
    }
}

Player._init();
Player.p_register();
