function setupRoomFlower1(scene, roomIndex, roomContainer) {
    gameObjects.exhibit.setBackgroundAtIndex(roomIndex, 'bgs', 'bg9');
    let flower = scene.add.image(300, gameVars.height-28, 'misc', 'flower1');
    flower.setOrigin(0.5, 1);
    roomContainer.add(flower);

    let subscription2;
    subscription2 = messageBus.subscribe('exhibitMove', (index) => {
        if (index === roomIndex) {
            subscription2.unsubscribe();
		    globalScene.tweens.add({
		        targets: gameObjects.generalDarkness,
		        alpha: 0.22,
		        duration: 4000
		    });
        }
    });
}

function setupRoomFlower2(scene, roomIndex, roomContainer) {
    gameObjects.exhibit.setBackgroundAtIndex(roomIndex, 'bgs', 'bg9');
    let flower = scene.add.image(300, gameVars.height-28, 'misc', 'flower2');
    flower.setOrigin(0.5, 1);
    roomContainer.add(flower);

    let subscription;
    subscription = messageBus.subscribe('exhibitMoveComplete', (index) => {
        if (index === roomIndex) {
            subscription.unsubscribe();
            gameObjects.exhibit.removeIndex(roomIndex - 1);
        }
    });

    let subscription2;
    subscription2 = messageBus.subscribe('exhibitMove', (index) => {
        if (index === roomIndex) {
            subscription2.unsubscribe();
		    globalScene.tweens.add({
		        targets: gameObjects.generalDarkness,
		        alpha: 0.35,
		        duration: 4000
		    });
        }
    });
}

function setupRoomFlower3(scene, roomIndex, roomContainer) {
    gameObjects.exhibit.setBackgroundAtIndex(roomIndex, 'bgs', 'bg9');
    let flower = scene.add.image(300, gameVars.height-28, 'misc', 'flower3');
    flower.setOrigin(0.5, 1);
    roomContainer.add(flower);

    let subscription;
    subscription = messageBus.subscribe('exhibitMoveComplete', (index) => {
        if (index === roomIndex) {
            subscription.unsubscribe();
            gameObjects.exhibit.removeIndex(roomIndex - 1);
        }
    });

    let subscription2;
    subscription2 = messageBus.subscribe('exhibitMove', (index) => {
        if (index === roomIndex) {
            subscription2.unsubscribe();
		    globalScene.tweens.add({
		        targets: gameObjects.generalDarkness,
		        alpha: 0.48,
		        duration: 4000
		    });
        }
    });
}

function setupRoomFlower4(scene, roomIndex, roomContainer) {
    gameObjects.exhibit.setBackgroundAtIndex(roomIndex, 'bgs', 'bg9');
    let flower = scene.add.image(300, gameVars.height-28, 'misc', 'flower4');
    flower.setOrigin(0.5, 1);
    roomContainer.add(flower);

    let subscription;
    subscription = messageBus.subscribe('exhibitMoveComplete', (index) => {
        if (index === roomIndex) {
            subscription.unsubscribe();
            gameObjects.exhibit.removeIndex(roomIndex - 1);
        }
    });

    let subscription2;
    subscription2 = messageBus.subscribe('exhibitMove', (index) => {
        if (index === roomIndex) {
            subscription2.unsubscribe();
		    globalScene.tweens.add({
		        targets: gameObjects.generalDarkness,
		        alpha: 0.6,
		        duration: 4000
		    });
        }
    });
}

function setupRoomFlower5(scene, roomIndex, roomContainer) {
    gameObjects.exhibit.setBackgroundAtIndex(roomIndex, 'bgs', 'bg9');
    let flower = scene.add.image(300, gameVars.height-28, 'misc', 'flower5');
    flower.setOrigin(0.5, 1);
    roomContainer.add(flower);

    let subscription;
    subscription = messageBus.subscribe('exhibitMoveComplete', (index) => {
        if (index === roomIndex) {
            subscription.unsubscribe();
            gameObjects.exhibit.removeIndex(roomIndex - 1);
        }
    });

    let subscription2;
    subscription2 = messageBus.subscribe('exhibitMove', (index) => {
        if (index === roomIndex) {
        	gameObjects.roomJackObjs.lightsReady = true;
            subscription2.unsubscribe();
		    gameObjects.roomJackObjs.lights = scene.add.image(0, gameVars.halfHeight, 'roomJack', 'lights2');
		    gameObjects.roomJackObjs.lights.scaleX = 2.1;
		    gameObjects.roomJackObjs.lights.scaleY = 2.1;
		    gameObjects.roomJackObjs.roomContainer.add(gameObjects.roomJackObjs.lights);
		    gameObjects.roomJackObjs.lights.alpha = 0.6;

            gameVarsTemp.startDarkFlicker = false;
    		gameObjects.generalDarkness.alpha = 0;
            gameObjects.generalDarkness.scaleX = 0;
            gameObjects.generalDarkness.scaleY = 0;
		    globalScene.tweens.add({
		        targets: gameObjects.roomJackObjs.lights,
		        alpha: 0.7,
		        scaleX: 2,
		        scaleY: 2,
		        duration: 3000
		    });
        }
    });
}
