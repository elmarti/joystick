import { JoystickShape } from "../enums/shape.enum";
export var shapeFactory = function (shape, size) {
  switch (shape) {
    case JoystickShape.Circle:
      return {
        borderRadius: size,
      };
    case JoystickShape.Square:
      return {
        borderRadius: Math.sqrt(size)
      };
  }
};
