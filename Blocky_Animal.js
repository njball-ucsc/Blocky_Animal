// Instantiate gl and shaders globally
let gl;
let canvas;
let a_Position;
let u_FragColor;
let g_globalAngle = 0;
let g_rArmAngle = 25;
var color = [1.0, 0.0, 0.0, 1.0];

// Vertex shader program
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    void main() {
        gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    }`

// Fragment shader program
var FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
        gl_FragColor = u_FragColor;
    }`

function main() {
    // Retrieve canvas
    setupWebGL();

    // Initialize shaders
    connectVariablesToGLSL();

    // Instantiate UI actions
    addHtmlUiActions();

    // Initialize the scene
    renderAllShapes();
}

function setupWebGL() {
    canvas = document.getElementById('Animal');
    if (!canvas) {
        console.log('Failed to retrieve the canvas');
        return;
    }

    // Retrieve WebGL rendering context
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) {
        console.log('Failed to retrieve rendering context');
        return;
    }

    // Enable depth test
    gl.enable(gl.DEPTH_TEST);

    // Event listener for canvas clicks
    // canvas.onmousedown = function(ev){ click(ev) };
    // canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };
}

function addHtmlUiActions() {
    // Sliders
    document.getElementById('angleS').addEventListener('mousemove', function()  { g_globalAngle = this.value; renderAllShapes(); });
    document.getElementById('rArmS').addEventListener('mousemove', function()  { g_rArmAngle = this.value; renderAllShapes(); });

    // Buttons
    /**document.getElementById('clear').onclick = function() {
        queue = [];
        frogDrawn = false;
        renderAllShapes();
    }**/
}

function clearCanvas() {
     gl.clearColor(0.0, 0.0, 0.0, 1.0); // Set a black color
     gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
     console.log('cleared canvas');
}

function connectVariablesToGLSL() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders');
        return;
    }

    // Get attribute/uniform locations
    a_Position  = gl.getAttribLocation(gl.program, 'a_Position');
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (a_Position < 0 || !u_FragColor || !u_ModelMatrix || !u_GlobalRotateMatrix) {
        console.error('Failed to get variable locations');
        return;
    }

    // Initialize model matrix to identity
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

function renderAllShapes() {
    // Pass rotation to model matrix
    var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    clearCanvas();
    /**var len = queue.length;
    for(var i = 0; i < len; i++ ) {
        queue[i].render();
    }**/

    // Draw the body
    var body = new Cube();
    body.color = [0.2, 0.8, 0.2, 1.0];
    body.matrix.translate(-0.25, 0, 0);
    body.matrix.rotate(0,0,0,1);
    var bodyPosMat = new Matrix4(body.matrix);
    body.matrix.scale(0.62, 0.5, 0.5);
    body.render();

    var belly = new Cube();
    belly.color = [0.2, 0.8, 0.2, 1.0];
    belly.matrix.translate(-0.35, -0.65, -0.10);
    belly.matrix.rotate(0,0,0,1);
    var bellyPosMat = new Matrix4(belly.matrix);
    belly.matrix.scale(0.82, 0.7, 0.7);
    belly.render();

    
    // Draw the right arm
    var rightArm = new Cube();
    rightArm.color = [0.2, 0.8, 0.2, 1.0];
    rightArm.matrix = bodyPosMat;
    rightArm.matrix.translate(0.5, 0, .125);
    rightArm.matrix.rotate(g_rArmAngle, 0,0,1);
    var rightArmPosMat = new Matrix4(rightArm.matrix);
    rightArm.matrix.scale(0.25, -.5, .25);
    rightArm.render();

    // Draw the right hand
    var rightHand = new Cube();
    rightHand.color = [0.2, 0.8, 0.2, 1.0];
    rightHand.matrix = rightArmPosMat;
    rightHand.matrix.translate(-0.05, -0.65, 0.05);
    rightHand.matrix.rotate(-25, 0,0,1);
    rightHand.matrix.scale(0.15, .3, .15);
    rightHand.render();
}

/**function click(ev) {
    
}

function spellCast() {
    // Generate background gradient
    createRandomGradient();

    // Possible special effect
    const effects = [
        () => pulseEffect(),
        () => rippleEffect(),
        () => shakeEffect(),
    ];

    // Pick 1-2
    const effectCount = Math.random() > 0.5 ? (Math.random() > 0.5 ? 3 : 2) : 1;
    for (i = 0; i < effectCount; i++) {
        const randEffect = effects[Math.floor(Math.random() * 3)];
        randEffect();
    }
}

function createRandomGradient() {
    const gradientTypes = ['linear', 'radial', 'conic'];
    const type = gradientTypes[Math.floor(Math.random() * 3)];

    const color1 = getRandomColor();
    const color2 = getRandomColor();
    const color3 = Math.random() > 0.5 ? getRandomColor() : null;

    let gradientString;
    let pos = 0;

    switch(type) {
        case 'linear':
            const directions = [
                'to top', 'to bottom', 'to left', 'to right', 'to top left',
                'to top right', 'to bottom left', 'to bottom right',
                `${Math.floor(Math.random() * 360)}deg`
            ];
            const dir = directions[Math.floor(Math.random() * directions.length)];
            
            gradientString = color3
                ? `linear-gradient(${dir}, ${color1}, ${color2}, ${color3})`
                : `linear-gradient(${dir}, ${color1}, ${color2})`;
            break;

        case 'radial':
            const shapes = ['circle', 'ellipse'];
            const shape = shapes[Math.floor(Math.random() * 2)];
            const sizeKeywords = [
                'closest-side', 'farthest-side',
                'closest-corner', 'farthest-corner'
            ];

            const size = sizeKeywords[Math.floor(Math.random() * sizeKeywords.length)];
            pos = `${Math.floor(Math.random() * 100)}% ${Math.floor(Math.random() * 100)}%`

            gradientString = color3
                ? `radial-gradient(${shape} ${size} at ${pos}, ${color1}, ${color2}, ${color3})`
                : `radial-gradient(${shape} ${size} at ${pos}, ${color1}, ${color2})`;
            break;

        case 'conic':
            const stAngle = Math.floor(Math.random() * 360);
            pos = `${Math.floor(Math.random() * 100)}% ${Math.floor(Math.random() * 100)}%`;

            gradientString = color3
                ? `conic-gradient(from ${stAngle}deg at ${pos}, ${color1}, ${color2}, ${color3})`
                : `conic-gradient(from ${stAngle}deg at ${pos}, ${color1}, ${color2})`;
            break;
    }

    document.body.style.background = gradientString;
    document.body.style.backgroundBlendMode = [
        'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge',
        'color-burn', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'
    ][Math.floor(Math.random() * 14)];
}

function getRandomColor() {
    // Chance for vibrant
    if (Math.random() > 0.33) {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 100%, 50%)`;
    } else {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgb(${r}, ${g}, ${b})`;
    }
}

function addRandomShape() {
    // Generate random type
    const shapeTypes = [POINT, TRIANGLE, CIRCLE];
    const randType = shapeTypes[Math.floor(Math.random() * 3)];

    // Generate random position between -1 and 1
    const x = Math.random() * 2 - 1; 
    const y = Math.random() * 2 - 1;
    
    // Generate random color
    const randColor = getRandomColorArray();

    // Draw shape
    let shape;
    switch(randType) {
        case POINT:
            shape = new Point();
            break;
        case TRIANGLE:
            shape = new Triangle();
            break;
        case CIRCLE:
            shape = new Circle();
            shape.segments = 6 + Math.floor(Math.random() * 7);
            break;
    }

    shape.position = [x, y];
    shape.color = randColor;

    queue.push(shape);
}

function getRandomColorArray() {
    return [
        Math.random(),
        Math.random(),
        Math.random(),
        1.0
    ];
}

// Special effects
function pulseEffect() {
    document.body.style.animation = 'pulse 0.5s';
    setTimeout(() => {
        document.body.style.animation = '';
    }, 500);
}

function rippleEffect() {
    const ripple = document.createElement('div');

    // Random Position
    const x = Math.floor(Math.random() * 100);
    const y = Math.floor(Math.random() * 100);

    // Random color
    const rippleColor = getRandomColor();
    const opacity = 0.3 + Math.random() * 0.4;

    ripple.style.cssText = `
        position: fixed;
        top: ${x}%;
        left: ${y}%;
        width: 0;
        height: 0;
        background: ${rippleColor.replace(')', `, ${opacity})`).replace('rgb', 'rgba')};
        border-radius: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        animation: ripple 1s ease-out;
    `;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 1000);
}

function shakeEffect() {
    document.body.style.animation = 'shake 0.5s';
    setTimeout(() => {
        document.body.style.animation = '';
    }, 500);
}**/
