export default class Prometeus {
    constructor() {
        this.vertexShaderSource = `#version 300 es
        in vec2 position;
        in vec2 texcoord;
        in vec2 translate;
        in vec2 size;
        in vec2 texturePos;
        in vec2 textureStart;

        vec2 realTexturePosition;

        uniform vec2 u_resolution;
        uniform vec2 u_textureSize;

        out vec2 v_texCoord;

        void main() {
        vec2 zeroToOne = ((position * size) + translate) / u_resolution;

        vec2 zeroToTwo = zeroToOne * 2.0;

        vec2 clipSpace = zeroToTwo - 1.0;

        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

        // Check if texture coordinate is x1 or x2
        if(texcoord.x == 0.0) {
            realTexturePosition = vec2((1.0 / u_textureSize.x) * textureStart.x, 0);
        }else {
            realTexturePosition = vec2((texcoord.x / u_textureSize.x) * texturePos.x, 0);
        }

        // Check if texture coordinate is y1 or y2
        if(texcoord.y == 0.0) {
            realTexturePosition += vec2(0, (1.0 / u_textureSize.x) * textureStart.y);
        }else {
            realTexturePosition += vec2(0, (texcoord.y / u_textureSize.y) * texturePos.y);
        }

            v_texCoord = realTexturePosition;
        }`;

        this.fragmentShaderSource = `#version 300 es
        precision highp float;

        uniform sampler2D u_image;

        in vec2 v_texCoord;

        out vec4 outColor;

        void main() {
            outColor = texture(u_image, v_texCoord);
        }`;

        this.gl = document.querySelector("#game").getContext("webgl2");
        this.programInfo = twgl.createProgramInfo(this.gl, [this.vertexShaderSource, this.fragmentShaderSource]);

        this.gl.canvas.width = innerWidth;
        this.gl.canvas.height = innerHeight;

        this.u_resolutionLocation = this.gl.getUniformLocation(this.programInfo.program, "u_resolution");
        this.u_imageLocation = this.gl.getUniformLocation(this.programInfo.program, "u_image");
        this.u_textureSizeLocation = this.gl.getUniformLocation(this.programInfo.program, "u_textureSize");

        this.positionLocation = this.gl.getAttribLocation(this.programInfo.program, "position");
        this.texcoordLocation = this.gl.getAttribLocation(this.programInfo.program, "texcoord");
        this.translateLocation = this.gl.getAttribLocation(this.programInfo.program, "translate");
        this.sizeLocation = this.gl.getAttribLocation(this.programInfo.program, "size");
        this.texturePosLocation = this.gl.getAttribLocation(this.programInfo.program, "texturePos");
        this.textureStartLocation = this.gl.getAttribLocation(this.programInfo.program, "textureStart");

        this.numberOfInstances = 0;

        this.uniforms = {
            u_resolution: [innerWidth, innerHeight],
            u_image: null,
            u_textureSize: [512, 512]
        }

        this.positionBuffer = this.gl.createBuffer();
        this.positions = [
            0, 0, 0,
            1, 0, 0,
            0, 1, 0,
            0, 1, 0,
            1, 0, 0,
            1, 1, 0,
        ];

        this.texcoordBuffer = this.gl.createBuffer();
        this.texcoord = [
            0, 0,
            1, 0,
            0, 1,
            0, 1,
            1, 0,
            1, 1
        ];

        this.translateBuffer = this.gl.createBuffer();
        this.translate = [];

        this.sizeBuffer = this.gl.createBuffer();
        this.size = [];

        this.texturePosBuffer = this.gl.createBuffer();
        this.textureStart = [];

        this.textureStartBuffer = this.gl.createBuffer();
        this.texturePos = [];

        this.vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.vao);
    }

    loadTexture(src, callback) {
        const texture = twgl.createTexture(this.gl, { src: src, mag: this.gl.NEAREST }, () => callback());
        this.uniforms.u_image = texture;
    }

    clearScreen() {
        this.numberOfInstances = 0;
        this.translate = [];
        this.size = [];
        this.textureStart = [];
        this.texturePos = [];
    }

    addImage(x, y, width, height, srcX, srcY, srcWidth, srcHeight) {
        this.translate.push(x, y);
        this.size.push(width, height);
        this.textureStart.push(srcX, srcY);
        this.texturePos.push(srcX + srcWidth, srcY + srcHeight);
        this.numberOfInstances++;
    }

    setBuffer(params) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.positions), this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.vertexAttribPointer(this.positionLocation, 3, this.gl.FLOAT, false, 0, 0);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texcoordBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.texcoord), this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(this.texcoordLocation);
        this.gl.vertexAttribPointer(this.texcoordLocation, 2, this.gl.FLOAT, false, 0, 0);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.translateBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.translate), this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(this.translateLocation);
        this.gl.vertexAttribPointer(this.translateLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.vertexAttribDivisor(this.translateLocation, 1);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.sizeBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.size), this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(this.sizeLocation);
        this.gl.vertexAttribPointer(this.sizeLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.vertexAttribDivisor(this.sizeLocation, 1);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texturePosBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.texturePos), this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(this.texturePosLocation);
        this.gl.vertexAttribPointer(this.texturePosLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.vertexAttribDivisor(this.texturePosLocation, 1);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureStartBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.textureStart), this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(this.textureStartLocation);
        this.gl.vertexAttribPointer(this.textureStartLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.vertexAttribDivisor(this.textureStartLocation, 1);
    }

    draw() {
        this.setBuffer();
        twgl.resizeCanvasToDisplaySize(this.gl.canvas);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT);

        this.gl.useProgram(this.programInfo.program);
        this.gl.bindVertexArray(this.vao);

        twgl.setUniforms(this.programInfo, this.uniforms);
        this.gl.drawArraysInstanced(this.gl.TRIANGLES, 0, 6, this.numberOfInstances);
    }
}