import express from "express";
import path from "path";
import { spawn } from "child_process";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const PYTHON_PORT = 5001;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Launch Python Backend Process
let pythonProcess: any = null;

function startPythonBackend() {
  try {
    console.log(`[Python Backend] Launching python3 backend/app.py on port ${PYTHON_PORT}...`);
    pythonProcess = spawn("python3", ["backend/app.py", String(PYTHON_PORT)], {
      cwd: process.cwd(),
      stdio: "inherit",
    });

    pythonProcess.on("error", (err: any) => {
      console.error("[Python Backend] Failed to start process:", err);
    });

    pythonProcess.on("exit", (code: number) => {
      console.log(`[Python Backend] Exited with code ${code}`);
    });
  } catch (err) {
    console.error("[Python Backend] Error launching Python process:", err);
  }
}

startPythonBackend();

// Express API Proxy / Gateway to Python HRIS Backend
app.all("/api/*", async (req, res) => {
  const targetUrl = `http://127.0.0.1:${PYTHON_PORT}${req.originalUrl}`;
  try {
    const fetchOptions: RequestInit = {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (["POST", "PUT", "PATCH"].includes(req.method) && Object.keys(req.body || {}).length > 0) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error(`[API Proxy Error] Failed to connect to Python backend at ${targetUrl}:`, error);
    res.status(502).json({
      status: "error",
      message: "Gagal terhubung ke Python Backend Service & Database HRIS.",
    });
  }
});

async function startServer() {
  // Vite Middleware in Development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Full-Stack Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

process.on("SIGINT", () => {
  if (pythonProcess) pythonProcess.kill();
  process.exit();
});
