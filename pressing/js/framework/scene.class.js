/**
 * @file scene.class.js
 * @version 1.0.0
 */

import Entity from './entity.class.js';

export default class Scene {
    constructor(context) {
        this._entities = [];
    }

    addEntity(entity) {
        if (!this._entities.includes(entity)) {
            this._entities.push(entity);
        }
    }

    clearEntities(context) {
        this._entities.forEach(entity => {
            entity.destroy(context);
        });

        this._entities.length = 0;
    }

    handleResize(context) {
        this._entities.forEach(entity => {
            entity.handleResize(context);
        });
    }

    findEntityOfType(type) {
        const entity = this._entities.find(entity => entity instanceof type);
        return entity === undefined ? null : entity;
    }

    update(context) {
        this._entities.sort(Entity.updatePrioritySortFunc);

        this._entities.forEach(entity => {
            if (!entity.getDestroyed()) {
                entity.update(context);
            }
        });

        for (let i = this._entities.length - 1; i > -1; i--) {
            const entity = this._entities[i];
            if (entity.getDestroyed()) {
                this._entities.splice(i, 1);
                this._entitiesToDraw.splice(this._entitiesToDraw.indexOf(entity), 1);
            }
        }
    }
}
