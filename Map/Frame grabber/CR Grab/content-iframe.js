console.log("🔍 Content script loaded for frame capture.");

const marker = document.createElement("div");
marker.textContent = "Iframe script active";
marker.style.position = "fixed";
marker.style.top = "0";
marker.style.left = "0";
marker.style.background = "red";
marker.style.zIndex = 9999;
document.body.appendChild(marker);

async function getVideoFrameAsBlob(videoElement) {
  const width = videoElement.videoWidth;
  const height = videoElement.videoHeight;

  // Try 2D canvas first
  const canvas2D = document.createElement("canvas");
  canvas2D.width = width;
  canvas2D.height = height;
  const ctx = canvas2D.getContext("2d");
  ctx.drawImage(videoElement, 0, 0);

  // Check if 2D capture is all black (DRM or GPU offscreen)
  const pixel = ctx.getImageData(0, 0, 1, 1).data;
  //   const isBlack =
  //     pixel[0] === 0 && pixel[1] === 0 && pixel[2] === 0 && pixel[3] === 255;
  const isBlack = true;

  if (!isBlack) {
    return new Promise((resolve) => canvas2D.toBlob(resolve, "image/png"));
  }

  // Fallback to WebGL2
  const canvasGL = document.createElement("canvas");
  canvasGL.width = width;
  canvasGL.height = height;
  const gl = canvasGL.getContext("webgl2", { preserveDrawingBuffer: true });
  if (!gl) throw new Error("WebGL2 not available");

  marker.textContent = "WebGL2 context created";

  const vsSource = `
    attribute vec2 a_position;
    varying vec2 v_texCoord;
    void main() {
      v_texCoord = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0, 1);
    }
  `;
  const fsSource = `
    precision mediump float;
    varying vec2 v_texCoord;
    uniform sampler2D u_texture;
    void main() {
      gl_FragColor = texture2D(u_texture, v_texCoord);
    }
  `;

  const compileShader = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error("Shader compile failed: " + gl.getShaderInfoLog(shader));
    }
    return shader;
  };

  const program = gl.createProgram();
  gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vsSource));
  gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fsSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error("Program link failed: " + gl.getProgramInfoLog(program));
  }
  gl.useProgram(program);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW
  );

  const posLoc = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  try {
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      videoElement
    );
  } catch (e) {
    throw new Error("WebGL texImage2D failed: " + e.message);
  }

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  return new Promise((resolve) => canvasGL.toBlob(resolve, "image/png"));
}

async function copyFrameToClipboard(video) {
  const blob = await getVideoFrameAsBlob(video);

  const arrayBuffer = await blob.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  window.parent.postMessage(
    {
      type: "VIDEO_FRAME_DATA",
      data: Array.from(uint8Array),
    },
    "*"
  );
}

window.addEventListener("message", async (event) => {
  console.log("🔍 Received message:", event.data);
  if (event.data?.type === "CAPTURE_FRAME") {
    const video = document.querySelector("video");
    if (video && video.readyState >= 2) {
      try {
        await copyFrameToClipboard(video);
      } catch (err) {
        console.error("Clipboard copy failed:", err);
      }
    }
  }
});
