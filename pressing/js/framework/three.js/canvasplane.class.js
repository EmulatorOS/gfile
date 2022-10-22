/**
 * @file canvasplane.class.js
 * @version 1.1.0
 */

import * as THREE from '../../lib/three.js/three.module.js';

export default class CanvasPlane extends THREE.Mesh {
    constructor(resolutionX, resolutionY, scaleX = 1, scaleY = 1, offsetX = 0, offsetY = 0) {
        const canvas = document.createElement('canvas');
        canvas.width = resolutionX;
        canvas.height = resolutionY;

        const geometry = new THREE.PlaneGeometry(resolutionX, resolutionY);
        geometry.translate(resolutionX / 2 + offsetX, resolutionY / 2 + offsetY, 0);
        geometry.scale(scaleX, scaleY, 1);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true,
        });

        super(geometry, material);

        this._ctx2d = canvas.getContext('2d');
    }

    getContext2D() {
        return this._ctx2d;
    }

    updateTexture() {
        this.material.map.needsUpdate = true;
    }
}
