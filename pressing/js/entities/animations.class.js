/**
 * @file animations.class.js
 * @version 1.0.0
 */

import AnimationHelper from '../framework/three.js/animationhelper.class.js';
import AudioManager from '../framework/audiomanager.class.js';
import Entity from '../framework/entity.class.js';
import ModelManager from '../framework/modelmanager.class.js';

import * as THREE from '../lib/three.js/three.module.js';

export default class Animations extends Entity {
    constructor(context, scene, options) {
        super(context, scene, options);

        const tScene = scene.getThreeScene();

        this._jumpscareSeconds = 0;

        this._openingSeconds = null;

        this._buttonPressed = false;
        this._buttonLowering = false;
        this._buttonFullyPressed = false;
        this._buttonHeight = 0;

        this._ratRig = tScene.getObjectByName('RatArmature');

        const gltf = ModelManager.getModel('world');

        this._ratAnimator = new AnimationHelper(this._ratRig, gltf.animations);

        this._spider = tScene.getObjectByName('Spider');

        this._cat = tScene.getObjectByName('Cat');
        this._cat.frustumCulled = false;

        this._button = tScene.getObjectByName('Button');

        this._hullLower = tScene.getObjectByName('HullLower');
        this._hullUpper = tScene.getObjectByName('HullUpper');

        this._whirlpool = tScene.getObjectByName('Whirlpool');
        this._whirlpool.material.opacity = 0.8;
        this._whirlpool.material.transparent = true;

        this._ocean = tScene.getObjectByName('Ocean');

        this._ocean.material = new THREE.MeshPhongMaterial({
            color: 0x002647,
            emissive: 0x000b47,
            specular: 0x00005e,
            shininess: 1,
        });

        this._skybox = tScene.getObjectByName('Skybox');
        this._skybox.frustumCulled = false;
        this._skybox.material = new THREE.MeshBasicMaterial({
            map: this._skybox.material.map,
            side: THREE.DoubleSide,
        });
    }

    update(context) {
        super.update(context);

        const dt = context.time.elapsedSeconds;

        if (this._jumpscareSeconds > 0) {
            this._jumpscareSeconds -= dt;

            const targetAngle = 3 * (this._jumpscareSeconds > 1);

            this._cat.visible = this._jumpscareSeconds > 0;
            this._cat.rotation.x = this._cat.rotation.x * 0.85 + targetAngle * 0.15;
        }

        if (this._ratRig.visible) {
            this._ratAnimator.update(dt);
        }

        if (this._openingSeconds !== null) {
            this._openingSeconds += dt;

            this._hullUpper.rotation.set(Math.min(Math.PI, (this._openingSeconds / 6) ** 10), 0, 0);

            if (this._whirlpool.visible) {
                this._whirlpool.position.set(0, this._openingSeconds > 4.5 ? -100 : this._openingSeconds - 2.2, 0);
                this._whirlpool.rotation.set(0, context.time.totalSeconds * 10, 0);
            }
        }

        const lastButtonHeight = this._buttonHeight;
        this._buttonHeight = Math.max(0, Math.min(1, this._buttonHeight + (this._buttonLowering ? -dt : dt) * 15));
        if (this._buttonHeight === 0 && lastButtonHeight > 0) {
            this._buttonFullyPressed = true;
        }
        if (!this._buttonPressed && this._buttonHeight === 0) {
            this._buttonLowering = false;
        } else if (this._buttonPressed && this._buttonHeight === 1) {
            this._buttonLowering = true;
        }

        this._button.position.y = (1 - this._buttonHeight) * -0.07;

        if (this._ocean.visible) {
            this._ocean.rotateY(dt * 0.05);

            this._hullLower.rotation.set(0, 0, Math.sin(context.time.totalSeconds) * 0.1);
        }
    }

    reset(context) {
        this._openingSeconds = null;

        this._buttonPressed = false;
        this._buttonLowering = false;
        this._buttonFullyPressed = false;
        this._buttonHeight = 1;

        this._ratRig.visible = false;
        this._spider.visible = false;
        this._ocean.visible = false;
        this._cat.visible = false;
        this._skybox.visible = false;

        this._hullUpper.rotation.set(0, 0, 0);
        this._whirlpool.position.set(0, -100, 0);
        this._whirlpool.scale.set(1, 0.2, 1);
        this._button.position.y = 0;
        this._spider.visible = false;
    }

    animateRat(animation, repeat = false) {
        this._ratRig.visible = true;

        this._ratAnimator.playAction(animation, repeat ? Infinity : 1, 0, 1, () => {
            if (animation !== 'RatEnding') {
                this._ratRig.visible = false;
            }
        });
    }

    spiderScare() {
        this._spider.visible = true;
    }

    hideSpider() {
        this._spider.visible = false;
    }

    jumpscare() {
        AudioManager.play('sound__scare');

        this._jumpscareSeconds = 2;
    }

    lose() {
        this._openingSeconds = 0;
    }

    win() {
        this._openingSeconds = 0;

        this._whirlpool.visible = false;
        this._skybox.visible = true;
        this._ocean.visible = true;
    }

    buttonPress(context) {
        this._buttonPressed = true;
    }

    buttonRelease(context) {
        this._buttonPressed = false;
    }

    getButtonHeight() {
        return this._buttonHeight;
    }

    wasButtonFullyDepressed() {
        const temp = this._buttonFullyPressed;
        this._buttonFullyPressed = false;
        return temp;
    }
}

Animations.p_register();
