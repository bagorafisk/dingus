/**
* BalderJS
* version 11.2 (2025-04-28)
* Mattias Steinwall
* Baldergymnasiet, Skellefteå, Sweden
*/

//
// Canvas
//

/**
 * A container element for the canvas layers. Fills the available space on the screen.
 * @example
 * Change the background color:
 * ```
 * canvas.style.backgroundColor = "purple"
 * ```
 * @example
 * Set focus:
 * ```
 * canvas.focus()
 * ```
 */
const canvas = document.getElementById("canvas") as HTMLDivElement;

const _canvasLayers: Record<number, HTMLCanvasElement> = {};            // 10.0
const _ctxs: Record<number, CanvasRenderingContext2D> = {}              // 10.0
let _layer: number;                                                     // 10.0

/**
 * The rendering context for the current canvas layer. 
 * For customized graphics.
 * @example
 * Draw a tilted filled yellow half-ellipse:
 * ```
 * ctx.ellipse(100, 100, 100, 50, radians(45), 0, radians(180))
 * ctx.fillStyle = "yellow"
 * ctx.fill()
 * ```
 */
let ctx: CanvasRenderingContext2D;

/**
 * Returns the width, in pixels, of the canvas. See also `H`.
 * @example 
 * Draw a circle in the middle of the canvas:
 * ```
 * circle(W / 2, H / 2, 100)
 * ```
 * @example 
 * Draw a line from the top left corner to the bottom right corner of the canvas.
 * ```
 * line(0, 0, W, H)
 * ```
 */
let W: number;

/**
 * Returns the height, in pixels, of the canvas. See also `W`.
 * @example 
 * Draw a circle in the middle of the canvas:
 * ```
 * circle(W / 2, H / 2, 100)
 * ```
 * @example 
 * Draw a line from the top left corner to the bottom right corner of the canvas.
 * ```
 * line(0, 0, W, H)
 * ```
 */
let H: number;

function ellipse(       // 10.0
    x: number, y: number,
    radiusX: number,
    radiusY: number,
    color: string = "black",
    lineWidth?: number
) {

    ctx.beginPath();
    ctx.ellipse(x, y, radiusX, radiusY, 0, 0, 2 * Math.PI)

    if (lineWidth !== undefined) {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.stroke();
    } else {
        ctx.fillStyle = color;
        ctx.fill();
    }
}

/**
 * Draws a circle on the canvas with center in (`x`, `y`).
 * @example 
 * Draw a filled circle with default color:
 * ```
 * circle(100, 50, 50)
 * ```
 * @example 
 * Draw a filled red circle:
 * ```
 * circle(100, 50, 50, "red")
 * ```
 * @example 
 * Draw a blue circle with a line width of 5 pixels:
 * ```
 * circle(100, 50, 50, "blue", 5)
 * ```
 */
function circle(
    x: number, y: number,
    radius: number,
    color?: string,
    lineWidth?: number
) {
    ellipse(x, y, radius, radius, color, lineWidth);
}

/**
 * Clears the canvas.
 * @example 
 * Clear the canvas:
 * ```
 * clear()
 * ```
 * @example 
 * Clear a rectangular part of the canvas with upper left corner in (`100`, `50`):
 * ```
 * clear(100, 50, 400, 300)
 * ```
 */
function clear(x = 0, y = 0, width = W, height = H) {
    ctx.clearRect(x, y, width, height);
}

/**
 * Fills the canvas with given color.
 * @example 
 * ```
 * fill("blue")
 * ``` 
*/
function fill(color = "black") {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, W, H);
}

/**
 * Gets color information, as a 4-tuple, for a given pixel.
 * Values `r`(ed), `g`(reen), `b`(lue) and `a`(lpha) are all in the interval 0 to 255.
 * @example 
 * ```
 * circle(50, 100, 30, randomItem("red", "green", "blue"))
 * text(getPixel(50, 100))
 * ``` 
*/
function getPixel(x: number, y: number) {
    return Array.from(ctx.getImageData(x, y, 1, 1).data) as [r: number, g: number, b: number, a: number];
}

async function fetchImages(...paths: string[]) {           // 10.0
    return await Promise.all(paths.map(path =>
        new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new Image();
            image.addEventListener("load", () => resolve(image));
            image.addEventListener("error", () => reject(new Error(`'${path}' can not be loaded`)));
            image.src = path;
        })
    ));
}

async function fetchImage(path: string) {           // 10.0
    return (await fetchImages(path))[0];
}

function imageFromDataURL(dataURL: string) {    // 10.0
    const image = new Image();
    image.src = dataURL;

    return image;
}

/**
 * Draws a polygon on the canvas with edges in the `points`-array.
 * @example 
 * Draw a red diamond shape:
 * ```
 * polygon([[100, 100], [140, 160], [100, 220], [60, 160]], "red")
 * ```
 */
function polygon(
    points: [x: number, y: number][],
    color = "black",
    lineWidth?: number
) {
    ctx.beginPath();
    ctx.moveTo(...points[0]);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(...points[i])
    }
    ctx.closePath();

    if (lineWidth !== undefined) {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.stroke();
    } else {
        ctx.fillStyle = color;
        ctx.fill();
    }
}

/**
 * Draws a line on the canvas between (`x1`, `y1`) and (`x2`, `y2`).
 * @example 
 * Draw two thick blue lines across the canvas:
 * ```
 * line(0, 0, W, H, "blue", 20)
 * line(0, H, W, 0, "blue", 20)
 * ```
 */
function line(
    x1: number, y1: number,
    x2: number, y2: number,
    color = "black",
    lineWidth = 1
) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
}

/**
 * Draws a rectangle on the canvas with upper left corner in (`x`, `y`).
 */
function rectangle(
    x: number, y: number,
    width: number, height: number,
    color = "black",
    lineWidth?: number
) {
    if (lineWidth !== undefined) {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.strokeRect(x, y, width, height);
    } else {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
    }
}

function square(            // 10.0
    x: number, y: number,
    side: number,
    color?: string,
    lineWidth?: number
) {
    rectangle(x, y, side, side, color, lineWidth)
}

function str(value: unknown): string {          // 10.0
    if (Array.isArray(value)) {
        return "[" + value.map(item => str(item)).join(",") + "]"
    } else if (typeof value == "object" &&
        ((value != null && Object.getPrototypeOf(value) === Object.prototype && value.toString == Object.prototype.toString))) {
        return JSON.stringify(value);
    } else {
        return String(value);
    }
}

/**
 * Draws `value` as a string on the canvas. The baseline is set by `y`. 
 * @example
 * Draw 'Hello world!' with the lower left corner in (`100`, `50`):
 * ```
 * text("Hello world!", 100, 50, 36, "red")
 * ```
 * @example
 * Draw 'abcd' right-aligned to the right:
 * ```
 * text("abcd", [W, "right"])
 * ```
 * @example
 * Draw 'abcd' center-aligned to the middle:
 * ```
 * text("abcd", [W / 2, "center"])
 * ```
 */
function text(
    value: unknown,
    x: number | [number, "left" | "center" | "right"] = 0,
    y: number | [number, "top" | "center" | "bottom"] = 16,
    fontSize: number | null = 16,
    color = "black",    // 10.0
    lineWidth?: number
) {
    if (fontSize != null) ctx.font = fontSize + "px consolas,monospace"
    const _text = str(value);

    if (typeof x != "number") {
        const w = ctx.measureText(_text).width;

        switch (x[1]) {
            case "left": x = x[0]; break;
            case "center": x = x[0] - w / 2; break;
            case "right": x = x[0] - w; break;
        }
    }

    if (typeof y != "number") {
        const h = ctx.measureText(_text).actualBoundingBoxAscent;

        switch (y[1]) {
            case "top": y = y[0] + h; break;
            case "center": y = y[0] + h / 2; break;
            case "bottom": y = y[0]; break;
        }
    }

    if (lineWidth !== undefined) {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.strokeText(_text, x, y);
    } else {
        ctx.fillStyle = color;
        ctx.fillText(_text, x, y);
    }
}

/**
 * Draws a triangle on the canvas with corners in (`x1`, `y1`), (`x2`, `y2`) and (`x3`, `y3`).
 * @example 
 * Draw a triangle with corners in (`100`, `50`), (`200`, `50`) and (`200`, `150`).
 * ```
 * triangle(100, 50, 200, 50, 200, 150)
 * ```
 * @example 
 * Draw a red triangle:
 * ```
 * triangle(100, 150, 200, 150, 200, 250, "red")
 * ```
 * @example 
 * Draw a blue triangle with linewidth 2:
 * ```
 * triangle(100, 250, 200, 250, 200, 350, "blue", 2)
 * ```
 */
function triangle(
    x1: number, y1: number,
    x2: number, y2: number,
    x3: number, y3: number,
    color = "black",
    lineWidth?: number
) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();

    if (lineWidth !== undefined) {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.stroke();
    } else {
        ctx.fillStyle = color;
        ctx.fill();
    }
}

/**
 * An object for keyboard input.
 * 
 * @example
 * ```
 * setUpdate(() => {
 *     clear()
 *     if (keyboard.w) {
 *         text("key W")
 *     }
 * })
 * ``` 
 * @example
 * ```
 * setUpdate(() => {
 *     if (keyboard.keys["KeyR"]) {
 *         fill("red")
 *     }
 * })
 * ``` 
 */
const keyboard = {
    /**
     * Returns true if any key is pressed.
     * @example
     * setUpdate(() => {
     *     clear()
     *     if (keyboard.pressed) {
     *         text("Any key pressed!")
     *     }
     * })
    */
    get pressed() { return Object.keys(_keys).some(value => _keys[value] === true) },
    /**
     * Returns the standard value for the latest key pressed. It is not affected by the  keyboard layout.
      * @example
      * setUpdate(() => {
      *     clear()
      *     text(keyboard.keyName)
      * })
      */
    get keyName() { return _keyName },
    /**
     * Returns the state of all keys.
     */
    get keys() { return _keys },

    get space(): boolean { return !!_keys["Space"]; }, set space(value: false) { _keys["Space"] = value; },
    get tab(): boolean { return !!_keys["Tab"]; }, set tab(value: false) { _keys["Tab"] = value; },             // 10.0
    get enter(): boolean { return !!_keys["Enter"]; }, set enter(value: false) { _keys["Enter"] = value; },
    get escape(): boolean { return !!_keys["Escape"]; }, set escape(value: false) { _keys["Escape"] = value; },

    get left(): boolean { return !!_keys["ArrowLeft"]; }, set left(value: false) { _keys["ArrowLeft"] = value; },
    get up(): boolean { return !!_keys["ArrowUp"]; }, set up(value: false) { _keys["ArrowUp"] = value; },
    get right(): boolean { return !!_keys["ArrowRight"]; }, set right(value: false) { _keys["ArrowRight"] = value; },
    get down(): boolean { return !!_keys["ArrowDown"]; }, set down(value: false) { _keys["ArrowDown"] = value; },

    get a(): boolean { return !!_keys["KeyA"]; }, set a(value: false) { _keys["KeyA"] = value; },
    get d(): boolean { return !!_keys["KeyD"]; }, set d(value: false) { _keys["KeyD"] = value; },
    get s(): boolean { return !!_keys["KeyS"]; }, set s(value: false) { _keys["KeyS"] = value; },
    get w(): boolean { return !!_keys["KeyW"]; }, set w(value: false) { _keys["KeyW"] = value; },
};

let _keyName: string;
let _keys: Record<string, boolean | null> = {};

canvas.addEventListener("keydown", event => {
    event.preventDefault();

    if (_keys[event.code] !== false) {
        _keys[event.code] = true;
        _keyName = event.code;
    }
});

canvas.addEventListener("keyup", event => {
    _keys[event.code] = null;

    switch (event.code) {       // 10.0
        case "ShiftLeft": _keys["ShiftRight"] = null; break;
        case "ShiftRight": _keys["ShiftLeft"] = null; break;
        case "NumpadEnter": _keys["Enter"] = null; break;
        case "Enter": _keys["NumpadEnter"] = null; break;
    }
});

window.addEventListener("blur", () => {     // 10.0
    _keys = {};
});


/**
 * An object for input from mouse or other pointing device.
 */
const mouse = {
    get x() { return _mouseX },
    get y() { return _mouseY },
    get over() { return _mouseOver },

    get left(): boolean { return !!_buttons[0]; }, set left(value: false) { _buttons[0] = value; },
    get right(): boolean { return !!_buttons[2]; }, set right(value: false) { _buttons[2] = value; },
    /**
     * Returns the state of all buttons.
     */
    get buttons() { return _buttons; }
};

let _mouseX = -1;
let _mouseY = -1;
let _mouseOver: boolean;
let _buttons: (boolean | null)[] = []

canvas.addEventListener("mousedown", event => {
    event.preventDefault();
    canvas.focus();

    if (_buttons[event.button] !== false) {
        _buttons[event.button] = true;
    }
});

canvas.addEventListener("mouseup", event => {
    _buttons[event.button] = null;
});

canvas.addEventListener("mousemove", event => {
    const rect = canvas.getBoundingClientRect();

    _mouseX = event.clientX - rect.left;
    _mouseY = event.clientY - rect.top;
    _mouseOver = true;
});

canvas.addEventListener("mouseout", () => {
    _mouseOver = false;
    _buttons = [];
});

canvas.addEventListener("contextmenu", event => {
    event.preventDefault();
});

canvas.addEventListener("wheel", event => {
    event.preventDefault();
});

/**
 * An object for input from touch screen.
 */
const touchscreen = {
    get x() { return _touches.length > 0 ? _touches[0].x : -1 },
    get y() { return _touches.length > 0 ? _touches[0].y : -1 },

    get touches() {
        return _touches;
    },

    get touched(): boolean { return _touchable && _touches.length > 0 },
    set touched(value: false) { _touchable = value; }          // 10.0
};

let _touches: {
    readonly x: number;
    readonly y: number;
    readonly identifier: number;
}[] = [];
let _touchable = true;      // 10.0

function _touchHandler(event: TouchEvent) {
    event.preventDefault();
    canvas.focus();

    const rect = canvas.getBoundingClientRect();
    _touches = [];

    for (let i = 0; i < event.touches.length; i++) {
        _touches[i] = {
            x: event.touches[i].clientX - rect.left,
            y: event.touches[i].clientY - rect.top,
            identifier: event.touches[i].identifier
        };
    }

    if (_touches.length == 0) _touchable = true;        // 10.0
}

canvas.addEventListener("touchstart", _touchHandler);
canvas.addEventListener("touchend", _touchHandler);
canvas.addEventListener("touchmove", _touchHandler);

class Cell {
    private _color: string | null = null;
    private _image: HTMLImageElement | null = null;     // 10.0
    private _text: string | null = null;
    private _custom: ((c: Cell) => void) | null = null;

    private fontSize: number;

    /**
     * Additional info about this cell.
     */
    tag: any;   // 10.0

    constructor(
        readonly row: number,
        readonly column: number,
        readonly x: number,
        readonly y: number,
        readonly width: number,
        readonly height: number,
        private textColor: string,
        private layer: number
    ) {
        this.fontSize = this.height
    }

    get color() {
        return this._color;
    }

    set color(value: string | null) {
        this._color = value;
        this.draw();
    }

    get image() {
        return this._image;
    }

    set image(value: HTMLImageElement | null) {   // 10.0
        this._image = value;
        this.draw();
    }

    get text(): string | null {
        return this._text;
    }

    set text(value: string | [value: string, fontSize: number | null, color: string | null] | null) {       // 11.0
        if (value == null) {
            this._text = null;
        } else if (typeof value == "string") {
            this._text = value;
        } else {
            this._text = value[0];
            this.fontSize = value[1] ?? this.fontSize;
            this.textColor = value[2] ?? this.textColor;
        }

        this.draw();
    }

    get custom() {
        return this._custom;
    }

    set custom(value: ((cell: Cell) => void) | null) {
        this._custom = value;
        this.draw();
    }

    draw() {                    // 10.0
        const layer = _layer;
        setLayer(this.layer);

        clear(this.x, this.y, this.width, this.height);

        if (this._color) {
            rectangle(this.x + 0.5, this.y + 0.5, this.width - 1, this.height - 1, this._color);
        }

        if (this._image) {
            ctx.drawImage(this._image, this.x, this.y, this.width, this.height);
        }

        if (this._text) {
            text(this._text, [this.x + this.width / 2, "center"], [this.y + this.height / 2, "center"], this.fontSize, this.textColor)
        }

        if (this._custom) {
            this._custom(this);
        }

        setLayer(layer);
    }

    toString() {                    // 10.0
        return JSON.stringify(this)
    }
}

class Grid {        // 10.0
    private activatable = true;
    private _activeCell: Cell;     // 10.01 
    private cells: Cell[][] = [];
    private cellWidth: number;
    private cellHeight: number;
    private layer = _layer;

    constructor(
        readonly rows: number,
        readonly columns: number,
        readonly x = 0,
        readonly y = 0,
        readonly width = W - x,
        readonly height = H - y,
        private color = "black"
    ) {
        this.cellWidth = (width - columns - 1) / columns;
        this.cellHeight = (height - rows - 1) / rows;

        for (let i = 0; i < rows; i++) {
            this.cells[i] = [];
            for (let j = 0; j < columns; j++) {
                this.cells[i][j] = new Cell(i, j,
                    x + j * (this.cellWidth + 1) + 1,
                    y + i * (this.cellHeight + 1) + 1,
                    this.cellWidth, this.cellHeight, color, _layer
                );
            }
        }

        this._activeCell = this.cells[0][0];
        this.draw();
    }

    /**
     * Returns cell at given position.
     */
    cell(row: number, column: number) {
        return this.cells[row][column];
    }

    /**
     * Applies the `callback`-function to each cell.
     */
    forEach(callback: (c: Cell) => void) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                callback(this.cells[i][j]);
            }
        }
    }

    /**
     * Returns `true` if a cell was either clicked or touched.
     */
    get activated(): boolean {      // 10.01
        if (touchscreen.touched || mouse.buttons.some(value => value)) {
            if (this.activatable) {
                this.activatable = false;
                const x = touchscreen.touched ? touchscreen.x : mouse.x;
                const y = touchscreen.touched ? touchscreen.y : mouse.y;

                const cell = this.cellFromPoint(x, y);
                if (cell) {
                    this._activeCell = cell;
                    return true;
                }
            }

            return false;
        }

        this.activatable = true;
        return false;
    }

    /**
     * Returns the active cell.
     */
    get activeCell() {
        return this._activeCell;
    }

    /**
     * Returns the cell, if any, containing (`x`, `y`).
     */
    cellFromPoint(x: number, y: number): Cell | undefined {
        const column = Math.floor((x - this.x) / (this.cellWidth + 1));
        const row = Math.floor((y - this.y) / (this.cellHeight + 1));

        return this.cells[row]?.[column];
    }

    /**
     * Draws this grid.
     */
    draw() {
        const layer = _layer
        setLayer(this.layer);

        if (this.color) {
            rectangle(this.x, this.y, this.width, this.height, this.color)
        }

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.cells[i][j].draw();
            }
        }

        setLayer(layer);
    }

    toString() {                    // 10.0
        return JSON.stringify(this)
    }
}

class Hitbox {
    tag: any;       // 10.0
    protected layer = _layer;
    private clickable = true;

    constructor(
        public x: number,
        public y: number,
        public width: number,
        public height: number
    ) {
    }

    /**
     * Returns `true` if this hitbox intersects `other` hibox.  
     */
    intersects(other: Hitbox): boolean {
        return (
            this.x + this.width > other.x &&
            this.x < other.x + other.width &&
            this.y + this.height > other.y &&
            this.y < other.y + other.height
        );
    }

    /**
     * Returns `true` if this hitbox contains (`x`, `y`).  
     */
    contains(x: number, y: number): boolean {
        return (
            this.x + this.width > x &&
            this.x <= x &&
            this.y + this.height > y &&
            this.y <= y
        );
    }

    drawOutline(color = "black") {      // 10.0
        const layer = _layer
        setLayer(this.layer);

        rectangle(this.x, this.y, Math.max(this.width, 0), Math.max(this.height, 0), color, 1);

        setLayer(layer);
    }

    get clicked(): boolean {      // 11.2 ?
        if (touchscreen.touched || mouse.buttons.some(value => value)) {
            if (this.clickable) {
                this.clickable = false;
                const x = touchscreen.touched ? touchscreen.x : mouse.x;
                const y = touchscreen.touched ? touchscreen.y : mouse.y;

                return this.contains(x, y)
            }

            return false;
        }

        this.clickable = true;
        return false;
    }

    toString() {                    // 10.0
        return JSON.stringify(this)
    }
}

class Button extends Hitbox {   // 11.2 ?
    constructor(
        public text: string,
        x = 0, y = 0,
        width?: number, height?: number,
        public color = "lightgrey",
        public fontSize = 16,
        public textColor = "black"
    ) {
        width = width ?? text.length * fontSize
        height = height ?? fontSize * 2
        super(x, y, width, height)
        this.draw()
    }

    draw() {
        rectangle(this.x, this.y, this.width, this.height, this.color)
        text(this.text, [this.x + this.width / 2, "center"], [this.y + this.height / 2, "center"], this.fontSize, this.textColor)
    }
}

class Sprite extends Hitbox {
    private index = 0;
    private remainingTime!: number;
    private _frames: number[];
    private frameWidth: number;
    private frameHeight: number;
    private sxs: number[] = [];
    private sys: number[] = [];
    private _finished = false;
    private _framesPerSecond!: number

    /**
     * Set to `false` if sprite shouldn't loop.  
     */
    loop = true;

    constructor(
        private spritesheet: HTMLImageElement,
        private rows: number,
        private columns: number,
    ) {
        super(0, 0, 0, 0);

        this._frames = array(rows * columns, i => i!);
        this.framesPerSecond = 12
        this.width = this.frameWidth = this.spritesheet.width / this.columns;
        this.height = this.frameHeight = this.spritesheet.height / this.rows;

        for (let i = 0; i < rows * columns; i += 1) {
            this.sxs[i] = this.frameWidth * (i % this.columns);
            this.sys[i] = this.frameHeight * Math.floor(i / this.columns);
        }
    }

    set frames(value: number[]) {
        if (value.length != this._frames.length || value.some((v, i) => v != this._frames[i])) this.index = 0

        this._frames = value
    }

    set framesPerSecond(value: number) {
        this._framesPerSecond = value

        this.remainingTime = 1000 / value;
    }

    get framesPerSecond() {
        return this._framesPerSecond;
    }

    get finished() {
        return this._finished;
    }

    get frame() {
        return this._frames[this.index];
    }

    update() {  // 11.0
        this.remainingTime -= DT;

        if (this.remainingTime < 0) {
            if (this.index >= this._frames.length - 1) {
                if (this.loop) {
                    this.index = 0;
                } else {
                    this._finished = true;
                }
            } else {
                this.index++;
            }

            this.remainingTime += 1000 / this._framesPerSecond;
        }

        this.draw();
    }

    draw() {
        const layer = _layer
        setLayer(this.layer);

        const sx = this.sxs[this._frames![this.index]];
        const sy = this.sys[this._frames![this.index]];

        ctx.drawImage(
            this.spritesheet,
            sx, sy, this.frameWidth, this.frameHeight,
            this.x, this.y, this.width, this.height
        );

        setLayer(layer);
    }

    getImages() {   // 11.0
        const frameCanvas = document.createElement("canvas");
        const frameCtx = frameCanvas.getContext("2d")!;

        const images: HTMLImageElement[] = [];

        for (const frame of this._frames!) {
            frameCtx.clearRect(0, 0, this.frameWidth, this.frameHeight);
            frameCtx.drawImage(
                this.spritesheet,
                this.sxs[frame], this.sys[frame], this.frameWidth, this.frameHeight,
                0, 0, this.frameWidth, this.frameHeight
            );

            images.push(imageFromDataURL(frameCanvas.toDataURL()));
        }

        return images;
    }
}

class Turtle {      // 10.0
    private container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    private turtle = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    private points: [number, number][] = [];
    private _color = "black";
    private layer = _layer;

    penSize = 1;  // 11.0

    /**
     * The delay, in milliseconds, between changes in state (movements and rotations).
     */
    delay = 100;

    /**
     * Create a turtle.
     * 
     * @example
     * Creates a turtle in the middle of the canvas, headed east (default settings):
     * ```
     * let t = new Turtle()
     * ```
     * @example
     * Creates a turtle at (`100`, `200`), headed north:
     * ```
     * let t = new Turtle(100, 200, -90)
     * ```
     *  
     */
    constructor(
        private x = W / 2,
        private y = H / 2,
        private heading = 0
    ) {
        document.body.appendChild(this.container);
        this.container.appendChild(this.turtle);
        this.container.setAttribute("width", "20");
        this.container.setAttribute("height", "20");
        this.container.style.position = "absolute";
        this.turtle.setAttribute("fill", this._color);
        this.turtle.setAttribute("stroke", this._color);
        this.turtle.setAttribute("stroke-width", "1");

        this.move();
        this.turn();
    }

    /**
     * The state of the turtle as a 3-tuple.
     * 
     * @example
     * Get the position and heading of turtle `t`: 
     * ```
     * let [x, y, heading] = t.state
     * ```
     * @example
     * Place turtle `t` at (`100`, `200`) headed south:
     * ```
     * t.state = [100, 200, 90]
     * ```
    */
    get state() {
        return [this.x, this.y, this.heading];
    }

    set state(value: [x: number, y: number, heading: number]) {
        [this.x, this.y, this.heading] = value;
        this.move()
        this.turn()
    }

    /**
     * The color of this turtle. Used when drawing and filling.
     */
    get color(): string {
        return this._color;
    }

    set color(value: string) {
        this._color = value;
        this.turtle.setAttribute("fill", this._color);
    }

    private move() {
        const style = getComputedStyle(canvas);
        const offsetLeft = canvas.offsetLeft + parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft);
        const offsetTop = canvas.offsetTop + parseFloat(style.borderTopWidth) + parseFloat(style.paddingTop);
        this.container.style.left = (offsetLeft + this.x - 10) + "px";
        this.container.style.top = (offsetTop + this.y - 10) + "px";

        if (this.points.length > 0) {
            this.points.push([this.x, this.y]);
        }
    }

    private turn() {
        const [x0, y0] = [10, 10];
        const [x1, y1] = pointFromPolar(10, this.heading + 150, x0, y0);
        const [x2, y2] = pointFromPolar(6, this.heading + 180, x0, y0);
        const [x3, y3] = pointFromPolar(10, this.heading - 150, x0, y0);
        this.turtle.setAttribute("points", `${x0},${y0} ${x1},${y1} ${x2},${y2} ${x3},${y3}`);
    }

    /**
     * Move this turtle `length` pixels in the direction it is headed. 
    */
    async forward(length: number, penDown = true) {     // 11.0
        const layer = _layer
        setLayer(this.layer);

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        this.x += Math.cos(radians(this.heading)) * length;
        this.y += Math.sin(radians(this.heading)) * length;

        if (penDown) {
            ctx.lineTo(this.x, this.y);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.penSize;
            ctx.stroke();
        } else {
            ctx.moveTo(this.x, this.y);
        }

        this.move()
        setLayer(layer);

        await sleep(this.delay);
    }

    /**
     * Move this turtle `length` pixels in the direction opposite it is headed. 
     */
    async backward(length: number, penDown = true) {    // 11.0
        this.forward(-length, penDown);
    }

    /**
     * Turn this turtle `degAngle` degrees clockwise.
     */
    async right(degAngle = 90) {
        this.heading += degAngle;

        this.turn()
        await sleep(this.delay);
    }

    /**
     * Turn this turtle `degAngle` degrees counterclockwise.
     */
    async left(degAngle = 90) {
        await this.right(-degAngle);
    }

    hide() {
        this.container.style.display = "none";
    }

    beginFill() {
        this.points = [[this.x, this.y]];
    }

    endFill() {
        polygon(this.points, this._color);
        this.points = [];
    }

    toString() {                // 10.0
        return JSON.stringify(this)
    }
}

addEventListener("resize", () => {
    if (canvas.style.display == "") location.reload()
});


//
// Updates
//

let DT: number;

let _update = () => { };
let _timestamp0: number;

function _updateHandler(timestamp: number) {
    DT = timestamp - _timestamp0;
    _timestamp0 = timestamp;

    _update();
    requestAnimationFrame(_updateHandler);
}

requestAnimationFrame(timestamp => _timestamp0 = timestamp)
requestAnimationFrame(_updateHandler)

/**
 * Runs the `update`-function once for every screen update.
 * @example
 * Draw a circle at random postiton each update
 * ```
 * setUpdate(() => {
 *     circle(random(W), random(H), 10)
 * })
 * ```
 * @example
 * Count the number of updates between two space pressings.
 * ```
 * text("Press space twice.")
 * setUpdate(() => {
 *     if (keyboard.space) {
 *         keyboard.space = false
 *         let n = 0
 *       
 *         setUpdate(() => {
 *             clear()
 *             n++
 *             text(n)
 *
 *             if (keyboard.space) {
 *                 setUpdate()
 *             }
 *         })
 *     }
 * })
 * ```
 */
function setUpdate(update = () => { }) {
    if (arguments.length > 0) canvas.focus();       // 10.0
    _update = update;
}


//
// Utilities
//

/**
 * Create an array filled with values returned by the `callback`-function. 
 * @example
 * Create the array `[0, 2, 4, 6, 8, 10]`:
 * ```
 * let a = array(6, i => 2 * i)
 * ``` 
 */
function array<T>(length: number, callback: ((index: number) => T)): T[];
/**
 * Creates an array filled with `value`.
 * @example
 * Create the array `["-", "-", "-", "-", "-"]`:
 * ```
 * let a = array(5, "-")
 * ``` 
 */
function array<T>(length: number, value: Exclude<T, Function>): T[];
function array(length: number, value: unknown) {
    return Array.from({ length }, (_, i) =>
        typeof value == "function" ? value(i) : value);
}

/**
 * Create a 2D-array filled with values returned by the `callback`-function. 
 */
function array2D<T>(rows: number, columns: number, callback: ((rowIndex: number, columnIndex: number) => T)): T[][];        // 10.0
/** 
 * Create a 2D-array filled with `value`.
 */
function array2D<T>(rows: number, columns: number, value: Exclude<T, Function>): T[][];
function array2D(rows: number, columns: number, value: unknown) {
    return Array.from({ length: rows }, (_, i) =>
        Array.from({ length: columns }, (_, j) =>
            typeof value == "function" ? value(i, j) : value));
}

let _audioContext: AudioContext;
const _audioList: [OscillatorNode, GainNode][] = [];

/**
 * Plays a beep. A user interaction is mandatory.
 * @example
 * Beeps for two seconds:
 * ```
 * let f = +await read("Frequency (Hz): ")
 * beep(f, 2000)
 * ```
 */
function beep(frequency = 800, msDuration = 200, volume = 1): Promise<void> {
    if (!_audioContext) _audioContext = new AudioContext();

    return new Promise(resolve => {
        let audioItem = _audioList.find(item => item[0].frequency.value == frequency)
        if (!audioItem) {
            const oscillator = _audioContext.createOscillator();
            const gain = _audioContext.createGain();

            oscillator.connect(gain);
            oscillator.type = "square";
            gain.connect(_audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.start();

            audioItem = [oscillator, gain];
            _audioList.push(audioItem);

            oscillator.onended = () => {
                _audioList.splice(_audioList.indexOf(audioItem!), 1);
                resolve();
            }
        }

        audioItem[1].gain.value = volume;
        audioItem[0].stop(_audioContext.currentTime + msDuration / 1000);
    });
}

/**
 * Returns the character corresponding to character code `charCode`.
 * @example
 * ```
 * write(char(65))      // A   
 * ```   
 */
function char(charCode: number) {
    return String.fromCodePoint(charCode);
}

/**
 * Returns the character code corresponding to character `char`.
 * @example
 * ```
 * write(charCode("A"))      // 65   
 * ```   
*/
function charCode(char: string) {
    return char.codePointAt(0);
}

/**
 * Returns `radAngle`, an angle in radians, to degrees. 
 * @example
 * ```
 * write(degrees(Math.PI))      // 180   
 * ```   
 */
function degrees(radAngle: number): number {
    return radAngle * 180 / Math.PI;
}

/**
 *  Returns the distance between (`x1`, `y1`) and (`x2`, `y2`). 
 */
function distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.hypot(x2 - x1, y2 - y1);
}

/**
 * Returns the point with polar coordinates (`radius`, `degAngle`). 
 */
function pointFromPolar(radius: number, degAngle: number, x0 = 0, y0 = 0): [x: number, y: number] {
    const a = radians(degAngle);
    return [x0 + Math.cos(a) * radius, y0 + Math.sin(a) * radius];
}

/**
 * Returns `degAngle`, an angle in degrees, to radians. 
 * @example
 * ```
 * write(radians(180))      // 3.141592653589793 
 * ```   
 */
function radians(degAngle: number): number {
    return degAngle * Math.PI / 180;
}

function random(upTo: number) {
    return Math.floor(Math.random() * upTo);
}

/**
 * Returns a random integer between `min` and `max` (both included).
 * 
 * @example
 * Throw a die:
 * ```
 * let die = randomInt(1, 6)
 * ``` 
*/
function randomInt(min: number, max: number): number {
    return Math.floor(min + Math.random() * (max - min + 1));
}

function randomNumber(min: number, max: number, step = 1) {
    return min + Math.floor(Math.random() * Math.floor((max - min) / step + 1)) * step;
}

/**
 * Returns a random item from `items`, the argument list.
 * @example
 * A random color:
 * ```
 * let color = randomItem("red", "green", "blue")
 * ``` 
 */
function randomItem<T>(...items: T[]): T {
    return items[random(items.length)];
}

/**
 * Returns a RGBA color. 
 * Values `r`(ed), `g`(reen) and `b`(lue) are integers in the interval 0 to 255.
 * Value `a`(lpha) is between `0` and `1`.
 */
function rgba(r: number, g: number, b: number, a = 1): string {
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Shuffles `array` in place.
 */
function shuffle(array: unknown[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = random(i + 1);
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Pauses the execution för `msDuration` ms.
 * @example
 * Show a green screen after 3 seconds:
 * ```
 * fill("red")
 * await sleep(3000)
 * fill("green")
 * ``` 
 */
function sleep(msDuration: number): Promise<void> {
    return new Promise<void>(resolve => setTimeout(() => resolve(), msDuration));
}

class Vector {
    constructor(
        public x: number,
        public y: number
    ) {
    }

    static fromPolar(length: number, angle: number): Vector {
        return new Vector(Math.cos(angle) * length, Math.sin(angle) * length);
    }

    get length(): number {
        return Math.hypot(this.x, this.y);
    }

    set length(value: number) {
        const angle = this.angle;
        this.x = value * Math.cos(angle);
        this.y = value * Math.sin(angle);
    }

    get angle(): number {
        return Math.atan2(this.y, this.x);
    }

    set angle(value: number) {
        const length = this.length;
        this.x = length * Math.cos(value);
        this.y = length * Math.sin(value);
    }

    clone(): Vector {
        return new Vector(this.x, this.y);
    }

    normalize() {
        const angle = this.angle;
        this.x = Math.cos(angle);
        this.y = Math.sin(angle);
    }

    toNormalized(): Vector {
        const angle = this.angle;
        return new Vector(Math.cos(angle), Math.sin(angle));
    }

    add(v: Vector) {
        this.x += v.x;
        this.y += v.y;
    }

    adding(v: Vector): Vector {             // 10.0
        return new Vector(this.x + v.x, this.y + v.y);
    }

    subtract(v: Vector) {
        this.x -= v.x;
        this.y -= v.y;
    }

    subtracting(v: Vector): Vector {            // 10.0
        return new Vector(this.x - v.x, this.y - v.y);
    }

    multiply(v: Vector) {
        this.x *= v.x;
        this.y *= v.y;
    }

    multiplying(v: Vector): Vector {        // 10.0
        return new Vector(this.x * v.x, this.y * v.y);
    }

    divide(v: Vector) {
        this.x /= v.x;
        this.y /= v.y;
    }

    dividing(v: Vector): Vector {           // 10.0
        return new Vector(this.x / v.x, this.y / v.y);
    }

    scale(s: number) {
        this.x *= s;
        this.y *= s;
    }

    toScaled(s: number): Vector {
        return new Vector(this.x * s, this.y * s);
    }

    distanceTo(v: Vector): number {
        return Math.hypot(this.x - v.x, this.y - v.y);
    }

    directionTo(v: Vector): Vector {
        const angle = Math.atan2(v.y - this.y, v.x - this.x);
        return new Vector(Math.cos(angle), Math.sin(angle));
    }

    dot(v: Vector): number {
        return this.x * v.x + this.y * v.y;
    }

    toString(): string {
        return `(${this.x}, ${this.y})`;
    }
}


//
// I/O
//

const io = document.getElementById("io") as HTMLDivElement;

const _params = new URL(location.href).searchParams;
const _iParam = _params.get("i");               // input
let _inputLines: string[] = [];
let _inputLineIndex = 0;
let _output$: HTMLDivElement | null;

if (_iParam != null) {
    _inputLines = decodeURIComponent(_iParam).split("\n");
}

/**
 * Writes the `prompt`, and waits for user input. Hides the canvas.
 * @example
 * ```
 * let name = await read("Your name? ")
 * ```
 */
function read(prompt = ""): Promise<string> {
    ui.style.flex = "";

    const input$ = element("div", prompt, io);
    input$.className = "input";

    _output$ = null;     // 10.0

    return new Promise<string>((resolve) => {
        if (_inputLines[_inputLineIndex] != null) {
            element("b", _inputLines[_inputLineIndex], input$)
            resolve(_inputLines[_inputLineIndex++]);
        } else {
            const value$ = element("b", input$)
            value$.contentEditable = "true"
            value$.focus();

            input$.onclick = () => value$.focus();

            value$.onkeydown = event => {
                if (event.code == "Enter") {
                    event.preventDefault();
                    value$.contentEditable = "false";

                    _inputLines[_inputLineIndex] = value$.textContent!;
                    resolve(_inputLines[_inputLineIndex++]);
                }
            }
        }
    });
}

/**
 * Writes `value` to the screen. Hides the canvas.
 * 
 * @example
 * ```
 * write("On row 1.")  
 * write("On row 2.")
 * ```  
 * @example
 * ```
 * write("On row 1.", " ")  
 * write("Also on row 1.")
 * ```  
 * @example
 * ```
 * write()  // Line break  
 * ```  
 */
function write(value?: unknown, end: "" | " " | "\t" | "\n" = "\n") {
    if (!_output$) {
        ui.style.flex = "";

        _output$ = element("div", io);
        _output$.className = "output";
    }

    _output$.textContent! += arguments.length > 0 ? str(value) + end : "\n";
}

/**
 * Writes `values` to the screen, separated by one space. Hides the canvas.
 * @example
 * ```
 * writeAll(2, 3, 5, 7, 11)   // 2 3 5 7 11
 * ```  
 */
function writeAll(...values: unknown[]) {           // 10.1
    write(values.map(value => str(value)).join(" "))
}

/**
 * Clears the `io`-element (containing user input/output).
 */
function clearIO() {
    io.innerHTML = "";
    _output$ = null;

    canvas.style.display = "none";
    if (ui.hasChildNodes()) ui.style.flex = "1";
}

window.addEventListener("load", () => {
    const oParam = _params.get("o");        // output
    if (oParam != null) {
        element("hr", io);          // 10.0
        const resp$ = element("p", io);
        resp$.className = "output";
        resp$.style.color = "black";

        const oValue = decodeURIComponent(oParam);
        let output = _output$!.textContent!.split("\n").map(line => line.trimEnd()).join("\n").trimEnd() ?? "";

        if (output == oValue) {
            resp$.style.backgroundColor = "palegreen";
            resp$.textContent = output;
        } else {
            let offset = 0;
            while (output[offset] == oValue[offset]) {
                offset++
            }

            let correct = oValue.slice(0, offset);
            let incorrect = oValue.slice(offset) + " ".repeat(Math.max(0, output.length - oValue.length));
            resp$.innerHTML = `<span style="background-color: palegreen">${correct}</span>`;
            resp$.innerHTML += `<span style="background-color: lightsalmon">${incorrect}</span>`;
        }
    }

    const testParam = _params.get("test");
    if (testParam != null) {
        element("button", "from: program", element("p", document.body)).onclick = () => {
            _params.set("i", encodeURIComponent(_inputLines?.join("\n")));
            let output = _output$!.textContent!.split("\n").map(line => line.trimEnd()).join("\n").trimEnd() ?? "";
            _params.set("o", encodeURIComponent(output));
            _params.delete("test");

            window.open(window.location.origin + "?" + _params, "_blank");
        }

        let testInput$ = element("textarea", "input:", document.body)
        testInput$.rows = 4;

        element("input:file", document.body).oninput = (e) => {
            const fr = new FileReader();

            fr.onload = (e) => {
                testInput$.value = (e.target!.result as string);
            }

            fr.readAsText((e.target! as HTMLInputElement).files![0]);
        }

        let testOutput$ = element("textarea", "output:", document.body)
        testOutput$.rows = 4;

        element("input:file", document.body).oninput = (e) => {
            const fr = new FileReader();

            fr.onload = (e) => {
                testOutput$.value = (e.target!.result as string).trimEnd();
            }

            fr.readAsText((e.target! as HTMLInputElement).files![0]);
        }

        element("button", "from: text", element("p", document.body)).onclick = () => {
            _params.set("i", encodeURIComponent(testInput$.value));
            _params.set("o", encodeURIComponent(testOutput$.value.trimEnd()));
            _params.delete("test");

            window.open(window.location.origin + "?" + _params, "_blank");
        }
    }
});


//
// UI
//

const ui = document.getElementById("ui") as HTMLDivElement;

function clearUI() {        // 10.0
    ui.innerHTML = "";
}

/**
 * Shows the canvas and recalculates its width (`W`) and height (`H`). 
 */
function resetCanvas() {
    canvas.style.display = "";      // 10.0

    W = parseInt(getComputedStyle(canvas).width);
    H = parseInt(getComputedStyle(canvas).height);

    for (const layer in _canvasLayers) {
        _canvasLayers[layer].width = W;
        _canvasLayers[layer].height = H;
    }

    setLayer(0);        // 10.0
}

canvas.tabIndex = 0;
resetCanvas();

// 10.0
function setLayer(layer: number) {
    if (!_ctxs[layer]) {
        let canvasLayer = element("canvas", canvas);
        canvasLayer.width = W;
        canvasLayer.height = H;
        canvasLayer.style.zIndex = layer.toString();
        _canvasLayers[layer] = canvasLayer;
        _ctxs[layer] = canvasLayer.getContext("2d")!;
    }

    _layer = layer;
    ctx = _ctxs[_layer];
}

type _InputType = "checkbox" | "color" | "date" | "datetime-local" | "file" | "number" |
    "password" | "radio" | "range" | "time";

type _TagNameMap = HTMLElementTagNameMap & {
    [key in `input:${_InputType}`]: HTMLInputElement;
}

interface TagNameMap extends _TagNameMap { }

type _VoidElement = "area" | "base" | "br" | "col" | "command" | "embed" | "hr" |
    "img" | "input" | `input:${_InputType}` | "keygen" | "link" | "meta" | "param" | "source" | "track" | "wbr";

type LabableElement = "input" | `input:${_InputType}` | "meter" | "output" | "progress" | "select" | "textarea";

/**
 * Creates a `tagName`-element.
 */
function element<K extends keyof TagNameMap>(
    tagName: K,
): TagNameMap[K];
/**
 * Creates a `tagName`-element, with optional `textContent`, and adds it to the page. Hides the canvas.
 */
function element<K extends keyof Omit<TagNameMap, _VoidElement | LabableElement>>(
    tagName: K,
    content: string,
    parent?: HTMLElement,
    before?: Node
): TagNameMap[K];
/**
 * Creates a `tagName`-element, with an optional `label`, and adds it to the page. Hides the canvas.
*/
function element<K extends keyof Pick<TagNameMap, LabableElement>>(
    tagName: K,
    label: string | [string, "top" | "right" | "bottom" | "left"],         // 10.0
    parent?: HTMLElement,
    before?: Node
): TagNameMap[K];
/**
 * Creates a `tagName`-element and adds it to the page. Hides the canvas.
 */
function element<K extends keyof TagNameMap>(
    tagName: K,
    parent: HTMLElement,
    before?: Node
): TagNameMap[K];
function element<K extends keyof TagNameMap>(
    tagName: K,
    arg1?: string | string[] | HTMLElement,
    arg2?: HTMLElement | Node,
    arg3?: Node
): TagNameMap[K] {
    let elt: TagNameMap[K];

    let position: string | undefined            // 10.0
    if (Array.isArray(arg1)) {
        position = arg1[1];
        arg1 = arg1[0];
    }

    if (typeof arg1 == "string") {
        if (["input", "meter", "output", "progress", "select", "textarea"].includes(tagName.split(":")[0])) {
            const label$ = element("label", arg2 as HTMLElement, arg3);
            element("span", arg1, label$);
            label$.className = position ?? (["input:checkbox", "input:radio"].includes(tagName) ? "right" : "top");

            return element(tagName, label$);
        }

        elt = document.createElement(tagName) as TagNameMap[K];

        if (tagName == "fieldset") {
            element("legend", arg1, elt as HTMLFieldSetElement);
        } else if (tagName == "details") {
            element("summary", arg1, elt as HTMLDetailsElement);
        } else if (tagName == "table") {
            element("caption", arg1, elt as HTMLTableCaptionElement);
        } else {
            elt.textContent = arg1;
        }
    } else {
        [arg3, arg2] = [arg2, arg1];

        if (tagName.startsWith("input:")) {
            elt = document.createElement("input") as TagNameMap[K];
            (elt as HTMLInputElement).type = tagName.slice(6);
        } else {
            elt = document.createElement(tagName) as TagNameMap[K];
        }
    }

    const parent: HTMLElement = (arg2 as HTMLElement) ?? ui;
    parent.insertBefore(elt, parent.insertBefore(document.createTextNode("\n"), arg3 ?? null));

    if (tagName == "input:radio") {
        (elt as HTMLInputElement).name = _getLegend(parent);
    }

    if (parent == ui || parent == io) canvas.style.display = "none";                                // 10.0

    return elt;
}

function _getLegend(elt: HTMLElement) {
    if (elt instanceof HTMLBodyElement) return " ";
    if (elt instanceof HTMLFieldSetElement && elt.firstElementChild instanceof HTMLLegendElement) return elt.firstElementChild.textContent!;
    return _getLegend(elt.parentElement!)
}

function getLabel(labeledElement: HTMLElement): string
function getLabel(labeledElement: HTMLElement, get: "element"): HTMLSpanElement
function getLabel(labeledElement: HTMLElement, get: "component"): HTMLLabelElement
function getLabel(labeledElement: HTMLElement, get?: "element" | "component") {
    if (get == null) return labeledElement.previousElementSibling?.textContent;
    if (get == "element") return labeledElement.previousElementSibling as HTMLSpanElement;
    if (get == "component") return labeledElement.parentElement as HTMLLabelElement;
}

/**
 * Sets the label for `labeledElement`. 
 */
function setLabel(labeledElement: HTMLElement, value: string) {
    if (labeledElement.previousElementSibling) labeledElement.previousElementSibling.textContent = value;
}

/**
 * Sets the location of `elt`.
 */
function setLocation(elt: HTMLElement, settings: {                              // 10.0
    left?: number
    top?: number
    right?: number
    bottom?: number
}): void {
    if (elt.parentElement instanceof HTMLLabelElement) {
        elt = elt.parentElement
    }

    elt.parentElement!.style.position = "relative";
    elt.parentElement!.style.flex = "1";
    elt.style.position = "absolute";

    for (const [key, value] of Object.entries(settings)) {
        elt.style.setProperty(key, value + "px");
    }
}


//
// Error handling
//

let _repetition = 1;
let _repetition$: HTMLSpanElement;
let _lastValue = ["", ""];
const _console$ = document.getElementById("console") ?? document.createElement("div");  // 11.0  

window.onerror = (_event, _source, _lineno, _colno, error) => {
    _writeConsole("error", str(error))
}

let _log = console.log;
console.log = (...args: any[]) => {     // 10.0
    _log(...args);

    _writeConsole("log", args.map(arg => str(arg)).join(" "));
}

function _writeConsole(...value: string[]) {
    if (value[0] == _lastValue[0] && value[1] == _lastValue[1]) {
        _repetition$.textContent = " *" + ++_repetition;
    } else {
        let $ = element("div", value[1], _console$!);
        $.className = value[0];
        $.scrollIntoView()
        _repetition$ = element("span", $)
        _repetition = 1;
        _lastValue = value;
    }
}

function clearConsole() {           // 10.0
    _console$.innerHTML = "";
    _lastValue = ["", ""];
}

_console$.onclick = () => {
    clearConsole();
}

window.addEventListener("unhandledrejection", event => {     // 10.0 
    throw event.reason;
});