/**
 * @file simpleblurmaterial.class.js
 * @version 1.0.0
 */

import * as THREE from '../../lib/three.js/three.module.js';

const SimpleBlurShader = {
    uniforms: {
        tColor: { value: null },
        blurSize: { value: 0.01 },
        blurColor: { value: new THREE.Vector3(1, 1, 1) },
        aspect: { value: 1 },
    },
    vertexShader: `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,
    fragmentShader: `
const float STEP = 3.1415926538 * 2.0 / 8.0;

uniform sampler2D tColor;

uniform float blurSize;
uniform float aspect;

uniform vec3 blurColor;

varying vec2 vUv;

void main() {
    vec3 color = texture2D(tColor, vUv).rgb;

    for (int i = 0; i < 8; ++i) {
        float angle = float(i) * STEP;

        vec2 offset = vec2(
            cos(angle) * blurSize / aspect,
            sin(angle) * blurSize);

        color += texture2D(tColor, vUv + offset).rgb;
    }

    gl_FragColor = vec4(color / 9.0 * blurColor, 1.0);
}`,
};

export default class SimpleBlurMaterial extends THREE.ShaderMaterial {
    constructor(parameters) {
        super({
            type: 'SimpleBlurMaterial',
            uniforms: THREE.UniformsUtils.clone(SimpleBlurShader.uniforms),
            vertexShader: SimpleBlurShader.vertexShader,
            fragmentShader: SimpleBlurShader.fragmentShader,
            depthWrite: false,
        });
    }

    setRenderTarget(rt) {
        this.uniforms.tColor.value = rt.texture;
        this.uniforms.aspect.value = rt.width / rt.height;
    }
}
