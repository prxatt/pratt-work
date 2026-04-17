declare module 'ogl' {
  export class Renderer {
    constructor(options?: { dpr?: number; canvas?: HTMLCanvasElement });
    gl: WebGLRenderingContext & {
      canvas: HTMLCanvasElement;
      getExtension(name: string): any;
    };
    setSize(width: number, height: number): void;
    render(options: { scene: Mesh }): void;
  }

  export class Program {
    constructor(
      gl: WebGLRenderingContext,
      options: {
        vertex: string;
        fragment: string;
        uniforms?: Record<string, { value: any }>;
      }
    );
    uniforms: Record<string, { value: any }>;
  }

  export class Mesh {
    constructor(
      gl: WebGLRenderingContext,
      options: {
        geometry: Triangle;
        program: Program;
      }
    );
  }

  export class Triangle {
    constructor(gl: WebGLRenderingContext);
  }

  export class Color {
    constructor(r: number, g: number, b: number);
    r: number;
    g: number;
    b: number;
  }
}
