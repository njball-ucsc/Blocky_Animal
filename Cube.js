class Cube {
    constructor() {
        this.type = 'cube';
        //this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 0.0, 0.0, 1.0];
        //this.size = 10;
        //this.segments = 10;
        this.matrix = new Matrix4();
    }

    render() {
        //var xy = this.position;
        var rgba = this.color;
        //var rad = this.size;

        // Pass the color
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Draw
        /**var d = this.size/200.0;

        let angleStep = 360/this.segments;
        for (var angle = 0; angle < 360; angle += angleStep) {
            let centerPt = [xy[0], xy[1]];
            let angle1 = angle;
            let angle2 = angle + angleStep;
            let vec1 = [Math.cos(angle1*Math.PI/180)*d, Math.sin(angle1*Math.PI/180)*d];
            let vec2 = [Math.cos(angle2*Math.PI/180)*d, Math.sin(angle2*Math.PI/180)*d];
            let pt1 = [centerPt[0] + vec1[0], centerPt[1]+vec1[1]];
            let pt2 = [centerPt[0] + vec2[0], centerPt[1]+vec2[1]];

            drawTriangle( [xy[0], xy[1], pt1[0], pt1[1], pt2[0], pt2[1]] );
        } **/

        // Cube face
        drawTriangle3D( [0.0,0.0,0.0, 1.0,1.0,0.0, 1.0,0.0,0.0] )
        drawTriangle3D( [0.0,0.0,0.0, 0.0,1.0,0.0, 1.0,1.0,0.0] )

        // Darkened sides
        gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
        drawTriangle3D( [0.0,1.0,0.0, 1.0,1.0,1.0, 0.0,1.0,1.0] )
        drawTriangle3D( [0.0,1.0,0.0, 1.0,1.0,0.0, 1.0,1.0,1.0] )

        drawTriangle3D( [0.0,0.0,0.0, 0.0,1.0,1.0, 0.0,0.0,1.0] )
        drawTriangle3D( [0.0,0.0,0.0, 0.0,1.0,0.0, 0.0,1.0,1.0] )

        drawTriangle3D( [1.0,0.0,0.0, 1.0,1.0,1.0, 1.0,0.0,1.0] )
        drawTriangle3D( [1.0,0.0,0.0, 1.0,1.0,0.0, 1.0,1.0,1.0] )

        drawTriangle3D( [0.0,0.0,0.0, 1.0,0.0,1.0, 1.0,0.0,0.0] )
        drawTriangle3D( [0.0,0.0,0.0, 0.0,0.0,1.0, 1.0,0.0,1.0] )

        // Darkest back
        gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
        drawTriangle3D( [0.0,0.0,1.0, 1.0,1.0,1.0, 1.0,0.0,1.0] )
        drawTriangle3D( [0.0,0.0,1.0, 0.0,1.0,1.0, 1.0,1.0,1.0] )
    }
}