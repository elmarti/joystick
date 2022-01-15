var __assign = (this && this.__assign) || function () {
  __assign = Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
        t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
import { Component, Prop, h, State } from '@stencil/core';
import { JoystickShape } from "./enums/shape.enum";
import { shapeFactory } from "./shapes/shape.factory";
import { shapeBoundsFactory } from "./shapes/shape.bounds.factory";
var InteractionEvents;
(function (InteractionEvents) {
  InteractionEvents["MouseDown"] = "mousedown";
  InteractionEvents["MouseMove"] = "mousemove";
  InteractionEvents["MouseUp"] = "mouseup";
  InteractionEvents["TouchStart"] = "touchstart";
  InteractionEvents["TouchMove"] = "touchmove";
  InteractionEvents["TouchEnd"] = "touchend";
})(InteractionEvents || (InteractionEvents = {}));
/**
 * Radians identifying the direction of the joystick
 */
var RadianQuadrantBinding;
(function (RadianQuadrantBinding) {
  RadianQuadrantBinding[RadianQuadrantBinding["TopRight"] = 2.35619449] = "TopRight";
  RadianQuadrantBinding[RadianQuadrantBinding["TopLeft"] = -2.35619449] = "TopLeft";
  RadianQuadrantBinding[RadianQuadrantBinding["BottomRight"] = 0.785398163] = "BottomRight";
  RadianQuadrantBinding[RadianQuadrantBinding["BottomLeft"] = -0.785398163] = "BottomLeft";
})(RadianQuadrantBinding || (RadianQuadrantBinding = {}));
var Joystick = /** @class */ (function () {
  function Joystick() {
    var _this = this;
    this.dragging = false;
    this._touchIdentifier = null;
    this._throttleMoveCallback = (function () {
      var lastCall = 0;
      return function (event) {
        var now = new Date().getTime();
        var throttleAmount = _this.throttle || 0;
        if (now - lastCall < throttleAmount) {
          return;
        }
        lastCall = now;
        if (_this.move) {
          return _this.move(event);
        }
      };
    })();
    this._boundMouseUp = function (event) {
      _this._mouseUp(event);
    };
    this._boundMouseMove = function (event) {
      _this._mouseMove(event);
    };
  }
  Joystick.prototype.disconnectedCallback = function () {
    if (this.followCursor) {
      window.removeEventListener(InteractionEvents.MouseMove, this._boundMouseMove);
      window.removeEventListener(InteractionEvents.TouchMove, this._boundMouseMove);
    }
  };
  Joystick.prototype.componentDidRender = function () {
    if (this.followCursor) {
      this._parentRect = this._baseRef.getBoundingClientRect();
      this.dragging = true;
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
  };
  /**
   * Update position of joystick - set state and trigger DOM manipulation
   * @param coordinates
   * @private
   */
  Joystick.prototype._updatePos = function (coordinates) {
    var _this = this;
    window.requestAnimationFrame(function () {
      _this.coordinates = coordinates;
    });
    if (typeof this.minDistance === 'number') {
      if (coordinates.distance < this.minDistance) {
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
  };
  /**
   * Handle mousedown event
   * @param e MouseEvent
   * @private
   */
  Joystick.prototype._mouseDown = function (e) {
    e.preventDefault();
    if (this.disabled || this.followCursor) {
      return;
    }
    this._parentRect = this._baseRef.getBoundingClientRect();
    this.dragging = true;
    if (e.type === InteractionEvents.MouseDown) {
      window.addEventListener(InteractionEvents.MouseUp, this._boundMouseUp);
      window.addEventListener(InteractionEvents.MouseMove, this._boundMouseMove);
    }
    else {
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
  };
  /**
   * Use ArcTan2 (4 Quadrant inverse tangent) to identify the direction the joystick is pointing
   * https://docs.oracle.com/cd/B12037_01/olap.101/b10339/x_arcsin003.htm
   * @param atan2: number
   * @private
   */
  Joystick.prototype._getDirection = function (atan2) {
    if (atan2 > RadianQuadrantBinding.TopRight || atan2 < RadianQuadrantBinding.TopLeft) {
      return "FORWARD";
    }
    else if (atan2 < RadianQuadrantBinding.TopRight && atan2 > RadianQuadrantBinding.BottomRight) {
      return "RIGHT";
    }
    else if (atan2 < RadianQuadrantBinding.BottomLeft) {
      return "LEFT";
    }
    return "BACKWARD";
  };
  /**
   * Hypotenuse distance calculation
   * @param x: number
   * @param y: number
   * @private
   */
  Joystick.prototype._distance = function (x, y) {
    return Math.hypot(x, y);
  };
  Joystick.prototype._distanceToPercentile = function (distance) {
    var percentageBaseSize = distance / (this._baseSize / 2) * 100;
    if (percentageBaseSize > 100) {
      return 100;
    }
    return percentageBaseSize;
  };
  /**
   * Calculate X/Y and ArcTan within the bounds of the joystick
   * @param event
   * @private
   */
  Joystick.prototype._mouseMove = function (event) {
    event.preventDefault();
    if (this.dragging) {
      if (event.targetTouches && event.targetTouches[0].identifier !== this._touchIdentifier) {
        return;
      }
      var absoluteX = null;
      var absoluteY = null;
      if (event instanceof MouseEvent) {
        absoluteX = event.clientX;
        absoluteY = event.clientY;
      }
      else {
        absoluteX = event.targetTouches[0].clientX;
        absoluteY = event.targetTouches[0].clientY;
      }
      var relativeX = absoluteX - this._parentRect.left - this._radius;
      var relativeY = absoluteY - this._parentRect.top - this._radius;
      var dist = this._distance(relativeX, relativeY);
      //@ts-ignore
      var bounded = shapeBoundsFactory(this.controlPlaneShape || this.baseShape, absoluteX, absoluteY, relativeX, relativeY, dist, this._radius, this._baseSize, this._parentRect);
      relativeX = bounded.relativeX;
      relativeY = bounded.relativeY;
      var atan2 = Math.atan2(relativeX, relativeY);
      this._updatePos({
        relativeX: relativeX,
        relativeY: relativeY,
        distance: this._distanceToPercentile(dist),
        direction: this._getDirection(atan2),
        axisX: absoluteX - this._parentRect.left,
        axisY: absoluteY - this._parentRect.top
      });
    }
  };
  /**
   * Handle mouse up and de-register listen events
   * @private
   */
  Joystick.prototype._mouseUp = function (event) {
    var _this = this;
    if (event.touches) {
      for (var _i = 0, _a = event.touches; _i < _a.length; _i++) {
        var touch = _a[_i];
        // this touch id is still in the TouchList, so this mouse up should be ignored
        if (touch.identifier === this._touchIdentifier) {
          return;
        }
      }
    }
    var stateUpdate = {
      dragging: false,
    };
    if (!this.sticky) {
      stateUpdate.coordinates = undefined;
    }
    window.requestAnimationFrame(function () {
      _this.dragging = false;
      if (!_this.sticky) {
        _this.coordinates = undefined;
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
  };
  /**
   * Get the shape stylings for the base
   * @private
   */
  Joystick.prototype.getBaseShapeStyle = function () {
    var shape = this.baseShape || JoystickShape.Circle;
    return shapeFactory(shape, this._baseSize);
  };
  /**
   * Get the shape stylings for the stick
   * @private
   */
  Joystick.prototype.getStickShapeStyle = function () {
    var shape = this.stickShape || JoystickShape.Circle;
    return shapeFactory(shape, this._baseSize);
  };
  /**
   * Calculate base styles for pad
   * @private
   */
  Joystick.prototype._getBaseStyle = function () {
    var baseColor = this.baseColor !== undefined ? this.baseColor : "#000033";
    var baseSizeString = this._baseSize + "px";
    var padStyle = __assign(__assign({}, this.getBaseShapeStyle()), { height: baseSizeString, width: baseSizeString, background: baseColor, display: 'flex', justifyContent: 'center', alignItems: 'center' });
    if (this.baseImage) {
      padStyle.background = "url(" + this.baseImage + ")";
      padStyle.backgroundSize = '100%';
    }
    return padStyle;
  };
  /**
   * Calculate  base styles for joystick and translate
   * @private
   */
  Joystick.prototype._getStickStyle = function () {
    var stickColor = this.stickColor !== undefined ? this.stickColor : "#3D59AB";
    var stickSize = this._baseSize / 1.5 + "px";
    var stickStyle = __assign(__assign({}, this.getStickShapeStyle()), { background: stickColor, cursor: "move", height: stickSize, width: stickSize, border: 'none', flexShrink: 0 });
    if (this.stickImage) {
      stickStyle.background = "url(" + this.stickImage + ")";
      stickStyle.backgroundSize = '100%';
    }
    if (this.coordinates !== undefined) {
      stickStyle = Object.assign({}, stickStyle, {
        position: 'absolute',
        transform: "translate3d(" + this.coordinates.relativeX + "px, " + this.coordinates.relativeY + "px, 0)"
      });
    }
    return stickStyle;
  };
  Joystick.prototype.render = function () {
    var _this = this;
    this._baseSize = this.size || 100;
    this._radius = this._baseSize / 2;
    var baseStyle = this._getBaseStyle();
    var stickStyle = this._getStickStyle();
    return (h("div", { class: this.disabled ? 'joystick-base-disabled' : '', onMouseDown: this._mouseDown.bind(this), onTouchStart: this._mouseDown.bind(this), ref: function (el) { return _this._baseRef = el; }, style: baseStyle },
      h("button", { class: this.disabled ? 'joystick-disabled' : '', style: stickStyle })));
  };
  Object.defineProperty(Joystick, "is", {
    get: function () { return "joy-stick"; },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Joystick, "properties", {
    get: function () { return {
      "size": {
        "type": "number",
        "mutable": false,
        "complexType": {
          "original": "number",
          "resolved": "number | undefined",
          "references": {}
        },
        "required": false,
        "optional": true,
        "docs": {
          "tags": [],
          "text": ""
        },
        "attribute": "size",
        "reflect": false
      },
      "baseColor": {
        "type": "string",
        "mutable": false,
        "complexType": {
          "original": "string",
          "resolved": "string | undefined",
          "references": {}
        },
        "required": false,
        "optional": true,
        "docs": {
          "tags": [],
          "text": ""
        },
        "attribute": "base-color",
        "reflect": false
      },
      "stickColor": {
        "type": "string",
        "mutable": false,
        "complexType": {
          "original": "string",
          "resolved": "string | undefined",
          "references": {}
        },
        "required": false,
        "optional": true,
        "docs": {
          "tags": [],
          "text": ""
        },
        "attribute": "stick-color",
        "reflect": false
      },
      "throttle": {
        "type": "number",
        "mutable": false,
        "complexType": {
          "original": "number",
          "resolved": "number | undefined",
          "references": {}
        },
        "required": false,
        "optional": true,
        "docs": {
          "tags": [],
          "text": ""
        },
        "attribute": "throttle",
        "reflect": false
      },
      "disabled": {
        "type": "boolean",
        "mutable": false,
        "complexType": {
          "original": "boolean",
          "resolved": "boolean | undefined",
          "references": {}
        },
        "required": false,
        "optional": true,
        "docs": {
          "tags": [],
          "text": ""
        },
        "attribute": "disabled",
        "reflect": false
      },
      "sticky": {
        "type": "boolean",
        "mutable": false,
        "complexType": {
          "original": "boolean",
          "resolved": "boolean | undefined",
          "references": {}
        },
        "required": false,
        "optional": true,
        "docs": {
          "tags": [],
          "text": ""
        },
        "attribute": "sticky",
        "reflect": false
      },
      "move": {
        "type": "unknown",
        "mutable": false,
        "complexType": {
          "original": "(event: IJoystickUpdateEvent) => void",
          "resolved": "((event: IJoystickUpdateEvent) => void) | undefined",
          "references": {
            "IJoystickUpdateEvent": {
              "location": "local"
            }
          }
        },
        "required": false,
        "optional": true,
        "docs": {
          "tags": [],
          "text": ""
        }
      },
      "stop": {
        "type": "unknown",
        "mutable": false,
        "complexType": {
          "original": "(event: IJoystickUpdateEvent) => void",
          "resolved": "((event: IJoystickUpdateEvent) => void) | undefined",
          "references": {
            "IJoystickUpdateEvent": {
              "location": "local"
            }
          }
        },
        "required": false,
        "optional": true,
        "docs": {
          "tags": [],
          "text": ""
        }
      },
      "start": {
        "type": "unknown",
        "mutable": false,
        "complexType": {
          "original": "(event: IJoystickUpdateEvent) => void",
          "resolved": "((event: IJoystickUpdateEvent) => void) | undefined",
          "references": {
            "IJoystickUpdateEvent": {
              "location": "local"
            }
          }
        },
        "required": false,
        "optional": true,
        "docs": {
          "tags": [],
          "text": ""
        }
      },
      "stickImage": {
        "type": "string",
        "mutable": false,
        "complexType": {
          "original": "string",
          "resolved": "string | undefined",
          "references": {}
        },
        "required": false,
        "optional": true,
        "docs": {
          "tags": [],
          "text": ""
        },
        "attribute": "stick-image",
        "reflect": false
      },
      "baseImage": {
        "type": "string",
        "mutable": false,
        "complexType": {
          "original": "string",
          "resolved": "string | undefined",
          "references": {}
        },
        "required": false,
        "optional": true,
        "docs": {
          "tags": [],
          "text": ""
        },
        "attribute": "base-image",
        "reflect": false
      },
      "followCursor": {
        "type": "boolean",
        "mutable": false,
        "complexType": {
          "original": "boolean",
          "resolved": "boolean | undefined",
          "references": {}
        },
        "required": false,
        "optional": true,
        "docs": {
          "tags": [],
          "text": ""
        },
        "attribute": "follow-cursor",
        "reflect": false
      },
      "baseShape": {
        "type": "string",
        "mutable": false,
        "complexType": {
          "original": "JoystickShape",
          "resolved": "JoystickShape.Circle | JoystickShape.Square | undefined",
          "references": {
            "JoystickShape": {
              "location": "import",
              "path": "./enums/shape.enum"
            }
          }
        },
        "required": false,
        "optional": true,
        "docs": {
          "tags": [],
          "text": ""
        },
        "attribute": "base-shape",
        "reflect": false
      },
      "stickShape": {
        "type": "string",
        "mutable": false,
        "complexType": {
          "original": "JoystickShape",
          "resolved": "JoystickShape.Circle | JoystickShape.Square | undefined",
          "references": {
            "JoystickShape": {
              "location": "import",
              "path": "./enums/shape.enum"
            }
          }
        },
        "required": false,
        "optional": true,
        "docs": {
          "tags": [],
          "text": ""
        },
        "attribute": "stick-shape",
        "reflect": false
      },
      "controlPlaneShape": {
        "type": "string",
        "mutable": false,
        "complexType": {
          "original": "JoystickShape",
          "resolved": "JoystickShape.Circle | JoystickShape.Square | undefined",
          "references": {
            "JoystickShape": {
              "location": "import",
              "path": "./enums/shape.enum"
            }
          }
        },
        "required": false,
        "optional": true,
        "docs": {
          "tags": [],
          "text": ""
        },
        "attribute": "control-plane-shape",
        "reflect": false
      },
      "minDistance": {
        "type": "number",
        "mutable": false,
        "complexType": {
          "original": "number",
          "resolved": "number | undefined",
          "references": {}
        },
        "required": false,
        "optional": true,
        "docs": {
          "tags": [],
          "text": ""
        },
        "attribute": "min-distance",
        "reflect": false
      }
    }; },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Joystick, "states", {
    get: function () { return {
      "dragging": {},
      "coordinates": {}
    }; },
    enumerable: false,
    configurable: true
  });
  return Joystick;
}());
export { Joystick };
