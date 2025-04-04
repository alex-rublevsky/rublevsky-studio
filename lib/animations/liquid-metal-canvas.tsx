"use client";

import { liquidFragSource } from "./liquid-metal-shader";
import { useEffect, useRef, FC } from "react";
import { toast } from "sonner";

// uniform sampler2D u_image_texture;
// uniform float u_time;
// uniform float u_ratio;
// uniform float u_img_ratio;
// uniform float u_patternScale;
// uniform float u_refraction;
// uniform float u_edge;
// uniform float u_patternBlur;
// uniform float u_liquid;

const vertexShaderSource = `#version 300 es
precision mediump float;

in vec2 a_position;
out vec2 vUv;

void main() {
    vUv = .5 * (a_position + 1.);
    gl_Position = vec4(a_position, 0.0, 1.0);
}` as const;

export type ShaderParams = {
  patternScale: number;
  refraction: number;
  edge: number;
  patternBlur: number;
  liquid: number;
  speed: number;
};

type RenderContext = {
  gl: WebGL2RenderingContext;
  uniforms: Record<string, WebGLUniformLocation>;
  program: WebGLProgram;
};

export const Canvas: FC<{
  imageData: ImageData;
  params: ShaderParams;
}> = ({ imageData, params }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<RenderContext | null>(null);
  const textureRef = useRef<WebGLTexture | null>(null);
  const timeRef = useRef(0);
  const frameRef = useRef(0);

  // Start animation
  useEffect(() => {
    timeRef.current = performance.now();
    frameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frameRef.current);
  }, [params.speed]);

  // Animation loop
  const render = (now: number) => {
    const context = contextRef.current;
    if (!context) return;
    const { gl, uniforms } = context;

    if (!gl.isContextLost()) {
      const delta = now - timeRef.current;
      timeRef.current = now;

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uniforms.u_time, timeRef.current * params.speed);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      frameRef.current = requestAnimationFrame(render);
    }
  };

  // Initialize WebGL context and resources
  const initializeWebGL = (canvas: HTMLCanvasElement, imageData: ImageData) => {
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: true });
    if (!gl) {
      toast.error("Failed to initialize WebGL2");
      return null;
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Create shaders and program
    const program = gl.createProgram();
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!program || !vertexShader || !fragmentShader) return null;

    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.shaderSource(fragmentShader, liquidFragSource);
    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Get uniforms
    const uniforms: Record<string, WebGLUniformLocation> = {};
    const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < uniformCount; i++) {
      const info = gl.getActiveUniform(program, i);
      if (info)
        uniforms[info.name] = gl.getUniformLocation(program, info.name)!;
    }

    // Set up vertices
    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    // Set up texture
    const texture = gl.createTexture();
    if (!texture) return null;

    textureRef.current = texture;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      imageData.width,
      imageData.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      imageData.data
    );
    gl.uniform1i(uniforms.u_image_texture, 0);

    return { gl, uniforms, program };
  };

  // Initialize WebGL and handle context loss
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(frameRef.current);
    };

    const handleContextRestored = () => {
      const context = initializeWebGL(canvas, imageData);
      if (context) {
        contextRef.current = context;
        timeRef.current = performance.now();
        requestAnimationFrame(render);
      }
    };

    canvas.addEventListener("webglcontextlost", handleContextLost);
    canvas.addEventListener("webglcontextrestored", handleContextRestored);

    const context = initializeWebGL(canvas, imageData);
    if (context) {
      contextRef.current = context;
    }

    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored);
      if (contextRef.current?.gl) {
        const { gl } = contextRef.current;
        cancelAnimationFrame(frameRef.current);
        if (textureRef.current) gl.deleteTexture(textureRef.current);
      }
    };
  }, [imageData]);

  // Update uniforms and canvas size
  useEffect(() => {
    const context = contextRef.current;
    const canvas = canvasRef.current;
    if (!context || !canvas) return;

    const { gl, uniforms } = context;
    const scale = devicePixelRatio;

    canvas.width = imageData.width * scale;
    canvas.height = imageData.height * scale;
    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.uniform1f(uniforms.u_ratio, canvas.width / canvas.height);
    gl.uniform1f(uniforms.u_img_ratio, imageData.width / imageData.height);
    Object.entries(params).forEach(([key, value]) => {
      gl.uniform1f(uniforms[`u_${key}`], value);
    });
  }, [imageData, params]);

  return (
    <canvas
      ref={canvasRef}
      className="block h-full w-full object-contain"
      style={{
        aspectRatio: `${imageData.width} / ${imageData.height}`,
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        perspective: "1000px",
        WebkitFontSmoothing: "antialiased",
      }}
    />
  );
};
