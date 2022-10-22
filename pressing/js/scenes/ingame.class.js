/**
 * @file ingame.class.js
 * @version 1.0.0
 */

import Entity from '../framework/entity.class.js';
import ModelManager from '../framework/modelmanager.class.js';
import Scene from '../framework/scene.class.js';

import SimpleBlurMaterial from '../framework/three.js/simpleblurmaterial.class.js';

import * as THREE from '../lib/three.js/three.module.js';

export default class Ingame extends Scene {
    static _init() {
        Ingame._tmpV20 = new THREE.Vector2();
    }

    constructor(context) {
        super(context);

        let webgl2Available = false;
        try {
            const canvas = document.createElement('canvas');
            webgl2Available = !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
        } catch (e) {
        }

        this._renderTarget = webgl2Available ? new THREE.WebGLMultisampleRenderTarget(1024, 1024) : new THREE.WebGLRenderTarget(1024, 1024);

        this._tScenePost = new THREE.Scene();

        this._cameraPost = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -1, 1);
        this._tScenePost.add(this._cameraPost);

        this._materialBlur = new SimpleBlurMaterial();
        this._materialBlur.uniforms.blurSize.value = 0;

        const meshBlur = new THREE.Mesh(new THREE.PlaneGeometry(), this._materialBlur);

        this._blurAmount = 0;
        this._blurFade = 0;

        this._tScenePost.add(meshBlur);

        this._tScene = new THREE.Scene();
        this._tScene.name = 'Scene';

        const gltf = ModelManager.getModel('world');

        gltf.scene.children.slice(0).forEach(object => {
            this._tScene.add(object);
        });

        this._tScene.getObjectByName('RatArmature').traverse(object => {
            object.frustumCulled = false;
        });

        this._animations = Entity.getTypeByName('Animations').create(context, this);
        this._player = Entity.getTypeByName('Player').create(context, this);
        this._button = Entity.getTypeByName('Button').create(context, this);

        this._camera = this._player.getCamera();

        this._tScene.updateWorldMatrix(false, true);

        this._reset = true;
    }

    handleResize(context) {
        super.handleResize(context);

        const size = context.renderer.getSize(Ingame._tmpV20);

        this._renderTarget.setSize(size.x, size.y);

        this._materialBlur.setRenderTarget(this._renderTarget);
    }

    update(context) {
        super.update(context);

        if (this._reset) {
            this._reset = false;

            context.renderer.compile(this._tScene, this._camera);
            context.renderer.render(this._tScene, this._camera);

            this.reset(context);
        }

        if (this._blurAmount > 0) {
            this._blurAmount = Math.max(0, this._blurAmount - context.time.elapsedSeconds * this._blurFade);
            this._materialBlur.uniforms.blurSize.value = this._blurAmount;
        }

        context.renderer.setRenderTarget(this._renderTarget);
        context.renderer.render(this._tScene, this._camera);

        context.renderer.setRenderTarget(null);
        context.renderer.render(this._tScenePost, this._cameraPost);
    }

    reset(context) {
        this._animations.reset(context);
        this._player.reset(context);
        this._button.reset(context);

        this.setUnderwater(false);

        this._blurAmount = 0.3;
        this._blurFade = 0.3;
    }

    setUnderwater(isUnderwater) {
        this._materialBlur.uniforms.blurSize.value = isUnderwater ? 0.03 : 0;
        this._materialBlur.uniforms.blurColor.value.set(
            isUnderwater ? 0.3 : 1,
            isUnderwater ? 0.3 : 1,
            isUnderwater ? 2 : 1);
    }

    setBlurAmount(amount, fade) {
        this._blurAmount = amount;
        this._blurFade = fade;
    }

    getThreeScene() {
        return this._tScene;
    }
}

Ingame._init();
