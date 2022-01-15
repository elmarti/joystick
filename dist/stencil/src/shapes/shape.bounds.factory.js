import { JoystickShape } from "../enums/shape.enum";
export var shapeBoundsFactory = function (shape, absoluteX, absoluteY, relativeX, relativeY, dist, radius, baseSize, parentRect) {
  switch (shape) {
    case JoystickShape.Square:
      relativeX = getWithinBounds(absoluteX - parentRect.left - (baseSize / 2), baseSize);
      relativeY = getWithinBounds(absoluteY - parentRect.top - (baseSize / 2), baseSize);
      return { relativeX: relativeX, relativeY: relativeY };
    default:
      if (dist > radius) {
        relativeX *= radius / dist;
        relativeY *= radius / dist;
      }
      return { relativeX: relativeX, relativeY: relativeY };
  }
};
var getWithinBounds = function (value, baseSize) {
  var halfBaseSize = baseSize / 2;
  if (value > halfBaseSize) {
    return halfBaseSize;
  }
  if (value < -(halfBaseSize)) {
    return halfBaseSize * -1;
  }
  return value;
};
