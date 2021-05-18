class Game {
  getState(secret_word) {
    var gameStateRef = db.ref(`users/${secret_word}/game_state/`);
    gameStateRef.on("value", function (data) {
      gameState = data.val();
    });
  }

  update(state) {
    db.ref(`users/${secret_word}/`).update({
      game_state: state,
    });
  }

  async start() {
    // Cuando el usuario visite la página
    if (gameState === null) {
      welcome.display();
    }

    // //Cuando el usuario inicie sesión correctamente
    if (gameState === 0) {
      var playerCountRef = await db
        .ref(`users/${secret_word}/player_count/`)
        .once("value");

      if (playerCountRef.exists()) {
        playerCount = playerCountRef.val();
        player.getCount();
      }
    }
  }

  play() {
    Player.getPlayerInfo();
    player.getCarsAtEnd();

    if (allPlayers !== undefined) {
      background("#464646");
      image(track, 0, -height * 4, width, height * 5);

      //var display_position = 100;

      //índice de la matriz
      var index = 0;

      //posición x e y de los autos
      var x = width / 2 - 680;
      var y;

      for (var plr in allPlayers) {
        //agrega 1 para el índice de cada bucle 
        index = index + 1;

        //coloca los autos un poco alejados entre sí, en la dirección x
        x = x + 455;
        //utiliza datos de la base de datos, para mostrar los autos en la dirección y
        y = height - allPlayers[plr].distance;
        cars[index - 1].x = x;
        cars[index - 1].y = y;

        if (index === player.index) {
          stroke(10);
          fill("red");
          ellipse(x, y, 60, 60);
          cars[index - 1].shapeColor = "red";
          camera.position.x = width / 2;
          camera.position.y = cars[index - 1].y;
        }
      }
    }

    if (keyIsDown(UP_ARROW) && player.index !== null) {
      player.distance += 10;
      player.update();
    }

    if (player.distance > height * 5 - 100) {
      gameState = 2;
      player.rank += 1;
      Player.updateCarsAtEnd(player.rank);
      swal({
        title: `¡Genial!${"\n"}Rank${"\n"}${player.rank}`,
        text: "Llegaste a la meta con éxito",
        imageUrl:
          "https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-game/master/assets/cup.png",
        imageSize: "100x100",
        confirmButtonText: "Ok",
      });
    }

    drawSprites();
  }

  end() {}
}
