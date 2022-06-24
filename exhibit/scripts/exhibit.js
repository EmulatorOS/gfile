class Exhibit {
    constructor(scene, bgContainer, shadowContainer, foregroundContainer, btnContainer, darkContainer, mask) {
        this.scene = scene;
        this.listOfBGs = [];
        this.listOfShadows = [];
        this.listOfForegrounds = [];
        this.listOfBtnCtnrs = [];
        this.listOfDarks = [];
        this.listOfLists = [
            this.listOfBGs,
            this.listOfShadows,
            this.listOfForegrounds,
            this.listOfBtnCtnrs,
            this.listOfDarks
        ]
        this.listOfCantMove = [
            false, false
        ];
        this.resetListOfCantMove();
        this.currentScene = 1;
        this.leftImage = null;
        this.centerImage = null;
        this.rightImage = null;
        this.bgContainer = bgContainer;
        this.shadowContainer = shadowContainer;
        this.foregroundContainer = foregroundContainer;
        this.btnContainer = btnContainer;
        this.darkContainer = darkContainer;
        this.isMoving = false;

        this.peekAmt = 80;
        this.centerSpot = gameVars.halfWidth;
        this.leftSpot = -gameVars.halfWidth - this.peekAmt;
        this.rightSpot = gameVars.halfWidth + gameVars.width + this.peekAmt;

        this.mask = mask
        gameVars.lateUpdateCurrentScene = 1; // start at 1
        messageBus.subscribe('exhibitMoveComplete', (index) => {
            gameVars.lateUpdateCurrentScene = index;
        });

    }

    initPos(pos) {
        this.currentScene = pos;
        for (let i = 0; i < this.listOfLists.length; i++) {
            let currList = this.listOfLists[i];
            //this.leftImage = currList[this.currentScene - 1];
            if (currList[this.currentScene]) {
                this.centerImage = currList[this.currentScene];
                this.centerImage.x = gameVars.halfWidth;
            }
            //this.rightImage = currList[this.currentScene + 1];
        }
    }

    moveLeft() {
        // TEMPORARY HACK
        gameVarsTemp.hasMoved = true;
        if (this.needCleanup) {
            updateInfoTextSoft('Clean up the room first.', 2250);
            return;
        }
        if (gameVars.darkPoint && this.currentScene >= 3) {
            this.needCleanup = true;
        }

        // Player moves to the left, thus moving all images to the right
        if (this.currentScene > 0 && !this.isMoving) {
            disableMoveButtons();
            this.isMoving = true;
            let oldScene = this.currentScene;
            this.currentScene--;

            while (!this.listOfBGs[this.currentScene]) {
                // keep shifting until we get the right one
                this.currentScene--;
                if (this.currentScene < 0) {
                    return;
                }
            }
            messageBus.publish('exhibitMove', this.currentScene, oldScene);
            messageBus.publish('exhibitMoveLeft', this.currentScene, oldScene);

            gameObjects.exhibCntr.swayAccX = -0.8;
            for (let i = 0; i <this.listOfLists.length; i++) {
                let currentList = this.listOfLists[i];
                this.shiftListLeft(currentList, this.currentScene, oldScene, i === 0);
            }
            gameObjects.flashDim.brightVal = 0.1;
        }
    }

    shiftListLeft(list, newSceneNum, oldSceneNum, isMain) {

        let animateSpeed = gameVars.walkSlow ? 3300 : 1500;
        // right image just teleports to where it's supposed to be.
        // this.leftImage = list[this.currentScene - 1];
        // this.leftImage.x = this.rightSpot;

        this.centerImage = list[newSceneNum]; // on the left
        if (this.centerImage) {
            this.centerImage.x = this.leftSpot;
            // center image goes right
            this.shiftAnimCenter = this.scene.tweens.timeline({
                targets: this.centerImage,
                tweens: [
                    {
                        ease: "Cubic.easeInOut",
                        x: this.centerSpot,
                        duration: animateSpeed
                    }
                ]
            });
        }
        this.rightImage = list[oldSceneNum]; // at the center
        if (this.rightImage) {
            this.rightImage.x = this.centerSpot;
            // left image goes center
            this.shiftAnimRight = this.scene.tweens.timeline({
                targets: this.rightImage,
                tweens: [
                {
                    ease: "Cubic.easeInOut",
                    x: this.rightSpot,
                    duration: animateSpeed,
                    onComplete: () => {
                        if (isMain) {
                            this.isMoving = false;
                            gameObjects.exhibCntr.swayAccX = -0.08;
                            gameObjects.exhibCntr.swayAccY = 0.05;
                            gameObjects.exhibCntr.swayAmt = 0.025;
                            messageBus.publish('exhibitMoveComplete', this.currentScene);

                            if (this.listOfCantMove[newSceneNum]) {
                                if (newSceneNum !== 0) {
                                    // at furthest left, can't move
                                    enableMoveLeftButton();
                                }
                            } else {
                                if (newSceneNum === 0) {
                                    enableMoveRightButton();
                                } else {
                                    enableMoveButtons();                                
                                }
                            }
                        }
                    }
                }
                ]
            });
        }
    }

    moveRight(fast) {
        gameVarsTemp.hasMoved = true;
        // Player moves to the right, thus moving all images to the left
        if (this.currentScene < this.listOfBGs.length - 1 && !this.isMoving) {
            disableMoveButtons();
            this.isMoving = true;
            let oldScene = this.currentScene;
            this.currentScene++;
            while (!this.listOfBGs[this.currentScene]) {
                // keep shifting until we get the right one
                this.currentScene++;
                if (this.currentScene >= this.listOfBGs.length) {
                    return;
                }
            }

            messageBus.publish('exhibitMove', this.currentScene, oldScene);
            messageBus.publish('exhibitMoveRight', this.currentScene, oldScene);

            gameObjects.exhibCntr.swayAccX = 0.8;
            for (let i = 0; i <this.listOfLists.length; i++) {
                let currentList = this.listOfLists[i];
                this.shiftListRight(currentList, this.currentScene, oldScene, i === 0, fast);
            }
            gameObjects.flashDim.brightVal = 0.1;
        }
    }

    shiftListRight(list, newSceneNum, oldSceneNum, isMain, fast) {
        let animateSpeed = gameVars.walkSlow ? 3500 : 1500;

        if (fast) {
            animateSpeed = 1;
        }
        // right image just teleports to where it's supposed to be.
        // this.leftImage = list[this.currentScene - 1];
        // this.leftImage.x = this.rightSpot;

        this.centerImage = list[newSceneNum]; // on the right
        if (this.centerImage) {
            this.centerImage.x = this.rightSpot;
            // center image goes right
            this.shiftAnimCenter = this.scene.tweens.timeline({
                targets: this.centerImage,
                tweens: [
                    {
                        ease: "Cubic.easeInOut",
                        x: this.centerSpot,
                        duration: animateSpeed
                    }
                ]
            });
        }
        this.leftImage = list[oldSceneNum]; // at the center
        if (this.leftImage) {
            this.leftImage.x = this.centerSpot;
            // left image goes center
            this.shiftAnimRight = this.scene.tweens.timeline({
                targets: this.leftImage,
                tweens: [
                {
                    ease: "Cubic.easeInOut",
                    x: this.leftSpot,
                    duration: animateSpeed,
                    onComplete: () => {
                        if (isMain) {
                            this.isMoving = false;
                            gameObjects.exhibCntr.swayAccX = fast ? 0.01 : 0.08;
                            gameObjects.exhibCntr.swayAccY = fast ? 0.01 : 0.05;
                            gameObjects.exhibCntr.swayAmt = 0.025;
                            messageBus.publish('exhibitMoveComplete', this.currentScene);

                            if (this.listOfCantMove[newSceneNum]) {
                                enableMoveLeftButton();
                            } else {
                                enableMoveButtons();
                            }
                        }
                    }
                }
                ]
            });
        }
    }

    setBackgroundAtIndex(x, ref, atlasRef) {
        let newImage = this.scene.add.sprite(-9999, gameVars.halfHeight, ref, atlasRef);
        this.bgContainer.add(newImage);
        if (this.listOfBGs[x]) {
            this.listOfBGs[x].destroy();
        }
        this.listOfBGs[x] = newImage;
        if (x === this.currentScene) {
            this.listOfBGs[x].x = this.centerSpot;
        }

    }

    setShadowAtIndex(x, ref) {
        let newImage = this.scene.add.sprite(-9999, gameVars.halfHeight, ref);
        this.shadowContainer.add(newImage);
        if (this.listOfShadows[x]) {
            this.listOfShadows[x].destroy();
        }
        this.listOfShadows[x] = newImage;
        if (x === this.currentScene) {
            this.listOfShadows[x].x = this.centerSpot;
        }
    }

    setForegroundAtIndex(x, ref, atlasRef, yVal) {
        let yPos = yVal || gameVars.halfHeight;
        let newImage = this.scene.add.sprite(-9999, yPos, ref, atlasRef);
        newImage.setDepth(5);
        this.foregroundContainer.add(newImage);
        if (this.listOfForegrounds[x]) {
            this.listOfForegrounds[x].destroy();
        }
        this.listOfForegrounds[x] = newImage;
        if (x === this.currentScene) {
            this.listOfForegrounds[x].x = this.centerSpot;
        }
    }

    addBtnCtnrToIndex(x, btnCtnr) {
        btnCtnr.x = -9999;
        this.btnContainer.add(btnCtnr);
        if (this.listOfBtnCtnrs[x]) {
            if (this.currentScene === x) {
                // move aside the old button container
                this.listOfBtnCtnrs[x].x = -9999;
            }
        }
        this.listOfBtnCtnrs[x] = btnCtnr;
    }

    removeBtnCtnrFromIndex(x) {
        this.listOfBtnCtnrs[x] = [];
    }

    setDarkAtIndex(x, ref){
        let newImage = this.scene.add.sprite(-9999, gameVars.halfHeight, ref);
        newImage.mask = this.mask;
        this.darkContainer.add(newImage);
        if (this.listOfDarks[x]) {
            this.listOfDarks[x].destroy();
        }
        this.listOfDarks[x] = newImage;
        if (x === this.currentScene) {
            this.listOfDarks[x].x = this.centerSpot;
        }
    }

    removeDarkAtIndex(x) {
        if (this.listOfDarks[x]) {
            this.listOfDarks[x].destroy();
        }
    }

    removeIndex(x) {
        this.listOfBGs[x] = null;
        this.listOfShadows[x] = null;
        this.listOfForegrounds[x] = null;
        this.listOfBtnCtnrs[x] = null;
        this.listOfDarks[x] = null;
    }

    // initially just false, false
    resetListOfCantMove() {
        this.listOfCantMove = [
            false, false,
            true, true, true, true, true, true, 
            false, false, false, false, false, true, true, true, true
        ];

        // this.listOfCantMove = [
        //     false, false,
        //     false, false, false, false, false,
        //     false, false, false, false, false, false, false, false, false, false
        // ];
    }

    setCantMoveIdx(idx, val = false) {
        this.listOfCantMove[idx] = val;
    }

    getCurrentScene() {
        return this.currentScene;
    }

    update() {

    }
}
