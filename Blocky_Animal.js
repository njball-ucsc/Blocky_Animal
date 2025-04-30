// Instantiate gl and shaders globally
let gl;
let canvas;
let a_Position;
let u_FragColor;
var color = [1.0, 0.0, 0.0, 1.0];
let g_xAngle = 0;
let g_yAngle = 0;
let g_headAng = 0;
let g_rShoulderAng = 0;
let g_lShoulderAng = 0;
let g_rThighAng = 0;
let g_lThighAng = 0;
let g_rHandAng = 0;
let g_lHandAng = 0;
let g_rLegAng = 0;
let g_lLegAng = 0;
let g_time = 0;
let g_prevTime = 0;
let g_animateJump = false;
let g_animateSpell = false;


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

    // Start animation tick
    tick();
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
    gl.depthFunc(gl.LEQUAL);

    // Event listener for canvas clicks
    // canvas.onmousedown = function(ev){ click(ev) };
    canvas.onmousemove = function(ev) { if(ev.buttons == 1) { rotate(ev) } };
}

function addHtmlUiActions() {
    // Sliders
    document.getElementById('xAngleS').addEventListener('mousemove', function()  { g_xAngle = this.value; renderAllShapes(); });
    document.getElementById('yAngleS').addEventListener('mousemove', function()  { g_yAngle = this.value; renderAllShapes(); });
    document.getElementById('headAng').addEventListener('mousemove', function()  { g_headAng = this.value; renderAllShapes(); });
    document.getElementById('rShoulderAng').addEventListener('mousemove', function()  { g_rShoulderAng = this.value; renderAllShapes(); });
    document.getElementById('lShoulderAng').addEventListener('mousemove', function()  { g_lShoulderAng = this.value; renderAllShapes(); });
    document.getElementById('rThighAng').addEventListener('mousemove', function()  { g_rThighAng = this.value; renderAllShapes(); });
    document.getElementById('lThighAng').addEventListener('mousemove', function()  { g_lThighAng = this.value; renderAllShapes(); });
    document.getElementById('rHandAng').addEventListener('mousemove', function()  { g_rHandAng = this.value; renderAllShapes(); });
    document.getElementById('lHandAng').addEventListener('mousemove', function()  { g_lHandAng = this.value; renderAllShapes(); });
    document.getElementById('rLegAng').addEventListener('mousemove', function()  { g_rLegAng = this.value; renderAllShapes(); });
    document.getElementById('lLegAng').addEventListener('mousemove', function()  { g_lLegAng = this.value; renderAllShapes(); });

    document.getElementById('animateJump').onclick = function() {
        g_animateSpell = false;
        resetAnimation();
        g_animateJump = true;
    }

    document.getElementById('animateSpell').onclick = function() {
        g_animateJump = false;
        resetAnimation();
        g_animateSpell = true;
    }

    document.getElementById('resetButton').onclick = function() { resetAnimation(); }

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
    var globalRotMat = new Matrix4().rotate(g_xAngle, 0,1,0).rotate(-g_yAngle, 1,0,0);

    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    clearCanvas();

    // Body
    var belly = new Dodec();
    belly.color = [0.2, 0.8, 0.2, 1.0];
    belly.matrix.translate(0, 0.25, 0);
    belly.matrix.scale(0.2, 0.2, 0.2);
    //belly.matrix.rotate(g_time, 0, 0, 1);
    var bellyPosMat = new Matrix4(belly.matrix);
    belly.render();

    // 1st joints
    var head = new Dodec();
    head.color = belly.color;
    head.connectPart(bellyPosMat, 3, 0.65, 2.25);
    head.matrix.rotate(g_headAng, 0, 0, 1);
    var headPosMat = new Matrix4(head.matrix);
    head.render();

    var rShoulder = new Dodec();
    rShoulder.color = belly.color;
    rShoulder.connectPart(bellyPosMat, 2, 0.40, 2.5);
    rShoulder.matrix.rotate(g_rShoulderAng, 0, 1, 0);
    var rShoulderPosMat = new Matrix4(rShoulder.matrix);
    rShoulder.render();

    var lShoulder = new Dodec();
    lShoulder.color = belly.color;
    lShoulder.connectPart(bellyPosMat, 4, 0.40, 2.5);
    lShoulder.matrix.rotate(g_lShoulderAng, 0, 1, 0);
    var lShoulderPosMat = new Matrix4(lShoulder.matrix);
    lShoulder.render();

    var rThigh = new Dodec();
    rThigh.color = belly.color;
    rThigh.connectPart(bellyPosMat, 7, 0.50, 2);
    rThigh.matrix.rotate(g_rThighAng, 1, 0, 0);
    var rThighPosMat = new Matrix4(rThigh.matrix);
    rThigh.render();

    var lThigh = new Dodec();
    lThigh.color = belly.color;
    lThigh.connectPart(bellyPosMat, 10, 0.50, 2);
    lThigh.matrix.rotate(g_lThighAng, 1, 0, 0);
    var lThighPosMat = new Matrix4(lThigh.matrix);
    lThigh.render();

    // 2nd joints
    var rEye = new Dodec();
    rEye.color = [1, 1, 1, 1];
    rEye.connectPart(headPosMat, 2, 0.45, 2);
    var rEyePosMat = new Matrix4(rEye.matrix);
    rEye.render();

    var lEye = new Dodec();
    lEye.color = [1, 1, 1, 1];
    lEye.connectPart(headPosMat, 4, 0.45, 2);
    var lEyePosMat = new Matrix4(lEye.matrix);
    lEye.render();

    var rArm = new Dodec();
    rArm.color = rShoulder.color;
    rArm.connectPart(rShoulderPosMat, 2, 0.8, 1.5);
    var rArmPosMat = new Matrix4(rArm.matrix);
    rArm.render();

    var lArm = new Dodec();
    lArm.color = lShoulder.color;
    lArm.connectPart(lShoulderPosMat, 4, 0.8, 1.5);
    var lArmPosMat = new Matrix4(lArm.matrix);
    lArm.render();

    var rLeg = new Dodec();
    rLeg.color = rThigh.color;
    rLeg.connectPart(rThighPosMat, 8, 0.8, 1);
    rLeg.matrix.rotate(g_rLegAng, 1, 0, 0);
    var rLegPosMat = new Matrix4(rLeg.matrix);
    rLeg.render();

    var lLeg = new Dodec();
    lLeg.color = lThigh.color;
    lLeg.connectPart(lThighPosMat, 9, 0.8, 1);
    lLeg.matrix.rotate(g_lLegAng, 1, 0, 0);
    var lLegPosMat = new Matrix4(lLeg.matrix);
    lLeg.render();

    // 3rd joints
    var rPupil = new Dodec();
    rPupil.color = [0.1, 0.1, 0.1, 1];
    rPupil.connectPart(rEyePosMat, 2, 0.40, 2);
    rPupil.render();

    var lPupil = new Dodec();
    lPupil.color = [0.1, 0.1, 0.1, 1];
    lPupil.connectPart(lEyePosMat, 4, 0.40, 2);
    lPupil.render();

    var rHand = new Dodec();
    rHand.color = rArm.color;
    rHand.connectPart(rArmPosMat, 2, 0.7, 1.25);
    rHand.matrix.rotate(g_rHandAng, 1, 0, 0);
    var rHandPosMat = new Matrix4(rHand.matrix);
    rHand.render();

    var lHand = new Dodec();
    lHand.color = lArm.color;
    lHand.connectPart(lArmPosMat, 4, 0.7, 1.25);
    lHand.matrix.rotate(g_lHandAng, 1, 0, 0);
    var lHandPosMat = new Matrix4(lHand.matrix);
    lHand.render();

    var rKnee = new Dodec();
    rKnee.color = rLeg.color;
    rKnee.connectPart(rLegPosMat, 12, 0.65, 1.5);
    var rKneePosMat = new Matrix4(rKnee.matrix);
    rKnee.render();

    var lKnee = new Dodec();
    lKnee.color = lLeg.color;
    lKnee.connectPart(lLegPosMat, 12, 0.65, 1.5);
    var lKneePosMat = new Matrix4(lKnee.matrix);
    lKnee.render();

    // 4th joints
    var rFinger1 = new Dodec();
    rFinger1.color = rHand.color;
    rFinger1.connectPart(rHandPosMat, 3, 0.35, 3.5);
    var rFinger1PosMat = new Matrix4(rFinger1.matrix);
    rFinger1.render();

    var lFinger1 = new Dodec();
    lFinger1.color = lHand.color;
    lFinger1.connectPart(lHandPosMat, 3, 0.35, 3.5);
    var lFinger1PosMat = new Matrix4(lFinger1.matrix);
    lFinger1.render();

    var rFinger2 = new Dodec();
    rFinger2.color = rHand.color;
    rFinger2.connectPart(rHandPosMat, 2, 0.35, 3.5);
    var rFinger2PosMat = new Matrix4(rFinger2.matrix);
    rFinger2.render();

    var lFinger2 = new Dodec();
    lFinger2.color = lHand.color;
    lFinger2.connectPart(lHandPosMat, 4, 0.35, 3.5);
    var lFinger2PosMat = new Matrix4(lFinger2.matrix);
    lFinger2.render();

    var rFinger3 = new Dodec();
    rFinger3.color = rHand.color;
    rFinger3.connectPart(rHandPosMat, 6, 0.35, 3.5);
    var rFinger3PosMat = new Matrix4(rFinger3.matrix);
    rFinger3.render();

    var lFinger3 = new Dodec();
    lFinger3.color = lHand.color;
    lFinger3.connectPart(lHandPosMat, 5, 0.35, 3.5);
    var lFinger3PosMat = new Matrix4(lFinger3.matrix);
    lFinger3.render();

    var rFoot = new Dodec();
    rFoot.color = rKnee.color;
    rFoot.connectPart(rKneePosMat, 11, 1, 0.85);
    var rFootPosMat = new Matrix4(rFoot.matrix);
    rFoot.render();

    var lFoot = new Dodec();
    lFoot.color = lKnee.color;
    lFoot.connectPart(lKneePosMat, 11, 1, 0.85);
    var lFootPosMat = new Matrix4(lFoot.matrix);
    lFoot.render();

    // 5th joints
    var rFinger1l = new Dodec();
    rFinger1l.color = rFinger1.color;
    rFinger1l.connectPart(rFinger1PosMat, 3, 1, 1.25);
    rFinger1l.render();

    var lFinger1l = new Dodec();
    lFinger1l.color = lFinger1.color;
    lFinger1l.connectPart(lFinger1PosMat, 3, 1, 1.25);
    lFinger1l.render();

    var rFinger2l = new Dodec();
    rFinger2l.color = rFinger1.color;
    rFinger2l.connectPart(rFinger2PosMat, 2, 1, 1.25);
    rFinger2l.render();

    var lFinger2l = new Dodec();
    lFinger2l.color = lFinger1.color;
    lFinger2l.connectPart(lFinger2PosMat, 4, 1, 1.25);
    lFinger2l.render();

    var rFinger3l = new Dodec();
    rFinger3l.color = rFinger1.color;
    rFinger3l.connectPart(rFinger3PosMat, 6, 1, 1.25);
    rFinger3l.render();

    var lFinger3l = new Dodec();
    lFinger3l.color = lFinger1.color;
    lFinger3l.connectPart(lFinger3PosMat, 5, 1, 1.25);
    lFinger3l.render();

    var rToe1 = new Dodec();
    rToe1.color = rFoot.color;
    rToe1.connectPart(rFootPosMat, 5, 0.35, 3.5);
    rToe1.render();

    var lToe1 = new Dodec();
    lToe1.color = lFoot.color;
    lToe1.connectPart(lFootPosMat, 6, 0.35, 3.5);
    lToe1.render();

    var rToe2 = new Dodec();
    rToe2.color = rFoot.color;
    rToe2.connectPart(rFootPosMat, 6, 0.35, 3.5);
    rToe2.render();

    var lToe2 = new Dodec();
    lToe2.color = lFoot.color;
    lToe2.connectPart(lFootPosMat, 5, 0.35, 3.5);
    lToe2.render();

    var rToe3 = new Dodec();
    rToe3.color = rFoot.color;
    rToe3.connectPart(rFootPosMat, 7, 0.35, 3.5);
    rToe3.render();

    var lToe3 = new Dodec();
    lToe3.color = lFoot.color;
    lToe3.connectPart(lFootPosMat, 10, 0.35, 3.5);
    lToe3.render();

    // Staff
    var staffCent = new Dodec();
    staffCent.color = [.78, .47, .29, 1];
    staffCent.connectPart(lHandPosMat, 1, 0.75, 2);
    staffCent.matrix.rotate(-30, 0, 0, 1);
    staffCent.matrix.rotate(15, 0, 1, 0);
    var staffCentPosMat = new Matrix4(staffCent.matrix);
    staffCent.render();

    var staffUp = new Dodec();
    staffUp.color = staffCent.color;
    staffUp.connectPart(staffCentPosMat, 3, 1, 1.8);
    var staffUpPosMat = new Matrix4(staffUp.matrix);
    staffUp.render();

    var staffHead = new Dodec();
    staffHead.color = [.58, .27, .5, 1];
    staffHead.connectPart(staffUpPosMat, 3, 1.5, 1.5);
    staffHead.matrix.rotate(g_time, 0, 0, 1);
    staffHead.render();

    var staffDown = new Dodec();
    staffDown.color = staffCent.color;
    staffDown.connectPart(staffCentPosMat, 11, 1, 1.8);
    var staffDownPosMat = new Matrix4(staffDown.matrix);
    staffDown.render();

    var staffBottom = new Dodec();
    staffBottom.color = staffCent.color;
    staffBottom.connectPart(staffDownPosMat, 11, 1, 1.8);
    var staffDownPosMat = new Matrix4(staffBottom.matrix);
    staffBottom.render();
}

function tick() {
    if (g_animateJump) {
        g_time += 1;
        updateJumpAnimation();
    } else if (g_animateSpell) {
        g_time += 1;
        updateSpellAnimation();
    }
    requestAnimationFrame(tick);
}

function resetAnimation() {
    g_animateJump = false;
    g_animateSpell = false;
    g_time = 0;
    g_prevTime = 0;

    g_headAng = g_rShoulderAng = g_lShoulderAng = g_rThighAng = g_lThighAng = g_rHandAng = g_lHandAng = g_rLegAng = g_lLegAng = g_xAngle = g_yAngle = 0;
    document.getElementById('headAng').value = 0;
    document.getElementById('rShoulderAng').value = 0;
    document.getElementById('lShoulderAng').value = 0;
    document.getElementById('rThighAng').value = 0;
    document.getElementById('lThighAng').value = 0;
    document.getElementById('rHandAng').value = 0;
    document.getElementById('lHandAng').value = 0;
    document.getElementById('rLegAng').value = 0;
    document.getElementById('lLegAng').value = 0;
    document.getElementById('xAngleS').value = 0;
    document.getElementById('yAngleS').value = 0;

    renderAllShapes();
}

function updateJumpAnimation() {
    g_rShoulderAng = 45 * Math.cos(g_time * 0.03);
    g_lShoulderAng = -45 * Math.cos(g_time * 0.03);
    g_rThighAng = -45 * Math.cos(g_time * 0.03) + 45;
    g_lThighAng = -45 * Math.cos(g_time * 0.03) + 45;
    g_rLegAng = -45 * (-1 * Math.cos(g_time * 0.03)) - 45;
    g_lLegAng = -45 * (-1 * Math.cos(g_time * 0.03)) -45;

    document.getElementById('rShoulderAng').value = g_rShoulderAng;
    document.getElementById('lShoulderAng').value = g_lShoulderAng;
    document.getElementById('rThighAng').value = g_rThighAng;
    document.getElementById('lThighAng').value = g_lThighAng;
    document.getElementById('rLegAng').value = g_rLegAng;
    document.getElementById('lLegAng').value = g_lLegAng;
    
    renderAllShapes();
}

function updateSpellAnimation() {
    g_headAng = 25 * Math.sin(g_time * 0.02);
    g_rShoulderAng = 45 * Math.cos(g_time * 0.02);
    g_lShoulderAng = 45 * Math.cos(g_time * 0.02);
    g_rHandAng = -45 * Math.cos(g_time * 0.02) - 45;
    g_lHandAng = -45 * (-1 * Math.cos(g_time * 0.02)) - 45;

    document.getElementById('headAng').value = g_headAng;
    document.getElementById('rShoulderAng').value = g_rShoulderAng;
    document.getElementById('lShoulderAng').value = g_lShoulderAng;
    document.getElementById('rHandAng').value = g_rHandAng;
    document.getElementById('lHandAng').value = g_lHandAng;
    
    renderAllShapes();
    if (g_lHandAng <= -89 && (g_time - g_prevTime) > 100) {
        g_prevTime = g_time;
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
}

function rotate(ev) {
    
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
    
    // Generate random size and color
    const randColor = getRandomColorArray();
    const randSize = 20 + Math.random() * 20;

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
    shape.size = randSize;

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
}

