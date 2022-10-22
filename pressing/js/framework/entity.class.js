/**
 * @file entity.class.js
 * @version 1.1.0
 */

export default class Entity {
    static _init() {
        if (this !== Entity) {
            throw new Error('Static _init called from wrong class');
        }

        Entity._typeByName = new Map();
    }

    constructor(context, scene, options = {}) {
        this._scene = scene;

        this._destroyed = false;

        this.p_updatePriority = options.updatePriority === undefined ? 0 : options.updatePriority;

        scene.addEntity(this);
    }

    getScene() {
        return this._scene;
    }

    getDestroyed() {
        return this._destroyed;
    }

    destroy(context) {
        this._destroyed = true;
    }

    handleResize(context) {
    }

    update(context) {
    }

    static create(context, scene, options) {
        return new this(context, scene, options);
    }

    static p_register() {
        Entity._typeByName.set(this.name, this);
    }

    static getTypeByName(name) {
        const type = Entity._typeByName.get(name);
        if (type === undefined) {
            throw new Error(`Entity type "${name}" has not been registered`);
        }
        return type;
    }

    static updatePrioritySortFunc(a, b) {
        return b.p_updatePriority - a.p_updatePriority;
    }
}

Entity._init();
