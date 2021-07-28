export function gameBoard() {
  const boardArray = [];
  for (let i = 0; i < 10; i++) {
    boardArray[i] = [];
    for (let j = 0; j < 10; j++) {
      boardArray[i][j] = "ocean";
    }
  }

  function receiveAttack(x, y) {
    if (boardArray[x][y] === "ocean") {
      boardArray[x][y] = "miss";
      return "miss";
    } else {
      boardArray[x][y].isHit = true;
      boardArray[x][y].ship.hit(x, y);
      if (boardArray[x][y].ship.isSunk()) {
        return "sunk";
      }
      return "hit";
    }
  }

  function getBoardArray() {
    return [...boardArray];
  }

  function setShipCoordinates(ship, x, y, isRotated = false) {
    ship.setResetShip(x, y, isRotated);
    const placedCoordinates = ship.getShipCoordinates();
    const type = ship.getShipType();

    placedCoordinates.forEach((ele) => {
      boardArray[ele.x][ele.y] = {
        ship,
        type,
        x: ele.x,
        y: ele.y,
        isHit: false,
        isSunk: false,
      };
    });
  }

  function setSunk(type) {
    boardArray.forEach((row) => {
      row.forEach((item) => {
        if (item !== "ocean" && item !== "miss") {
          if (item.type === type) {
            item.isSunk = true;
          }
        }
      });
    });
  }
  return { getBoardArray, setShipCoordinates, receiveAttack, setSunk };
}
