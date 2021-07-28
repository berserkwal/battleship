export function ship(type, length) {
  const shipType = type;
  const shipLength = length;
  const shipStatus = [];
  const shipCoordinates = [];

  function getShipType() {
    return shipType;
  }
  function getShipLength() {
    return shipLength;
  }

  function hit(x, y) {
    for (let i in shipCoordinates) {
      if (shipCoordinates[i].x === x && shipCoordinates[i].y === y) {
        shipStatus[i] = "hit";
      }
    }
  }

  function getShipCoordinates() {
    return [...shipCoordinates];
  }
  function getShipStatus() {
    return [...shipStatus];
  }

  function setResetShip(x, y, isRotated = false) {
    for (let i = 0; i < length; i++) {
      shipStatus[i] = "clear";
      if (isRotated) {
        shipCoordinates[i] = { x: x + i, y: y };
      } else {
        shipCoordinates[i] = { x: x, y: y + i };
      }
    }
  }

  function isSunk() {
    if (shipStatus.every((value) => value === "hit")) {
      return true;
    } else return false;
  }

  return {
    getShipLength,
    getShipType,
    hit,
    getShipCoordinates,
    isSunk,
    setResetShip,
    getShipStatus,
  };
}

// const shipTest = ship("cruiser", 5);

// shipTest.setResetShip()
