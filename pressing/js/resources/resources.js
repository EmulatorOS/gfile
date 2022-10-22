/**
 * @file resources.js
 * @version 1.0.0
 */

const resources = {
    font: {
        name: 'DefaultFont',
        path: 'Recursive-SemiBold.ttf',
    },
    models: {
        world: {
            path: 'world.glb',
            type: 'gltf',
        },
    },
    sounds: {
        music__ending: {
            path: 'music__ending.wav',
            count: 1,
            baseVolume: 0.4,
            type: 'audio/wav',
        },
        music__ingame: {
            path: 'music__ingame.mp3',
            count: 1,
            baseVolume: 0.5,
            type: 'audio/mp3',
        },
        sound__alarm: {
            path: 'sound__alarm.wav',
            count: 1,
            baseVolume: 1,
            type: 'audio/wav',
        },
        sound__creak: {
            path: 'sound__creak.wav',
            count: 1,
            baseVolume: 0.5,
            type: 'audio/wav',
        },
        sound__button_press: {
            path: 'sound__button_press.wav',
            count: 3,
            baseVolume: 1,
            type: 'audio/wav',
        },
        sound__button_release: {
            path: 'sound__button_release.wav',
            count: 3,
            baseVolume: 1,
            type: 'audio/wav',
        },
        sound__correct: {
            path: 'sound__correct.wav',
            count: 1,
            baseVolume: 0.8,
            type: 'audio/wav',
        },
        sound__countdown: {
            path: 'sound__countdown.wav',
            count: 3,
            baseVolume: 0.3,
            type: 'audio/wav',
        },
        sound__flood: {
            path: 'sound__flood.mp3',
            count: 1,
            baseVolume: 0.6,
            type: 'audio/mp3',
        },
        sound__surface: {
            path: 'sound__surface.wav',
            count: 1,
            baseVolume: 1,
            type: 'audio/wav',
        },
        sound__switch: {
            path: 'sound__switch.wav',
            count: 3,
            baseVolume: 0.7,
            type: 'audio/wav',
        },
        sound__underwater: {
            path: 'sound__underwater.wav',
            count: 1,
            baseVolume: 1,
            type: 'audio/wav',
        },
        sound__wrong: {
            path: 'sound__wrong.wav',
            count: 1,
            baseVolume: 1,
            type: 'audio/wav',
        },
        sound__spider: {
            path: 'sound__spider.wav',
            count: 1,
            baseVolume: 1,
            type: 'audio/wav',
        },
        sound__scare: {
            path: 'sound__scare.wav',
            count: 1,
            baseVolume: 1,
            type: 'audio/wav',
        },
    },
};

export default resources;
