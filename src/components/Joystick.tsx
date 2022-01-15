import {Component, Prop, h, State} from '@stencil/core';
import {JoystickShape} from "../enums/shape.enum";
import {shapeFactory} from "../shapes/shape.factory";
import {shapeBoundsFactory} from "../shapes/shape.bounds.factory";


enum InteractionEvents {
    MouseDown = "mousedown",
    MouseMove = "mousemove",
    MouseUp = "mouseup",
    TouchStart = "touchstart",
    TouchMove = "touchmove",
    TouchEnd = "touchend"
}

export interface IJoystickUpdateEvent {
    type: "move" | "stop" | "start";
    //TODO: these could just be optional, but this may be a breaking change
    x: number | null;
    y: number | null;
    direction: JoystickDirection | null;
    distance: number | null;
}


type JoystickDirection = "FORWARD" | "RIGHT" | "LEFT" | "BACKWARD";

export interface IJoystickCoordinates {
    relativeX: number;
    relativeY: number;
    axisX: number;
    axisY: number;
    direction: JoystickDirection;
    distance: number;
}


/**
 * Radians identifying the direction of the joystick
 */
enum RadianQuadrantBinding {
    TopRight = 2.35619449,
    TopLeft = -2.35619449,
    BottomRight = 0.785398163,
    BottomLeft = -0.785398163
}
@Component({
    tag: 'joy-stick',
    shadow: true
})
export class Joystick {

    @Prop() size?: number;
    @Prop() baseColor?: string;
    @Prop() stickColor?: string;
    @Prop() throttle?: number;
    @Prop() disabled?: boolean;
    @Prop() sticky?: boolean;
    @Prop() move?: (event: IJoystickUpdateEvent) => void;
    @Prop() stop?: (event: IJoystickUpdateEvent) => void;
    @Prop() start?: (event: IJoystickUpdateEvent) => void;
    @Prop() stickImage?: string;
    @Prop() baseImage?: string;
    @Prop() followCursor?: boolean;
    @Prop() baseShape?: JoystickShape;
    @Prop() stickShape?: JoystickShape;
    @Prop() controlPlaneShape?: JoystickShape;
    @Prop() minDistance?: number;
    @State() dragging = false;
    @State() coordinates?: IJoystickCoordinates;


    private _baseRef: HTMLDivElement;
    private readonly _throttleMoveCallback: (data: any) => void;
    private readonly _boundMouseUp: EventListenerOrEventListenerObject;
    private _baseSize: number;
    private _radius: number;
    private _parentRect: DOMRect;
    private readonly _boundMouseMove: (event: any) => void;
    private _touchIdentifier: number|null = null

    constructor() {
        this._throttleMoveCallback = (() => {
            let lastCall = 0;
            return (event: any) => {

                const now = new Date().getTime();
                const throttleAmount = this.throttle || 0;
                if (now - lastCall < throttleAmount) {
                    return;
                }
                lastCall = now;
                if (this.move) {
                    return this.move(event);
                }
            };
        })();

        this._boundMouseUp = (event: any) => {
            this._mouseUp(event);
        };
        this._boundMouseMove = (event: any) => {
            this._mouseMove(event);
        }


    }

    disconnectedCallback() {
        if (this.followCursor) {
            window.removeEventListener(InteractionEvents.MouseMove, this._boundMouseMove);
            window.removeEventListener(InteractionEvents.TouchMove, this._boundMouseMove);
        }
    }

    componentDidRender() {
        if (this.followCursor) {
            this._parentRect = this._baseRef.getBoundingClientRect();

            this.dragging = true

            window.addEventListener(InteractionEvents.MouseMove, this._boundMouseMove);
            window.addEventListener(InteractionEvents.TouchMove, this._boundMouseMove);


            if (this.start) {
                this.start({
                    type: "start",
                    x: null,
                    y: null,
                    distance: null,
                    direction: null
                });
            }

        }
    }

    /**
     * Update position of joystick - set state and trigger DOM manipulation
     * @param coordinates
     * @private
     */
    private _updatePos(coordinates: IJoystickCoordinates) {

        window.requestAnimationFrame(() => {
            this.coordinates = coordinates;
        });
        if(typeof this.minDistance ===  'number'){
            if(coordinates.distance < this.minDistance){
                return;
            }
        }
        this._throttleMoveCallback({
            type: "move",
            x: coordinates.relativeX,
            y: -coordinates.relativeY,
            direction: coordinates.direction,
            distance: coordinates.distance
        });

    }

    /**
     * Handle mousedown event
     * @param e MouseEvent
     * @private
     */
    private _mouseDown(e: MouseEvent| any) {
        e.preventDefault();
        if (this.disabled || this.followCursor) {
            return;
        }
        this._parentRect = this._baseRef.getBoundingClientRect();
        this.dragging = true;


        if (e.type === InteractionEvents.MouseDown) {
            window.addEventListener(InteractionEvents.MouseUp, this._boundMouseUp);
            window.addEventListener(InteractionEvents.MouseMove, this._boundMouseMove);
        } else {
            this._touchIdentifier = e.targetTouches[0].identifier;
            window.addEventListener(InteractionEvents.TouchEnd, this._boundMouseUp);
            window.addEventListener(InteractionEvents.TouchMove, this._boundMouseMove);
        }

        if (this.start) {
            this.start({
                type: "start",
                x: null,
                y: null,
                distance: null,
                direction: null
            });
        }

    }

    /**
     * Use ArcTan2 (4 Quadrant inverse tangent) to identify the direction the joystick is pointing
     * https://docs.oracle.com/cd/B12037_01/olap.101/b10339/x_arcsin003.htm
     * @param atan2: number
     * @private
     */
    private _getDirection(atan2: number): JoystickDirection {
        if (atan2 > RadianQuadrantBinding.TopRight || atan2 < RadianQuadrantBinding.TopLeft) {
            return "FORWARD";
        } else if (atan2 < RadianQuadrantBinding.TopRight && atan2 > RadianQuadrantBinding.BottomRight) {
            return "RIGHT"
        } else if (atan2 < RadianQuadrantBinding.BottomLeft) {
            return "LEFT";
        }
        return "BACKWARD";


    }

    /**
     * Hypotenuse distance calculation
     * @param x: number
     * @param y: number
     * @private
     */
    private _distance(x: number, y: number): number {
        return Math.hypot(x, y);
    }
    private _distanceToPercentile(distance:number): number {
        const percentageBaseSize = distance / (this._baseSize/2) * 100;
        if(percentageBaseSize > 100){
            return 100;
        }
        return percentageBaseSize;
    }

    /**
     * Calculate X/Y and ArcTan within the bounds of the joystick
     * @param event
     * @private
     */
    private _mouseMove(event: MouseEvent | any) {
        event.preventDefault();
        if (this.dragging) {
            if(event.targetTouches && event.targetTouches[0].identifier !== this._touchIdentifier){
                return;
            }

            let absoluteX = null;
            let absoluteY = null;
            if (event instanceof MouseEvent) {
                absoluteX = event.clientX;
                absoluteY = event.clientY;
            } else {
                absoluteX = event.targetTouches[0].clientX;
                absoluteY = event.targetTouches[0].clientY;
            }


            let relativeX = absoluteX - this._parentRect.left - this._radius;
            let relativeY = absoluteY - this._parentRect.top - this._radius;
            const dist = this._distance(relativeX, relativeY);
            //@ts-ignore
            const bounded = shapeBoundsFactory(this.controlPlaneShape || this.baseShape, absoluteX, absoluteY, relativeX, relativeY, dist, this._radius, this._baseSize, this._parentRect);
            relativeX = bounded.relativeX
            relativeY = bounded.relativeY
            const atan2 = Math.atan2(relativeX, relativeY);

            this._updatePos({
                relativeX,
                relativeY,
                distance: this._distanceToPercentile(dist),
                direction: this._getDirection(atan2),
                axisX: absoluteX - this._parentRect.left,
                axisY: absoluteY - this._parentRect.top
            });
        }
    }



    /**
     * Handle mouse up and de-register listen events
     * @private
     */
    private _mouseUp(event: any) {
        if(event.touches){
            for(const touch of event.touches){
                // this touch id is still in the TouchList, so this mouse up should be ignored
                if(touch.identifier === this._touchIdentifier){
                    return;
                }
            }
        }
        const stateUpdate = {
            dragging: false,
        } as any;
        if (!this.sticky) {
            stateUpdate.coordinates = undefined;
        }
        window.requestAnimationFrame(() => {
            this.dragging = false;
            if (!this.sticky) {
                this.coordinates = undefined;
            }
        });
        window.removeEventListener("mouseup", this._boundMouseUp);
        window.removeEventListener("mousemove", this._boundMouseMove);

        if (this.stop) {
            this.stop({
                type: "stop",
                // @ts-ignore
                x: this.sticky ? this.coordinates.relativeX : null,
                // @ts-ignore
                y: this.sticky ? this.coordinates.relativeY : null,
                // @ts-ignore
                direction: this.sticky ? this.coordinates.direction : null,
                // @ts-ignore
                distance: this.sticky ? this.coordinates.distance : null

            });
        }

    }

    /**
     * Get the shape stylings for the base
     * @private
     */
    private getBaseShapeStyle() {
        const shape = this.baseShape || JoystickShape.Circle;
        return shapeFactory(shape, this._baseSize);
    }
    /**
     * Get the shape stylings for the stick
     * @private
     */
    private getStickShapeStyle() {
        const shape = this.stickShape || JoystickShape.Circle;
        return shapeFactory(shape, this._baseSize);
    }
    /**
     * Calculate base styles for pad
     * @private
     */
    private _getBaseStyle(): any {
        const baseColor: string = this.baseColor !== undefined ? this.baseColor : "#000033";

        const baseSizeString = `${this._baseSize}px`;
        const padStyle = {
            ...this.getBaseShapeStyle(),
            height: baseSizeString,
            width: baseSizeString,
            background: baseColor,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        } as any;
        if (this.baseImage) {
            padStyle.background = `url(${this.baseImage})`;
            padStyle.backgroundSize = '100%'
        }
        return padStyle;

    }

    /**
     * Calculate  base styles for joystick and translate
     * @private
     */
    private _getStickStyle(): any {
        const stickColor: string = this.stickColor !== undefined ? this.stickColor : "#3D59AB";
        const stickSize = `${this._baseSize / 1.5}px`;

        let stickStyle = {
            ...this.getStickShapeStyle(),
            background: stickColor,
            cursor: "move",
            height: stickSize,
            width: stickSize,
            border: 'none',
            flexShrink: 0
        } as any;
        if (this.stickImage) {
            stickStyle.background = `url(${this.stickImage})`;
            stickStyle.backgroundSize = '100%'
        }

        if (this.coordinates !== undefined) {
            stickStyle = Object.assign({}, stickStyle, {
                position: 'absolute',
                transform: `translate3d(${this.coordinates.relativeX}px, ${this.coordinates.relativeY}px, 0)`
            });
        }
        return stickStyle;

    }

    render() {
        this._baseSize = this.size || 100;
        this._radius = this._baseSize / 2;
        const baseStyle = this._getBaseStyle();
        const stickStyle = this._getStickStyle();
        return (
            <div class={this.disabled ? 'joystick-base-disabled' : ''}
                 onMouseDown={this._mouseDown.bind(this)}
                 onTouchStart={this._mouseDown.bind(this)}

                 ref={el => this._baseRef = el as HTMLDivElement}
                 style={baseStyle}>
                <button
                        class={this.disabled ? 'joystick-disabled' : ''}
                        style={stickStyle}/>
            </div>
        )
    }
}

