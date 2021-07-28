import { gameBoard } from "./gameBoard.js";
import { ship } from "./ship.js";

const playerGB = gameBoard();
const cpuGB = gameBoard();

let playerShips = [
  ship("Carrier", 5),
  ship("Battleship", 4),
  ship("Destroyer", 3),
  ship("Submarine", 3),
  ship("Patrol Boat", 2),
];
let cpuShips = [
  ship("Carrier", 5),
  ship("Battleship", 4),
  ship("Destroyer", 3),
  ship("Submarine", 3),
  ship("Patrol Boat", 2),
];

let isGameOver = false;
let isPlayerTurn = true;

const cpuAttackHitLocation = { x: null, y: null, tried: 0 };

function checkCoordinateValidity(gameboard, item, x, y, isRotated) {
  const shipLength = item.getShipLength();
  if (gameboard.getBoardArray()[x][y] !== "ocean") {
    return false;
  }

  if (isRotated) {
    if (x + shipLength - 1 > 9) {
      return false;
    } else {
      for (let i = -1; i <= shipLength; i++) {
        if (
          gameboard.getBoardArray()[x + i < 0 || x + i > 9 ? x : x + i][
            y + 1 > 9 ? y : y + 1
          ] !== "ocean" ||
          gameboard.getBoardArray()[x + i < 0 || x + i > 9 ? x : x + i][y] !==
            "ocean" ||
          gameboard.getBoardArray()[x + i < 0 || x + i > 9 ? x : x + i][
            y - 1 < 0 ? y : y - 1
          ] !== "ocean"
        ) {
          return false;
        }
      }
    }
  } else {
    if (y + shipLength - 1 > 9) {
      return false;
    } else {
      for (let i = -1; i <= shipLength; i++) {
        if (
          gameboard.getBoardArray()[x + 1 > 9 ? x : x + 1][
            y + i < 0 || y + i > 9 ? y : y + i
          ] !== "ocean" ||
          gameboard.getBoardArray()[x][y + i < 0 || y + i > 9 ? y : y + i] !==
            "ocean" ||
          gameboard.getBoardArray()[x - 1 < 0 ? x : x - 1][
            y + i < 0 || y + i > 9 ? y : y + i
          ] !== "ocean"
        ) {
          return false;
        }
      }
    }
  }

  return true;
}

function positioningOfShips(gb, ships) {
  function randomizeStuff() {
    let xRandom = Math.floor(Math.random() * 10);
    let yRandom = Math.floor(Math.random() * 10);
    let rotationRandom = !!Math.floor(Math.random() * 2);
    return { xRandom, yRandom, rotationRandom };
  }

  ships.forEach((item) => {
    let isValid = false;
    let {
      xRandom: x,
      yRandom: y,
      rotationRandom: isRotated,
    } = randomizeStuff();
    while (!isValid) {
      if (checkCoordinateValidity(gb, item, x, y, isRotated)) {
        isValid = true;
      } else {
        ({
          xRandom: x,
          yRandom: y,
          rotationRandom: isRotated,
        } = randomizeStuff());
      }

      item.getShipLength();
    }
    gb.setShipCoordinates(item, x, y, isRotated);
  });
}

function gameLoop() {
  const main = document.querySelector("main");
  main.classList.remove("main-element");
  main.classList.add("game-main");
  const playerTablePlaceholder = document.createElement("div");
  const cpuTablePlaceholder = document.createElement("div");

  playerTablePlaceholder.dataset.name = "Computer is attacking...";
  cpuTablePlaceholder.dataset.name = "Player is attacking...";

  if (!document.querySelector(".game-status")) {
    const gameStatus = document.createElement("div");
    gameStatus.className = "game-status";
    gameStatus.textContent = "Your turn";
    main.append(gameStatus);
  } else {
    const gameStatus = document.querySelector(".game-status");
    gameStatus.textContent = `${isPlayerTurn ? "Your" : "Computer's"} turn.`;
  }

  playerTablePlaceholder.classList.add(
    "table-placeholder",
    "placeholder-player"
  );
  cpuTablePlaceholder.classList.add("table-placeholder", "placeholder-cpu");

  if (isPlayerTurn) {
    cpuTablePlaceholder.classList.add("turn");
  } else playerTablePlaceholder.classList.add("turn");

  main.append(playerTablePlaceholder, cpuTablePlaceholder);

  const playerTable = document.createElement("table");
  const cpuTable = document.createElement("table");

  playerTable.classList.add("table-player");
  cpuTable.classList.add("table-cpu");

  function generateTable(placeholder, gb, table) {
    let i = 0;
    gb.getBoardArray().forEach((row) => {
      let j = 0;
      const tableRow = document.createElement("tr");
      table.append(tableRow);
      row.forEach((ele) => {
        const data = document.createElement("td");

        if (table.classList.contains("table-player")) {
          if (
            gb.getBoardArray()[i][j] &&
            typeof gb.getBoardArray()[i][j] === "object"
          ) {
            data.classList.add("occupied");
          }
        }

        if (gb.getBoardArray()[i][j] === "miss") {
          data.classList.add("miss");
        } else if (gb.getBoardArray()[i][j].isSunk) {
          data.classList.add("sunk");
        } else if (gb.getBoardArray()[i][j].isHit) {
          data.classList.add("hit");
        }

        if (isPlayerTurn && table.classList.contains("table-cpu")) {
          data.addEventListener("click", (e) => {
            tileClickEvent(e, gb);
          });
        }
        data.dataset.x = i;
        data.dataset.y = j;
        tableRow.append(data);
        j++;
      });
      i++;
    });
    placeholder.append(table);
  }

  generateTable(playerTablePlaceholder, playerGB, playerTable);
  generateTable(cpuTablePlaceholder, cpuGB, cpuTable);

  if (!isPlayerTurn) {
    cpuAttack(playerGB);
  }
}

function cpuAttack(gb) {
  const gameStatus = document.querySelector(".game-status");

  function randomCoordinate() {
    return Math.floor(Math.random() * 10);
  }

  let xCpuAttack;
  let yCpuAttack;
  let isValidCoordinate = false;

  if (
    typeof cpuAttackHitLocation.x === "number" &&
    typeof cpuAttackHitLocation.y === "number"
  ) {
    const chance = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ];
    while (!isValidCoordinate) {
      const chanced = chance[cpuAttackHitLocation.tried];
      cpuAttackHitLocation.tried = cpuAttackHitLocation.tried + 1;
      xCpuAttack = cpuAttackHitLocation.x + chanced[0];
      yCpuAttack = cpuAttackHitLocation.y + chanced[1];

      if (cpuAttackHitLocation.tried >= 4) {
        cpuAttackHitLocation.tried = 0;
        xCpuAttack = randomCoordinate();
        yCpuAttack = randomCoordinate();
      }
      isValidCoordinate = checkAttackValidity(gb, xCpuAttack, yCpuAttack);
    }
  } else {
    xCpuAttack = randomCoordinate();
    yCpuAttack = randomCoordinate();
    isValidCoordinate = checkAttackValidity(gb, xCpuAttack, yCpuAttack);
    while (!isValidCoordinate) {
      xCpuAttack = randomCoordinate();
      yCpuAttack = randomCoordinate();
      isValidCoordinate = checkAttackValidity(gb, xCpuAttack, yCpuAttack);
    }
  }

  const attackInfo = gb.receiveAttack(xCpuAttack, yCpuAttack);

  if (attackInfo === "miss") {
    hitMissEvent(xCpuAttack, yCpuAttack, attackInfo);
    gameStatus.textContent = `${
      isPlayerTurn ? "You have" : "Computer has"
    } attacked ${`${+xCpuAttack + 1}${String.fromCharCode(
      +yCpuAttack + 65
    )}`}. It was a miss.`;
    isPlayerTurn = !isPlayerTurn;
  } else if (attackInfo === "hit") {
    cpuAttackHitLocation.x = xCpuAttack;
    cpuAttackHitLocation.y = yCpuAttack;
    cpuAttackHitLocation.tried = 0;
    hitMissEvent(xCpuAttack, yCpuAttack, attackInfo);
    gameStatus.textContent = `${
      isPlayerTurn ? "You have" : "Computer has"
    } attacked ${`${+xCpuAttack + 1}${String.fromCharCode(
      +yCpuAttack + 65
    )}`}. It was a hit.`;
    isPlayerTurn = !!isPlayerTurn;
  } else {
    cpuAttackHitLocation.x = null;
    cpuAttackHitLocation.y = null;
    cpuAttackHitLocation.tried = 0;
    isGameOver = sinkingEvent(xCpuAttack, yCpuAttack, gb);
    isPlayerTurn = !!isPlayerTurn;
  }

  const tablePlaceholders = document.querySelectorAll(".table-placeholder");

  if (isGameOver) {
    tablePlaceholders.forEach((item) => {
      item.classList.remove("turn");
    });
    gameOverEvent("player");
  } else {
    if (isPlayerTurn) {
      setTimeout(() => {
        tablePlaceholders[1].classList.add("turn");
        document
          .querySelectorAll(".table-placeholder")
          .forEach((item) => item.remove());
        gameLoop();
      }, 1500);
    } else {
      setTimeout(() => {
        tablePlaceholders.forEach((item) => {
          item.classList.remove("turn");
        });
        tablePlaceholders[0].classList.add("turn");
        document
          .querySelectorAll(".table-placeholder")
          .forEach((item) => item.remove());
        gameLoop();
      }, 2000);
    }
  }
}
function checkAttackValidity(gb, x, y) {
  if (!(x >= 0 && x <= 9) || !(y >= 0 && y <= 9)) return false;
  if (
    gb.getBoardArray()[x][y] !== "miss" &&
    (gb.getBoardArray()[x][y] === "ocean" || !gb.getBoardArray()[x][y].isHit)
  ) {
    return true;
  } else return false;
}

function hitMissEvent(x, y, info) {
  const table = isPlayerTurn ? "table-cpu" : "table-player";
  const trNodeArray = Array.from(document.querySelectorAll(`.${table} tr`));
  trNodeArray[x].childNodes[y].classList.add(info);
}

function tileClickEvent(e, gb) {
  const gameStatus = document.querySelector(".game-status");
  const attackInfo = gb.receiveAttack(+e.target.dataset.x, +e.target.dataset.y);

  if (attackInfo === "hit") {
    e.target.classList.add("hit");
    gameStatus.textContent = `${
      isPlayerTurn ? "You have" : "Computer has"
    } attacked ${`${+e.target.dataset.x + 1}${String.fromCharCode(
      +e.target.dataset.y + 65
    )}`}. It was a hit.`;
    isPlayerTurn = !!isPlayerTurn;
  } else if (attackInfo === "miss") {
    e.target.classList.add("miss");
    gameStatus.textContent = `${
      isPlayerTurn ? "You have" : "Computer has"
    } attacked ${`${+e.target.dataset.x + 1}${String.fromCharCode(
      +e.target.dataset.y + 65
    )}`}. It was a miss.`;
    isPlayerTurn = !isPlayerTurn;
  } else {
    isGameOver = sinkingEvent(e.target.dataset.x, e.target.dataset.y, gb);
    isPlayerTurn = !!isPlayerTurn;
  }

  const tablePlaceholders = document.querySelectorAll(".table-placeholder");

  tablePlaceholders.forEach((item) => {
    item.classList.remove("turn");
  });

  if (isGameOver) {
    gameOverEvent("player");
  } else {
    if (isPlayerTurn) {
      tablePlaceholders[1].classList.add("turn");
      setTimeout(() => {
        document
          .querySelectorAll(".table-placeholder")
          .forEach((item) => item.remove());
        gameLoop();
      }, 800);
    } else {
      tablePlaceholders[0].classList.add("turn");
      setTimeout(() => {
        document
          .querySelectorAll(".table-placeholder")
          .forEach((item) => item.remove());
        gameLoop();
      }, 2000);
    }
  }
}

function sinkingEvent(x, y, gb) {
  const gameStatus = document.querySelector(".game-status");
  const table = isPlayerTurn ? "table-cpu" : "table-player";

  const trNodeArray = Array.from(document.querySelectorAll(`.${table} tr`));

  const tdNodeList = document.querySelectorAll(`.${table} td`);
  tdNodeList.forEach((node) => {
    if (
      gb.getBoardArray()[node.dataset.x][node.dataset.y].type ===
      gb.getBoardArray()[x][y].type
    ) {
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (
            +node.dataset.x + i >= 0 &&
            +node.dataset.x + i <= 9 &&
            +node.dataset.y + j >= 0 &&
            +node.dataset.y + j <= 9 &&
            gb.getBoardArray()[+node.dataset.x + i][+node.dataset.y + j] ===
              "ocean"
          ) {
            trNodeArray[+node.dataset.x + i].childNodes[
              +node.dataset.y + j
            ].classList.add("miss");
            gb.receiveAttack(+node.dataset.x + i, +node.dataset.y + j);
          }
        }
      }
      gb.getBoardArray()[node.dataset.x][node.dataset.y].isSunk = true;
      node.classList.add("sunk");
    }
  });
  gameStatus.textContent = `${
    isPlayerTurn ? "You have" : "Computer has"
  } sunk ${isPlayerTurn ? "Computer's" : "your"} ${
    gb.getBoardArray()[x][y].type
  }.`;
  return gameOverCheck(isPlayerTurn ? "player" : "cpu");
}

function gameOverCheck(winner) {
  const isSunkArray =
    winner === "player"
      ? cpuShips.map((item) => {
          return item.isSunk();
        })
      : playerShips.map((item) => {
          return item.isSunk();
        });

  if (isSunkArray.every((item) => item)) {
    return true;
  }
}

function gameOverEvent(winner) {
  const tablePlaceholders = document.querySelectorAll(".table-placeholder");
  const gameReplayButton = document.createElement("button");

  gameReplayButton.classList.add("button");
  gameReplayButton.textContent = "Play Again?";

  tablePlaceholders.forEach((item) => {
    item.classList.remove("turn");
  });

  const gameStatus = document.querySelector(".game-status");
  gameStatus.textContent = winner === "player" ? "You Win!" : "Computer Wins";

  gameStatus.append(gameReplayButton);
  gameReplayButton.focus();
  gameReplayButton.addEventListener("click", () => {
    window.location.reload();
  });
}

function getCoordinates(index, x, y, isRotated = false) {
  const shipCoordinates = [];
  for (let i = 0; i < playerShips[index].getShipLength(); i++) {
    if (isRotated) {
      shipCoordinates[i] = { x: x + i, y: y };
    } else {
      shipCoordinates[i] = { x: x, y: y + i };
    }
  }
  return shipCoordinates;
}

function checkDroppable(e) {
  const trContainerArray = Array.from(
    document.querySelectorAll(".placement-placeholder tr")
  );

  e.preventDefault();

  const heldElement = document.querySelector(".drag");

  const possibleCoordinates = getCoordinates(
    heldElement.dataset.index,
    +e.target.dataset.x,
    +e.target.dataset.y,
    heldElement.dataset.rotation === "true" ? true : false
  );

  const pcX = possibleCoordinates.map((item) => item.x);
  const pcY = possibleCoordinates.map((item) => item.y);

  trContainerArray.forEach((row) => {
    row.childNodes.forEach((data) => {
      if (!(pcX.includes(data.dataset.x) && pcY.includes(data.dataset.y))) {
        data.classList.remove("outline");
      }
    });
  });

  if (
    checkCoordinateValidity(
      playerGB,
      playerShips[+heldElement.dataset.index],
      +possibleCoordinates[0].x,
      +possibleCoordinates[0].y,
      heldElement.dataset.rotation === "true" ? true : false
    )
  ) {
    return possibleCoordinates;
  }
  return false;
}

function dragoverEvent(e) {
  const trContainerArray = Array.from(
    document.querySelectorAll(".placement-placeholder tr")
  );
  const possibleCoordinates = checkDroppable(e);

  if (possibleCoordinates) {
    possibleCoordinates.forEach((item) => {
      trContainerArray[item.x].childNodes[item.y].classList.add("outline");
    });
  }
}

function dropEvent(e) {
  const handheld = document.querySelector(".drag");
  const trContainerArray = Array.from(
    document.querySelectorAll(".placement-placeholder tr")
  );
  const possibleCoordinates = checkDroppable(e);
  if (possibleCoordinates) {
    possibleCoordinates.forEach((item) => {
      trContainerArray[item.x].childNodes[item.y].classList.add("occupied");
      trContainerArray[item.x].childNodes[item.y].dataset.blockIndex =
        handheld.dataset.index;
    });
    playerGB.setShipCoordinates(
      playerShips[+handheld.dataset.index],
      +e.target.dataset.x,
      +e.target.dataset.y,
      handheld.dataset.rotation === "true" ? true : false
    );
    handheld.classList.add("dropped");
  }
}

function startDrag(e) {
  const trContainerArray = Array.from(
    document.querySelectorAll(".placement-placeholder tr")
  );
  e.target.classList.add("drag");
  if (e.target.classList.contains("dropped")) {
    e.target.classList.remove("dropped");
    const placeCoordinates =
      playerShips[+e.target.dataset.index].getShipCoordinates();
    placeCoordinates.forEach((coordinate) => {
      trContainerArray[coordinate.x].childNodes[coordinate.y].classList.remove(
        "occupied"
      );
      playerGB.getBoardArray()[coordinate.x][coordinate.y] = "ocean";
    });
  }
}

function endDrag(e) {
  const trContainerArray = Array.from(
    document.querySelectorAll(".placement-placeholder tr")
  );
  e.target.classList.remove("drag");
  trContainerArray.forEach((row) => {
    row.childNodes.forEach((data) => {
      data.classList.remove("outline");
    });
  });
}

function placeBlocks() {
  const placementPlaceholder = document.createElement("div");
  const placementInfo = document.createElement("p");
  const placementInfoPara = document.createElement("p");
  const table = document.createElement("table");
  const blockWrapper = document.createElement("div");

  const startButton = document.createElement("button");
  startButton.textContent = "Start Game";

  placementPlaceholder.classList.add("placement-placeholder");
  blockWrapper.classList.add("block-wrapper");
  placementInfo.classList.add("placement-info");
  placementInfo.textContent =
    "Drag blocks to location. Click on them to rotate. Drag red blocks to replace the blocks.";
  placementInfoPara.textContent =
    "Click 'Start Game' without placing blocks to start a randomized game.";
  placementInfo.append(placementInfoPara, startButton);

  startButton.addEventListener("click", () => {
    if (playerShips.some((item) => item.getShipCoordinates().length === 0)) {
      positioningOfShips(playerGB, playerShips);
    }
    document.querySelectorAll("main > *").forEach((item) => {
      item.remove();
    });
    positioningOfShips(cpuGB, cpuShips);
    gameLoop();
  });

  document
    .querySelector("main")
    .append(blockWrapper, placementPlaceholder, placementInfo);

  function generateBlocks() {
    for (let i = 0; i < 5; i++) {
      const node = document.createElement("div");
      const innerNode = document.createElement("div");
      node.classList.add("block-container");
      innerNode.classList.add("block-container-inner");

      node.dataset.type = playerShips[i].getShipType();
      innerNode.dataset.index = i;
      innerNode.draggable = true;
      innerNode.dataset.rotation = false;
      innerNode.addEventListener("click", () => {
        if (!innerNode.classList.contains("rotated")) {
          innerNode.classList.add("rotated");
          innerNode.dataset.rotation = true;
        } else {
          innerNode.classList.remove("rotated");
          innerNode.dataset.rotation = false;
        }
      });
      innerNode.addEventListener("dragstart", startDrag);
      innerNode.addEventListener("dragend", endDrag);
      node.append(innerNode);
      for (let j = 0; j < playerShips[i].getShipLength(); j++) {
        const blockNode = document.createElement("div");
        blockNode.classList.add("tiny-block");
        innerNode.append(blockNode);
      }
      blockWrapper.append(node);
    }
  }

  function generateTable(placeholder, table) {
    for (let i = 0; i < 10; i++) {
      const tableRow = document.createElement("tr");
      table.append(tableRow);
      for (let j = 0; j < 10; j++) {
        const data = document.createElement("td");

        data.addEventListener("dragover", dragoverEvent);
        data.addEventListener("drop", dropEvent);
        data.dataset.x = i;
        data.dataset.y = j;
        tableRow.append(data);
      }
    }
    placeholder.append(table);
  }

  generateTable(placementPlaceholder, table);
  generateBlocks();
}

placeBlocks();
