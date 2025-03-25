"use client";

import { liquidFragSource } from "./liquid-metal-shader";
import { useEffect, useRef, useState, FC } from "react";
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
  const totalAnimationTime = useRef(0);
  const lastRenderTime = useRef(0);
  const textureRef = useRef<WebGLTexture | null>(null);
  const animationFrameRef = useRef<number>(0);

  // Initialize WebGL
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", { antialias: true, alpha: true });
    if (!gl) {
      toast.error("Failed to initialize WebGL2");
      return;
    }

    // Create and compile shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) {
      toast.error("Failed to create shaders");
      return;
    }

    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.shaderSource(fragmentShader, liquidFragSource);
    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    // Create and link program
    const program = gl.createProgram();
    if (!program) {
      toast.error("Failed to create program");
      return;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Get uniforms
    const uniforms: Record<string, WebGLUniformLocation> = {};
    const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < uniformCount; i++) {
      const uniformName = gl.getActiveUniform(program, i)?.name;
      if (!uniformName) continue;
      const location = gl.getUniformLocation(program, uniformName);
      if (location) uniforms[uniformName] = location;
    }

    // Set up vertices
    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Store context
    contextRef.current = { gl, uniforms, program };

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      if (textureRef.current) gl.deleteTexture(textureRef.current);
      if (vertexBuffer) gl.deleteBuffer(vertexBuffer);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteProgram(program);
      contextRef.current = null;
    };
  }, []);

  // Update uniforms and handle texture
  useEffect(() => {
    const context = contextRef.current;
    const canvas = canvasRef.current;
    if (!context || !canvas) return;

    const { gl, uniforms } = context;

    // Update shader parameters
    gl.uniform1f(uniforms.u_edge, params.edge);
    gl.uniform1f(uniforms.u_patternBlur, params.patternBlur);
    gl.uniform1f(uniforms.u_patternScale, params.patternScale);
    gl.uniform1f(uniforms.u_refraction, params.refraction);
    gl.uniform1f(uniforms.u_liquid, params.liquid);

    // Set up canvas size
    const size = 1000;
    canvas.width = size * devicePixelRatio;
    canvas.height = size * devicePixelRatio;
    gl.viewport(0, 0, canvas.width, canvas.width);
    gl.uniform1f(uniforms.u_ratio, 1);
    gl.uniform1f(uniforms.u_img_ratio, 1);

    // Clean up old texture
    if (textureRef.current) {
      gl.deleteTexture(textureRef.current);
    }

    // Set up new texture
    const texture = gl.createTexture();
    if (!texture) return;

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

    return () => {
      if (textureRef.current) {
        gl.deleteTexture(textureRef.current);
        textureRef.current = null;
      }
    };
  }, [imageData, params]);

  // Animation loop
  useEffect(() => {
    const context = contextRef.current;
    if (!context) return;

    const { gl, uniforms } = context;
    let isAnimating = true;

    function render(currentTime: number) {
      if (!isAnimating) return;

      const deltaTime = currentTime - lastRenderTime.current;
      lastRenderTime.current = currentTime;
      totalAnimationTime.current += deltaTime * params.speed;

      gl.uniform1f(uniforms.u_time, totalAnimationTime.current);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationFrameRef.current = requestAnimationFrame(render);
    }

    lastRenderTime.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      isAnimating = false;
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [params.speed]);

  return (
    <canvas ref={canvasRef} className="block h-full w-full object-contain" />
  );
};
