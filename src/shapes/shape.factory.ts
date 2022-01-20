import {JoystickShape} from "../enums/shape.enum";

export const shapeFactory = (shape: JoystickShape, size: number) =>{
    switch (shape){
        case JoystickShape.Circle:
            return {
                borderRadius:`${size}px`,
            };
        case JoystickShape.Square:
            return  {
                borderRadius: `${Math.sqrt(size)}px`
            }
    }
}