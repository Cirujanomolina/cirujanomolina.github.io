import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const DIRECTORY = path.join(process.cwd(), "public", "content-os");
const CONFIG_FILE = path.join(DIRECTORY, "config.json");

function loadConfig() {
    if (fs.existsSync(CONFIG_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        } catch (e) {
            console.error("Error loading config:", e);
        }
    }
    return {};
}

function saveConfig(config) {
    try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 4), 'utf8');
    } catch (e) {
        console.error("Error saving config:", e);
    }
}

function validateAssetsPath(filePath) {
    const allowedBase = "C:\\Users\\Juan\\Segundo Cerebro\\Hobbies y proyectos";
    const targetPath = path.resolve(filePath);
    return targetPath.toLowerCase().startsWith(allowedBase.toLowerCase() + path.sep) || targetPath.toLowerCase() === allowedBase.toLowerCase();
}

function getAssetsDir() {
    const config = loadConfig();
    const assetsDir = config.assets_dir;
    const defaultDir = path.join(DIRECTORY, "assets");
    if (assetsDir) {
        if (validateAssetsPath(assetsDir) && fs.existsSync(assetsDir)) {
            return path.resolve(assetsDir);
        } else {
            console.warn(`Warning: Configured assets path ${assetsDir} is outside the allowed sandbox or does not exist. Using default.`);
        }
    }
    return path.resolve(defaultDir);
}

function getAssetsSubdirs() {
    const assetsDir = getAssetsDir();
    let imgDir, logoDir, metaFile;
    if (path.basename(assetsDir).toLowerCase() === "images_database") {
        imgDir = assetsDir;
        const base = path.dirname(assetsDir);
        logoDir = path.join(base, "logos");
        metaFile = path.join(base, "metadata.json");
    } else if (path.basename(assetsDir).toLowerCase() === "logos") {
        logoDir = assetsDir;
        const base = path.dirname(assetsDir);
        imgDir = path.join(base, "images_database");
        metaFile = path.join(base, "metadata.json");
    } else {
        imgDir = path.join(assetsDir, "images_database");
        logoDir = path.join(assetsDir, "logos");
        metaFile = path.join(assetsDir, "metadata.json");
    }
    return { imgDir, logoDir, metaFile };
}

function loadMetadata() {
    const { metaFile } = getAssetsSubdirs();
    if (fs.existsSync(metaFile)) {
        try {
            return JSON.parse(fs.readFileSync(metaFile, 'utf8'));
        } catch (e) {
            console.error("Error loading metadata:", e);
        }
    }
    return {};
}

function saveMetadata(metadata) {
    const { metaFile } = getAssetsSubdirs();
    try {
        fs.mkdirSync(path.dirname(metaFile), { recursive: true });
        fs.writeFileSync(metaFile, JSON.stringify(metadata, null, 4), 'utf8');
    } catch (e) {
        console.error("Error saving metadata:", e);
    }
}

async function analyzeImageWithGemini(imgPath, apiKey) {
    const ext = path.extname(imgPath).toLowerCase();
    let mimeType = "image/jpeg";
    if (ext === ".png") mimeType = "image/png";
    else if (ext === ".webp") mimeType = "image/webp";

    const fileName = path.basename(imgPath);
    console.log(`[Gemini API] Solicitando análisis para imagen: ${fileName}`);
    try {
        const imgData = fs.readFileSync(imgPath);
        const base64Data = imgData.toString("base64");

        const prompt = `
        Analiza esta imagen y clasifícala estrictamente para su uso en diseño gráfico y carruseles de Instagram del Dr. Molina (Cirujano Bariátrico).
        Devuelve un objeto JSON con las siguientes propiedades exactas:
        {
          "photo_type": "Tipo de foto. Opciones obligatorias: Quirófano/Cirugía, Consulta médica, Retrato clínico, Retrato casual, Foto de equipo/Clínica, Detalle/Instrumentos, Abstracto/Textura, Otro.",
          "subject": "Sujeto principal de la imagen. Elige obligatoriamente una de estas opciones: 'Dr. Molina solo', 'Dr. Molina operando con ayudante', 'Dr. Molina con su equipo', 'Dr. Molina con paciente', 'Paciente solo', 'Equipo de trabajo', 'Manos/Instrumentos', 'Objetos', 'Ninguno/Abstracto'.",
          "subject_position": "Posición del sujeto principal o de los sujetos en la imagen. Opciones obligatorias: 'center', 'left-half', 'right-half', 'top-half', 'bottom-half', 'none'.",
          "detailed_description": "Una descripción muy detallada, clínica y descriptiva de lo que sucede en la imagen (máximo 15 palabras). Identifica con precisión si hay asistentes quirúrgicos, instrumental de laparoscopia, miembros de equipo o pacientes. Ej: 'Dr. Molina realizando laparoscopia en quirófano con ayudante médico' o 'Dr. Molina sonriendo con 4 asistentes médicas en el consultorio'.",
          "mood": "Iluminación e intensidad emocional. Opciones obligatorias: Cálido/Humano, Clínico/Blanco, Oscuro/Cinemático, Neutro/Brillante.",
          "safe_space": "Analiza con máxima precisión la composición y áreas vacías de la imagen. Determina qué zona está libre de elementos importantes (caras, manos, instrumental clínico) y tiene un fondo simple, plano, oscuro o desenfocado óptimo para superponer texto legible de carruseles. Elige obligatoriamente una opción de esta lista: 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'center', 'left-half', 'right-half', 'none'. Sé sumamente estricto: si hay un ayudante o equipo en un lado, ese lado NO es un espacio seguro.",
          "suggested_filename": "Un nombre de archivo sugerido, corto y descriptivo en minúsculas y separado por guiones bajos, con la misma extensión del archivo original (por ejemplo: dr_molina_laparoscopia.jpg)."
        }
        No agregues explicaciones adicionales, devuelve únicamente el JSON válido.
        `;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const payload = {
            contents: [{
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Data
                        }
                    }
                ]
            }],
            generationConfig: {
                response_mime_type: "application/json"
            }
        };

        let maxRetries = 5;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                
                if (response.status === 429 || response.status === 503) {
                    if (attempt < maxRetries - 1) {
                        const sleepTime = (attempt + 1) * 4000;
                        console.warn(`[Gemini API] Límite de cuota alcanzado (${response.status}) para ${fileName}. Reintentando en ${sleepTime/1000}s...`);
                        await new Promise(resolve => setTimeout(resolve, sleepTime));
                        continue;
                    }
                }

                if (!response.ok) {
                    const errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
                    console.error(`[Gemini API] Error al analizar ${fileName}: ${errorMsg}`);
                    if (response.status === 400 || response.status === 401 || response.status === 403 || response.status === 404) {
                        return { error: errorMsg, isFatal: true }; // No reintentar en errores permanentes e indicar que es fatal
                    }
                    throw new Error(errorMsg);
                }

                const resJson = await response.json();
                const textResponse = resJson.candidates[0].content.parts[0].text;
                console.log(`[Gemini API] Análisis completado con éxito para ${fileName}`);
                return JSON.parse(textResponse.trim());
            } catch (err) {
                if (attempt < maxRetries - 1) {
                    const sleepTime = (attempt + 1) * 2000;
                    console.warn(`[Gemini API] Error en llamada: ${err.message}. Reintentando en ${sleepTime/1000}s...`);
                    await new Promise(resolve => setTimeout(resolve, sleepTime));
                    continue;
                }
                throw err;
            }
        }
    } catch (e) {
        console.error(`[Gemini API] Error crítico para ${fileName}:`, e.message);
        return { error: e.message };
    }
}

export function viteApiMiddleware(req, res, next) {
    const cleanPath = req.url.split("?")[0];

    // Interceptar /api/proxy-image antes de cualquier otra cosa (es una petición GET)
    if (cleanPath === "/api/proxy-image") {
        const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
        const imageUrl = parsedUrl.searchParams.get("url");
        if (!imageUrl) {
            res.writeHead(400, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ error: "Falta el parámetro url" }));
        }

        (async () => {
            try {
                const imgRes = await fetch(imageUrl, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
                        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
                        "Accept-Language": "es-CO,es;q=0.9,en;q=0.8"
                    }
                });
                if (!imgRes.ok) {
                    res.writeHead(imgRes.status, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ error: `Instagram CDN devolvió HTTP ${imgRes.status}` }));
                }

                const contentType = imgRes.headers.get("content-type") || "image/jpeg";
                const arrayBuffer = await imgRes.arrayBuffer();
                res.writeHead(200, { 
                    "Content-Type": contentType,
                    "Cache-Control": "public, max-age=3600",
                    "Access-Control-Allow-Origin": "*"
                });
                return res.end(Buffer.from(arrayBuffer));
            } catch (e) {
                res.writeHead(500, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ error: e.message }));
            }
        })().catch(err => {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: err.message }));
        });
        return;
    }

    // Interceptar la carga de archivos estáticos de assets desde la ruta configurada
    let isAssetsReq = false;
    let relativePath = "";
    if (cleanPath.startsWith("/content-os/assets/")) {
        isAssetsReq = true;
        relativePath = cleanPath.slice("/content-os/assets/".length);
    } else if (cleanPath.startsWith("/assets/")) {
        isAssetsReq = true;
        relativePath = cleanPath.slice("/assets/".length);
    }

    if (isAssetsReq) {
        const assetsDir = getAssetsDir();
        const baseName = path.basename(assetsDir).toLowerCase();
        const assetsBaseDir = (baseName === "images_database" || baseName === "logos") ? path.dirname(assetsDir) : assetsDir;
        const fullFilePath = path.join(assetsBaseDir, relativePath);
        
        console.log(`[Vite API Server] Request: ${req.url} -> Resolving to: ${fullFilePath}`);
        const exists = fs.existsSync(fullFilePath);
        const isValid = validateAssetsPath(fullFilePath);
        console.log(`[Vite API Server] Check - Exists: ${exists}, Valid: ${isValid}`);
        
        if (isValid && exists && fs.statSync(fullFilePath).isFile()) {
            const ext = path.extname(fullFilePath).toLowerCase();
            let mimeType = "application/octet-stream";
            if (ext === ".jpg" || ext === ".jpeg") mimeType = "image/jpeg";
            else if (ext === ".png") mimeType = "image/png";
            else if (ext === ".webp") mimeType = "image/webp";
            else if (ext === ".gif") mimeType = "image/gif";
            else if (ext === ".svg") mimeType = "image/svg+xml";
            else if (ext === ".mp4") mimeType = "video/mp4";
            else if (ext === ".json") mimeType = "application/json";
            
            res.statusCode = 200;
            res.setHeader("Content-Type", mimeType);
            res.setHeader("Access-Control-Allow-Origin", "*");
            const stream = fs.createReadStream(fullFilePath);
            stream.pipe(res);
            return;
        }
    }

    if (!req.url.startsWith("/api")) {
        return next();
    }
    console.log(`[Vite API Server] ${req.method} ${req.url}`);

    const sendJson = (data, status = 200) => {
        res.statusCode = status;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.end(JSON.stringify(data));
    };

    const readBody = () => {
        return new Promise((resolve, reject) => {
            let resolved = false;
            const timer = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    console.warn("[Vite API Server] readBody: Timeout waiting for request body stream.");
                    resolve({});
                }
            }, 1000);

            if (req.body !== undefined) {
                clearTimeout(timer);
                resolved = true;
                return resolve(req.body);
            }
            if (!req.readable) {
                clearTimeout(timer);
                resolved = true;
                console.warn("[Vite API Server] Warning: Request is not readable. Stream might have been consumed.");
                return resolve({});
            }
            let body = "";
            req.on("data", chunk => {
                if (resolved) return;
                body += chunk;
            });
            req.on("end", () => {
                if (resolved) return;
                clearTimeout(timer);
                resolved = true;
                try {
                    resolve(body ? JSON.parse(body) : {});
                } catch (e) {
                    reject(new Error("Petición JSON inválida"));
                }
            });
            req.on("error", (err) => {
                if (resolved) return;
                clearTimeout(timer);
                resolved = true;
                console.error("[Vite API Server] Error reading body:", err);
                reject(err);
            });
        });
    };

    if (req.method === "GET") {
        if (cleanPath === "/api/assets") {
            const { imgDir, logoDir } = getAssetsSubdirs();
            const images = [];
            if (fs.existsSync(imgDir)) {
                fs.readdirSync(imgDir).forEach(f => {
                    if (f.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/)) {
                        images.push(f);
                    }
                });
            }

            const metadata = loadMetadata();
            const enrichedImages = images.map(img => {
                const imgMeta = metadata[img] || {};
                return {
                    name: img,
                    path: `../assets/images_database/${img}`,
                    photo_type: imgMeta.photo_type || "Desconocido",
                    subject: imgMeta.subject || "Desconocido",
                    subject_position: imgMeta.subject_position || "Desconocido",
                    detailed_description: imgMeta.detailed_description || "",
                    mood: imgMeta.mood || "Desconocido",
                    safe_space: imgMeta.safe_space || "Desconocido",
                    suggested_filename: imgMeta.suggested_filename || ""
                };
            });

            const logos = [];
            if (fs.existsSync(logoDir)) {
                fs.readdirSync(logoDir).forEach(f => {
                    if (f.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/)) {
                        logos.push(f);
                    }
                });
            }

            return sendJson({
                images: enrichedImages,
                logos: logos,
                assets_directory: getAssetsDir()
            });
        }

        if (cleanPath === "/api/logos") {
            const { logoDir } = getAssetsSubdirs();
            const logos = [];
            if (fs.existsSync(logoDir)) {
                fs.readdirSync(logoDir).forEach(f => {
                    if (f.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/)) {
                        logos.push(f);
                    }
                });
            }
            return sendJson({ logos });
        }

        if (cleanPath === "/api/config") {
            return sendJson({
                assets_dir: getAssetsDir(),
                default_dir: path.resolve(path.join(DIRECTORY, "assets")),
                project_dir: DIRECTORY
            });
        }
    }

    if (req.method === "POST") {
        if (cleanPath === "/api/rescan") {
            // Prevenir timeout del servidor de desarrollo de Vite / Node.js
            if (req.socket && req.socket.setTimeout) {
                req.socket.setTimeout(0);
            }
            if (res.setTimeout) res.setTimeout(0);

            const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
            const queryApiKey = urlObj.searchParams.get("api_key");
            const headerApiKey = req.headers["x-api-key"];

            readBody().then(async (body) => {
                const apiKey = headerApiKey || queryApiKey || body.api_key;
                if (!apiKey) {
                    return sendJson({ error: "Falta la clave API de Gemini" }, 400);
                }

                const { imgDir } = getAssetsSubdirs();
                if (!fs.existsSync(imgDir)) {
                    return sendJson({ error: "La carpeta de imágenes no existe" }, 400);
                }

                const images = fs.readdirSync(imgDir).filter(f => f.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/));
                console.log(`[API Rescan] Iniciando escaneo. Encontradas ${images.length} imágenes en disco.`);
                const metadata = loadMetadata();
                let newAnalyses = 0;
                const errors = [];
                let metadataChanged = false;

                // 1. Analizar imágenes
                for (const img of images) {
                    const hasAllMeta = metadata[img] && 
                                       metadata[img].safe_space && 
                                       metadata[img].detailed_description && 
                                       metadata[img].subject_position;
                    if (hasAllMeta) {
                        console.log(`[API Rescan] Imagen ${img} ya tiene metadatos completos. Omitiendo.`);
                        continue;
                    }

                    const imgPath = path.join(imgDir, img);
                    try {
                        const analysis = await analyzeImageWithGemini(imgPath, apiKey);
                        if (analysis.error) {
                            errors.push(`Error en ${img}: ${analysis.error}`);
                            console.error(`[API Rescan] Error analizando ${img}: ${analysis.error}`);
                            if (analysis.isFatal) {
                                return sendJson({ error: `Error Fatal de API Gemini: ${analysis.error}. Escaneo cancelado.` }, 400);
                            }
                        } else {
                            metadata[img] = analysis;
                            newAnalyses++;
                            metadataChanged = true;
                        }
                        // Espera de 4s para cuota gratis
                        await new Promise(resolve => setTimeout(resolve, 4000));
                    } catch (err) {
                        errors.push(`Fallo al analizar ${img}: ${err.message}`);
                        console.error(`[API Rescan] Fallo en ${img}: ${err.message}`);
                    }
                }

                // 2. Renombrado automático
                const diskFiles = fs.readdirSync(imgDir).filter(f => f.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/));
                for (const img of diskFiles) {
                    const imgMeta = metadata[img];
                    if (!imgMeta || imgMeta.error) continue;

                    let suggestedName = imgMeta.suggested_filename;
                    if (!suggestedName) continue;

                    suggestedName = path.basename(suggestedName);
                    const originalExt = path.extname(img);
                    const suggestedExt = path.extname(suggestedName);
                    const ext = suggestedExt ? suggestedExt : originalExt;
                    const suggestedBase = path.basename(suggestedName, suggestedExt);

                    // Limpiar nombre propuesto
                    let cleanBase = suggestedBase.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
                    cleanBase = cleanBase.replace(/__+/g, "_").replace(/^_+|_+$/g, "");

                    // Si ya tiene el nombre correcto, saltar
                    const pattern = new RegExp("^" + cleanBase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "(_\\d+)??" + ext.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$", "i");
                    if (img.match(pattern)) continue;

                    let finalName = `${cleanBase}${ext}`;
                    let counter = 1;
                    while (fs.existsSync(path.join(imgDir, finalName))) {
                        finalName = `${cleanBase}_${counter}${ext}`;
                        counter++;
                    }

                    const oldPath = path.join(imgDir, img);
                    const newPath = path.join(imgDir, finalName);
                    try {
                        fs.renameSync(oldPath, newPath);
                        console.log(`Renombrado automático en disco: ${img} -> ${finalName}`);
                        metadata[finalName] = imgMeta;
                        if (metadata[img]) {
                            delete metadata[img];
                        }
                        metadataChanged = true;
                    } catch (renameError) {
                        errors.push(`Error al renombrar ${img}: ${renameError.message}`);
                    }
                }

                if (metadataChanged) {
                    saveMetadata(metadata);
                }

                // Cargar lista final
                const finalImages = fs.readdirSync(imgDir).filter(f => f.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/));
                const enrichedImages = finalImages.map(img => {
                    const imgMeta = metadata[img] || {};
                    return {
                        name: img,
                        path: `../assets/images_database/${img}`,
                        photo_type: imgMeta.photo_type || "Desconocido",
                        subject: imgMeta.subject || "Desconocido",
                        subject_position: imgMeta.subject_position || "Desconocido",
                        detailed_description: imgMeta.detailed_description || "",
                        mood: imgMeta.mood || "Desconocido",
                        safe_space: imgMeta.safe_space || "Desconocido",
                        suggested_filename: imgMeta.suggested_filename || ""
                    };
                });

                return sendJson({
                    success: true,
                    new_analyses: newAnalyses,
                    errors: errors,
                    images: enrichedImages
                });
            }).catch(err => {
                return sendJson({ error: err.message }, 400);
            });
            return;
        }

        if (cleanPath === "/api/rename") {
            readBody().then((body) => {
                const oldName = body.old_name;
                let newName = body.new_name;

                if (!oldName || !newName) {
                    return sendJson({ error: "Nombres inválidos" }, 400);
                }

                newName = path.basename(newName);
                const ext = path.extname(oldName);
                if (!newName.toLowerCase().endsWith(ext.toLowerCase())) {
                    newName += ext;
                }

                const { imgDir } = getAssetsSubdirs();
                const oldPath = path.join(imgDir, oldName);
                const newPath = path.join(imgDir, newName);

                if (!fs.existsSync(oldPath)) {
                    return sendJson({ error: "La imagen original no existe" }, 400);
                }

                if (fs.existsSync(newPath) && oldName !== newName) {
                    return sendJson({ error: "Ya existe una imagen con el nuevo nombre" }, 400);
                }

                try {
                    fs.renameSync(oldPath, newPath);
                    const metadata = loadMetadata();
                    if (metadata[oldName]) {
                        metadata[newName] = metadata[oldName];
                        delete metadata[oldName];
                        saveMetadata(metadata);
                    }

                    return sendJson({
                        success: true,
                        old_name: oldName,
                        new_name: newName
                    });
                } catch (e) {
                    return sendJson({ error: `Error al renombrar: ${e.message}` }, 500);
                }
            }).catch(err => {
                return sendJson({ error: err.message }, 400);
            });
            return;
        }

        if (cleanPath === "/api/save-config") {
            readBody().then((body) => {
                const assetsDir = body.assets_dir;
                if (!assetsDir) {
                    return sendJson({ error: "Falta la ruta de la carpeta assets" }, 400);
                }

                if (!fs.existsSync(assetsDir)) {
                    return sendJson({ error: "La carpeta especificada no existe en el disco duro" }, 400);
                }

                if (!validateAssetsPath(assetsDir)) {
                    return sendJson({
                        error: "Acceso Denegado: Por seguridad, solo se permite seleccionar la carpeta 'assets' o sus subdirectorios dentro del proyecto."
                    }, 403);
                }

                const config = loadConfig();
                config.assets_dir = path.resolve(assetsDir);
                saveConfig(config);

                return sendJson({
                    success: true,
                    assets_dir: path.resolve(assetsDir)
                });
            }).catch(err => {
                return sendJson({ error: err.message }, 400);
            });
            return;
        }

        if (cleanPath === "/api/list-folders") {
            readBody().then((body) => {
                const baseDir = "C:\\Users\\Juan\\Segundo Cerebro\\Hobbies y proyectos";
                const subDir = body.dir || "";
                let targetDir = subDir ? path.resolve(subDir) : baseDir;

                if (!(targetDir.toLowerCase() === baseDir.toLowerCase() || targetDir.toLowerCase().startsWith(baseDir.toLowerCase() + path.sep))) {
                    targetDir = baseDir;
                }

                const folders = [];
                try {
                    fs.readdirSync(targetDir).forEach(item => {
                        const itemPath = path.join(targetDir, item);
                        if (fs.statSync(itemPath).isDirectory() && !item.startsWith(".")) {
                            folders.push({
                                name: item,
                                path: itemPath,
                                is_assets_compatible: validateAssetsPath(itemPath)
                            });
                        }
                    });
                } catch (e) {
                    return sendJson({ error: e.message }, 500);
                }

                return sendJson({
                    current_dir: targetDir,
                    project_dir: baseDir,
                    parent_dir: targetDir.toLowerCase() !== baseDir.toLowerCase() ? path.dirname(targetDir) : null,
                    folders: folders.sort((a, b) => a.name.localeCompare(b.name))
                });
            }).catch(err => {
                return sendJson({ error: err.message }, 400);
            });
            return;
        }

        if (cleanPath === "/api/upload-avatar") {
            readBody().then((body) => {
                const filename = body.filename;
                const base64Data = body.base64_data;

                if (!filename || !base64Data) {
                    return sendJson({ error: "Falta el nombre del archivo o los datos base64" }, 400);
                }

                const safeFilename = path.basename(filename);
                const ext = path.extname(safeFilename).toLowerCase();
                if (![".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext)) {
                    return sendJson({ error: "Formato de imagen no permitido" }, 400);
                }

                const avatarsDir = path.join(DIRECTORY, "assets", "avatars");
                fs.mkdirSync(avatarsDir, { recursive: true });
                const filePath = path.join(avatarsDir, safeFilename);

                try {
                    const fileBytes = Buffer.from(base64Data, "base64");
                    fs.writeFileSync(filePath, fileBytes);
                    
                    const relativeUrl = `/assets/avatars/${safeFilename}`;
                    return sendJson({
                        success: true,
                        url: relativeUrl
                     });
                } catch (e) {
                    return sendJson({ error: `Fallo al guardar imagen: ${e.message}` }, 500);
                }
            }).catch(err => {
                return sendJson({ error: err.message }, 400);
            });
            return;
        }


        if (cleanPath === "/api/proxy-claude") {
            readBody().then(async (body) => {
                const apiKey = body.apiKey;
                const promptText = body.promptText;
                if (!apiKey || !promptText) {
                    return sendJson({ error: "Faltan parámetros apiKey o promptText" }, 400);
                }
                try {
                    const response = await fetch('https://api.anthropic.com/v1/messages', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-api-key': apiKey,
                            'anthropic-version': '2023-06-01'
                        },
                        body: JSON.stringify({
                            model: 'claude-3-5-sonnet-20241022',
                            max_tokens: 8192,
                            messages: [{ role: 'user', content: promptText + '\n\nResponde ÚNICAMENTE con el JSON solicitado, sin ningún texto adicional, sin backticks, sin markdown.' }]
                        })
                    });
                    const resJson = await response.json();
                    if (!response.ok) {
                        return sendJson(resJson, response.status);
                    }
                    return sendJson(resJson);
                } catch (e) {
                    return sendJson({ error: e.message }, 500);
                }
            }).catch(err => {
                return sendJson({ error: err.message }, 400);
            });
            return;
        }

        if (cleanPath === "/api/scrape-instagram") {
            if (req.socket && req.socket.setTimeout) req.socket.setTimeout(0);
            if (res.setTimeout) res.setTimeout(0);

            readBody().then(async (body) => {
                const action = body.action || "test";
                const apiKey = body.hikerapiKey || "";
                const sessionVal = body.session || "";
                let id = body.id || "";
                const count = body.count || 12;

                // --- 100% GRATIS & SIN COOKIES: GraphQL Fetch para URLs de Reels/Posts ---
                if (action === "comments" && (id.includes("instagram.com/reel/") || id.includes("instagram.com/p/") || !id.startsWith("@"))) {
                    try {
                        const regex = /instagram.com\/(?:[A-Za-z0-9_.]+\/)?(p|reels|reel|stories)\/([A-Za-z0-9-_]+)/;
                        const match = id.match(regex);
                        const shortcode = match && match[2] ? match[2] : id; // Si no es URL, asume que es el shortcode directo

                        const graphqlUrl = "https://www.instagram.com/api/graphql";
                        const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36";
                        const xIgAppId = "936619743392459"; // Instagram Web App ID por defecto
                        const lsd = "AVqbxe3J_YA";

                        const params = new URLSearchParams();
                        params.set("variables", JSON.stringify({ shortcode }));
                        params.set("doc_id", "10015901848480474");
                        params.set("lsd", lsd);

                        console.log(`[GraphQL Fetch] Buscando post: ${shortcode}`);
                        const response = await fetch(graphqlUrl, {
                            method: "POST",
                            headers: {
                                "User-Agent": userAgent,
                                "Content-Type": "application/x-www-form-urlencoded",
                                "X-IG-App-ID": xIgAppId,
                                "X-FB-LSD": lsd,
                                "X-ASBD-ID": "129477",
                                "Sec-Fetch-Site": "same-origin"
                            },
                            body: params.toString()
                        });

                        if (response.ok) {
                            const json = await response.json();
                            const media = json?.data?.xdt_shortcode_media;
                            if (media) {
                                return sendJson({
                                    success: true,
                                    data: {
                                        collector: [{
                                            id: media.id || media.shortcode,
                                            shortcode: media.shortcode,
                                            thumbnail_src: media.thumbnail_src || media.display_url || "",
                                            display_url: media.video_url || media.display_url || "",
                                            is_video: !!media.is_video,
                                            video_duration: media.video_duration || 0,
                                            views: media.video_play_count || media.video_view_count || 0,
                                            likes: media.edge_media_preview_like?.count || 0,
                                            comments: media.edge_media_to_parent_comment?.count || 0,
                                            description: media.edge_media_to_caption?.edges?.[0]?.node?.text || "",
                                            taken_at_timestamp: media.taken_at_timestamp || Math.floor(Date.now() / 1000),
                                            owner: { username: media.owner?.username || "competencia" }
                                        }]
                                    }
                                });
                            }
                        }
                        console.log("[GraphQL Fetch] No devolvió resultados, reintentando con HikerAPI/Session...");
                    } catch (gErr) {
                        console.warn("[GraphQL Fetch] Excepción:", gErr.message, "reintentando con fallback...");
                    }
                }

                if (!apiKey && !sessionVal) {
                    return sendJson({ error: "Falta la configuración de Instagram. Configura tu HikerAPI Key o tu Instagram Session ID en el panel de Configuración para búsquedas avanzadas." }, 400);
                }

                // --- CASO 1: HikerAPI ---
                if (apiKey) {
                    const headers = {
                        'accept': 'application/json',
                        'x-access-key': apiKey
                    };

                    try {
                        if (action === "test") {
                            const url = `https://api.hikerapi.com/v1/user/by/username?username=instagram`;
                            console.log(`[HikerAPI Test] Fetching: ${url}`);
                            const response = await fetch(url, { headers });
                            if (!response.ok) {
                                const errBody = await response.text();
                                throw new Error(`Error de HikerAPI (${response.status}): ${errBody || response.statusText}`);
                            }
                            return sendJson({ success: true });
                        }

                        if (action === "user") {
                            let username = id;
                            if (username.startsWith("@")) username = username.slice(1);

                            // 1. Obtener ID del usuario
                            const userUrl = `https://api.hikerapi.com/v1/user/by/username?username=${encodeURIComponent(username)}`;
                            console.log(`[HikerAPI] Buscando usuario: ${userUrl}`);
                            const userRes = await fetch(userUrl, { headers });
                            if (!userRes.ok) {
                                const errBody = await userRes.text();
                                throw new Error(`Error buscando usuario (@${username}): ${errBody || userRes.statusText}`);
                            }
                            const userData = await userRes.json();
                            const userId = userData.id || userData.pk;
                            if (!userId) {
                                throw new Error(`No se encontró el ID de usuario para @${username}`);
                            }

                            // 2. Obtener medias
                            const mediaUrl = `https://api.hikerapi.com/v1/user/medias?user_id=${userId}&count=${count}`;
                            console.log(`[HikerAPI] Obteniendo posts: ${mediaUrl}`);
                            const mediaRes = await fetch(mediaUrl, { headers });
                            if (!mediaRes.ok) {
                                const errBody = await mediaRes.text();
                                throw new Error(`Error obteniendo publicaciones: ${errBody || mediaRes.statusText}`);
                            }
                            const mediaData = await mediaRes.json();

                            const items = Array.isArray(mediaData) ? mediaData : (mediaData.items || []);
                            
                             return sendJson({
                                success: true,
                                data: {
                                    user: {
                                        full_name: userData.full_name || userData.username || username,
                                        biography: userData.biography || "",
                                        profile_pic_url: userData.profile_pic_url || "",
                                        follower_count: userData.follower_count || userData.edge_followed_by?.count || 0,
                                        media_count: userData.media_count || items.length
                                    },
                                    collector: items.map(item => {
                                        let carousel = [];
                                        if (item.carousel_media && Array.isArray(item.carousel_media)) {
                                            carousel = item.carousel_media.map(subItem => ({
                                                is_video: subItem.media_type === 2,
                                                thumbnail: subItem.image_versions2?.candidates?.[0]?.url || "",
                                                display_url: subItem.video_versions?.[0]?.url || subItem.image_versions2?.candidates?.[0]?.url || ""
                                            }));
                                        }
                                        return {
                                            id: item.id || item.pk,
                                            shortcode: item.code || item.pk,
                                            thumbnail_src: item.thumbnail_url || (item.image_versions2?.candidates?.[0]?.url) || "",
                                            display_url: item.video_url || item.thumbnail_url || "",
                                            is_video: item.media_type === 2,
                                            video_duration: item.video_duration || 0,
                                            views: item.play_count || item.view_count || 0,
                                            likes: item.like_count || 0,
                                            comments: item.comment_count || 0,
                                            description: item.caption?.text || item.caption || "",
                                            taken_at_timestamp: item.taken_at || item.taken_at_ts || Math.floor(Date.now() / 1000),
                                            owner: { username: username },
                                            carousel_media: carousel
                                        };
                                    })
                                }
                             });
                        }

                        if (action === "comments") {
                            const shareUrl = `https://api.hikerapi.com/v1/share/by/url?url=${encodeURIComponent(id)}`;
                            console.log(`[HikerAPI] Buscando post por URL: ${shareUrl}`);
                            const shareRes = await fetch(shareUrl, { headers });
                            if (!shareRes.ok) {
                                const errBody = await shareRes.text();
                                throw new Error(`Error obteniendo Reel por URL: ${errBody || shareRes.statusText}`);
                            }
                            const item = await shareRes.json();
                            
                            return sendJson({
                                success: true,
                                data: {
                                    collector: [{
                                        id: item.id || item.pk,
                                        shortcode: item.code || item.pk,
                                        thumbnail_src: item.thumbnail_url || (item.image_versions2?.candidates?.[0]?.url) || "",
                                        display_url: item.video_url || item.thumbnail_url || "",
                                        is_video: item.media_type === 2,
                                        video_duration: item.video_duration || 0,
                                        views: item.play_count || item.view_count || 0,
                                        likes: item.like_count || 0,
                                        comments: item.comment_count || 0,
                                        description: item.caption?.text || item.caption || "",
                                        taken_at_timestamp: item.taken_at || item.taken_at_ts || Math.floor(Date.now() / 1000),
                                        owner: { username: item.user?.username || "competencia" }
                                    }]
                                }
                            });
                        }

                        if (action === "hashtag") {
                            const hashUrl = `https://api.hikerapi.com/v1/hashtag/medias/recent?hashtag=${encodeURIComponent(id)}&count=${count}`;
                            console.log(`[HikerAPI] Buscando por hashtag: ${hashUrl}`);
                            const hashRes = await fetch(hashUrl, { headers });
                            if (!hashRes.ok) {
                                const errBody = await hashRes.text();
                                throw new Error(`Error obtaining hashtag #${id}: ${errBody || hashRes.statusText}`);
                            }
                            const hashData = await hashRes.json();
                            const items = Array.isArray(hashData) ? hashData : (hashData.items || hashData.data || []);

                            return sendJson({
                                success: true,
                                data: {
                                    collector: items.map(item => {
                                        let carousel = [];
                                        if (item.carousel_media && Array.isArray(item.carousel_media)) {
                                            carousel = item.carousel_media.map(subItem => ({
                                                is_video: subItem.media_type === 2,
                                                thumbnail: subItem.image_versions2?.candidates?.[0]?.url || "",
                                                display_url: subItem.video_versions?.[0]?.url || subItem.image_versions2?.candidates?.[0]?.url || ""
                                            }));
                                        }
                                        return {
                                            id: item.id || item.pk,
                                            shortcode: item.code || item.pk,
                                            thumbnail_src: item.thumbnail_url || (item.image_versions2?.candidates?.[0]?.url) || "",
                                            display_url: item.video_url || item.thumbnail_url || "",
                                            is_video: item.media_type === 2,
                                            video_duration: item.video_duration || 0,
                                            views: item.play_count || item.view_count || 0,
                                            likes: item.like_count || 0,
                                            comments: item.comment_count || 0,
                                            description: item.caption?.text || item.caption || "",
                                            taken_at_timestamp: item.taken_at || item.taken_at_ts || Math.floor(Date.now() / 1000),
                                            owner: { username: item.user?.username || "hashtag" },
                                            carousel_media: carousel
                                        };
                                    })
                                }
                            });
                        }

                        throw new Error(`Acción de scraping no soportada: ${action}`);

                    } catch (err) {
                        console.error("[HikerAPI] Error crítico:", err.message);
                        return sendJson({
                            success: false,
                            error: err.message || "Error al conectar con HikerAPI."
                        }, 500);
                    }
                }

                // --- CASO 2: Instagram Session Cookie (Native HTTP Fetches simulating Browser) ---
                if (sessionVal) {
                    const sessionCookie = (sessionVal.includes("sessionid=") || sessionVal.includes("sessionid%3D")) ? sessionVal : `sessionid=${sessionVal}`;
                    const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36";
                    const xIgAppId = "936619743392459"; // Default Instagram Web App ID

                    const headers = {
                        "Cookie": sessionCookie,
                        "User-Agent": userAgent,
                        "X-IG-App-ID": xIgAppId,
                        "Sec-Fetch-Site": "same-origin"
                    };

                    // Diagnóstico: qué partes de la cookie están presentes
                    const cookieParts = ['mid', 'ds_user_id', 'sessionid', 'csrftoken', 'ig_did', 'rur', 'ig_nrcb'].filter(p => sessionCookie.includes(p));
                    console.log(`[Cookie Diagnóstico] Cookie tiene: [${cookieParts.join(', ')}] | Longitud: ${sessionCookie.length} chars`);
                    try {
                        let targetId = id;
                        if (targetId.startsWith("@")) targetId = targetId.slice(1);

                        if (action === "test") {
                            const url = "https://www.instagram.com/api/v1/feed/user/instagram/username/";
                            console.log(`[Scraper Local Test] Fetching: ${url}`);
                            const res = await fetch(url, { headers });
                            if (!res.ok) {
                                throw new Error(`El test falló con código HTTP ${res.status}. Es posible que las cookies no sean válidas.`);
                            }
                            return sendJson({ success: true });
                        }

                        if (action === "user") {
                            const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
                            let userData = null;
                            let items = [];
                            let scrapeMethod = "none";

                            // ═══════════════════════════════════════════════════════════
                            // PASO 0: Resolver username → user_id numérico
                            // Instagram ya NO devuelve items cuando se usa el username
                            // de texto en /feed/user/{username}/username/
                            // Ahora se necesita el pk (user_id numérico)
                            // ═══════════════════════════════════════════════════════════
                            let userId = null;
                            
                            // Método A: Búsqueda via web topsearch (usa mismas cookies web)
                            try {
                                const searchUrl = `https://www.instagram.com/web/search/topsearch/?context=blended&query=${encodeURIComponent(targetId)}&include_reel=false`;
                                console.log(`[Scraper Paso 0] Buscando user_id via topsearch...`);
                                const searchRes = await fetch(searchUrl, { headers });
                                if (searchRes.ok) {
                                    const searchData = await searchRes.json();
                                    const users = searchData.users || [];
                                    console.log(`[Scraper Paso 0] Topsearch devolvió ${users.length} resultados`);
                                    // Los resultados vienen como {user: {...}, position: N}
                                    const matched = users.find(u => {
                                        const uname = u.user?.username || u.username;
                                        return uname?.toLowerCase() === targetId.toLowerCase();
                                    });
                                    if (matched) {
                                        const userObj = matched.user || matched;
                                        userId = userObj.pk || userObj.pk_id || userObj.id;
                                        userData = userObj;
                                        console.log(`[Scraper Paso 0] ✅ Encontrado: ${userObj.username} → pk=${userId} | ${userObj.full_name}`);
                                    } else if (users.length > 0) {
                                        // Intentar el primer resultado si el username es parecido
                                        const firstUser = users[0].user || users[0];
                                        console.log(`[Scraper Paso 0] ⚠️ No coincidió exacto. Primer resultado: ${firstUser.username} (pk=${firstUser.pk})`);
                                    }
                                } else {
                                    console.warn(`[Scraper Paso 0] Topsearch falló: HTTP ${searchRes.status}`);
                                }
                            } catch (searchErr) {
                                console.warn(`[Scraper Paso 0] ❌ Error en búsqueda: ${searchErr.message}`);
                            }

                            // Método B: Obtener user_id via web_profile_info si la búsqueda falló
                            if (!userId) {
                                try {
                                    const profileUrl = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(targetId)}`;
                                    console.log(`[Scraper Paso 0B] Intentando web_profile_info para obtener user_id...`);
                                    const webHeaders = {
                                        ...headers,
                                        "Referer": `https://www.instagram.com/${targetId}/`,
                                        "X-Requested-With": "XMLHttpRequest"
                                    };
                                    const res = await fetch(profileUrl, { headers: webHeaders });
                                    if (res.ok) {
                                        const profileData = await res.json();
                                        const user = profileData?.data?.user;
                                        if (user) {
                                            userId = user.id || user.pk;
                                            userData = user;
                                            console.log(`[Scraper Paso 0B] ✅ user_id=${userId} via web_profile_info`);
                                            
                                            // Intentar extraer items directamente de web_profile_info
                                            const edges = user.edge_owner_to_timeline_media?.edges || [];
                                            if (edges.length > 0) {
                                                items = edges.map(edge => {
                                                    const node = edge.node;
                                                    let carousel = [];
                                                    if (node.edge_sidecar_to_children?.edges) {
                                                        carousel = node.edge_sidecar_to_children.edges.map(child => ({
                                                            is_video: child.node.is_video || false,
                                                            thumbnail: child.node.display_url || "",
                                                            display_url: child.node.video_url || child.node.display_url || ""
                                                        }));
                                                    }
                                                    return {
                                                        id: node.id,
                                                        shortcode: node.shortcode,
                                                        thumbnail_src: node.display_url || "",
                                                        display_url: node.video_url || node.display_url || "",
                                                        is_video: node.is_video || false,
                                                        video_duration: node.video_duration || 0,
                                                        views: node.video_play_count || node.video_view_count || 0,
                                                        likes: node.edge_media_preview_like?.count || node.edge_liked_by?.count || 0,
                                                        comments: node.edge_media_to_comment?.count || 0,
                                                        description: node.edge_media_to_caption?.edges?.[0]?.node?.text || "",
                                                        taken_at_timestamp: node.taken_at_timestamp || Math.floor(Date.now() / 1000),
                                                        owner: { username: targetId },
                                                        carousel_media: carousel
                                                    };
                                                });
                                                scrapeMethod = "web_profile_info";
                                                console.log(`[Scraper Paso 0B] ✅ También obtuvo ${items.length} posts directo de web_profile_info`);
                                            }
                                        }
                                    } else {
                                        console.warn(`[Scraper Paso 0B] web_profile_info falló: HTTP ${res.status}`);
                                    }
                                } catch (e) {
                                    console.warn(`[Scraper Paso 0B] ❌ Error: ${e.message}`);
                                }
                            }

                            // Método C: Si tenemos userId pero no media_count, obtener info del usuario
                            if (userId && (!userData?.media_count || userData.media_count === 0)) {
                                try {
                                    const userInfoUrl = `https://www.instagram.com/api/v1/users/${userId}/info/`;
                                    console.log(`[Scraper Paso 0C] Obteniendo info completa del usuario via: ${userInfoUrl}`);
                                    const infoRes = await fetch(userInfoUrl, { headers });
                                    if (infoRes.ok) {
                                        const infoData = await infoRes.json();
                                        const infoUser = infoData.user;
                                        if (infoUser) {
                                            userData = { ...(userData || {}), ...infoUser };
                                            console.log(`[Scraper Paso 0C] ✅ media_count=${infoUser.media_count} | full_name=${infoUser.full_name}`);
                                        }
                                    } else {
                                        console.warn(`[Scraper Paso 0C] HTTP ${infoRes.status}`);
                                    }
                                } catch (e) {
                                    console.warn(`[Scraper Paso 0C] ❌ ${e.message}`);
                                }
                            }

                            // ═══════════════════════════════════════════════════════════
                            // CAPA 1: Feed con user_id numérico via www.instagram.com
                            // (la forma moderna y confiable)
                            // ═══════════════════════════════════════════════════════════
                            if (items.length === 0 && userId) {
                                try {
                                    let page = 1;
                                    let nextMaxId = "";
                                    const maxPages = 4;

                                    console.log(`[Scraper Capa 1] Feed numérico para pk=${userId}`);
                                    while (items.length < count && page <= maxPages) {
                                        let url = `https://www.instagram.com/api/v1/feed/user/${userId}/?count=${Math.min(count, 33)}`;
                                        if (nextMaxId) url += `&max_id=${encodeURIComponent(nextMaxId)}`;
                                        
                                        console.log(`[Scraper Capa 1] Pág ${page}: ${url}`);
                                        const res = await fetch(url, { headers });
                                        if (!res.ok) {
                                            console.warn(`[Scraper Capa 1] HTTP ${res.status} en pág ${page}`);
                                            if (page === 1) throw new Error(`HTTP ${res.status}`);
                                            break;
                                        }
                                        const data = await res.json();
                                        console.log(`[Scraper Capa 1] Pág ${page} keys: [${Object.keys(data).join(',')}] items=${data.items?.length || 0}`);
                                        
                                        if (page === 1 && data.user) {
                                            // Mergear: conservar lo que ya tenemos de topsearch, pero actualizar con data del feed
                                            userData = { ...(userData || {}), ...data.user };
                                        }
                                        const newItems = data.items || [];
                                        if (newItems.length > 0) {
                                            items = items.concat(newItems);
                                            scrapeMethod = "mobile_numeric_feed";
                                        }
                                        nextMaxId = data.next_max_id || "";
                                        if (!nextMaxId) break;
                                        page++;
                                        if (page <= maxPages) await delay(500);
                                    }
                                    if (items.length > 0) {
                                        console.log(`[Scraper Capa 1] ✅ Total: ${items.length} posts via feed numérico`);
                                    }
                                } catch (err1) {
                                    console.warn(`[Scraper Capa 1] ❌ Feed numérico falló: ${err1.message}`);
                                }
                            }

                            // ═══════════════════════════════════════════════════════════
                            // CAPA 2: Feed por username via www (fallback legacy)
                            // ═══════════════════════════════════════════════════════════
                            if (items.length === 0) {
                                await delay(1000);
                                let page = 1;
                                let nextMaxId = "";
                                let lastUserData = null;
                                const maxPages = 2;

                                console.log(`[Scraper Capa 2] Feed legacy por username para ${targetId}`);
                                while (items.length < count && page <= maxPages) {
                                    let url = `https://www.instagram.com/api/v1/feed/user/${encodeURIComponent(targetId)}/username/?count=${Math.min(count, 33)}`;
                                    if (nextMaxId) url += `&max_id=${encodeURIComponent(nextMaxId)}`;
                                    const res = await fetch(url, { headers });
                                    if (!res.ok) {
                                        if (page === 1) throw new Error(`Instagram retornó código HTTP ${res.status}. Las cookies podrían haber expirado.`);
                                        break;
                                    }
                                    const mobileData = await res.json();
                                    lastUserData = mobileData;
                                    if (page === 1 && mobileData.user) userData = mobileData.user;

                                    const gridItems = mobileData.profile_grid_items || [];
                                    const feedItems = mobileData.items || [];
                                    console.log(`[Scraper Capa 2] Pág ${page}: grid=${gridItems.length}, items=${feedItems.length}`);
                                    
                                    const newItems = gridItems.length > 0 ? gridItems : feedItems;
                                    if (newItems.length > 0) {
                                        items = items.concat(newItems);
                                        scrapeMethod = "legacy_username_feed";
                                    }
                                    nextMaxId = mobileData.next_max_id || mobileData.profile_grid_items_cursor || "";
                                    if (!nextMaxId) break;
                                    page++;
                                }

                                if (items.length === 0) {
                                    const responseKeys = lastUserData ? Object.keys(lastUserData) : [];
                                    const errMsg = lastUserData?.message || lastUserData?.error || "ninguno";
                                    const errStatus = lastUserData?.status || "ninguno";
                                    
                                    if (errStatus === "ok") {
                                        console.log(`[Scraper Capa 2] ⚠️ Instagram respondió 'ok' pero con 0 publicaciones para @${targetId}. Posible restricción de edad/médica/país.`);
                                        return sendJson({
                                            success: false,
                                            error: `Tu cookie es VÁLIDA y conectó con éxito, pero Instagram devolvió 0 publicaciones para @${targetId}.\n\n` +
                                                   `⚠️ Esto suele ocurrir porque la cuenta de destino (@${targetId}) tiene restricciones de edad (contenido médico/bariatría) o de país.\n\n` +
                                                   `👉 SOLUCIÓN: Abre tu navegador en la cuenta señuelo, ve al perfil de @${targetId} y verifica si te pide confirmar tu edad o si tu cuenta señuelo tiene configurada una fecha de nacimiento mayor de 18 años en su configuración de perfil.`
                                        }, 400);
                                    }

                                    const userIdInfo = userId ? `user_id=${userId}` : "user_id NO resuelto (Instagram no encontró el usuario en la búsqueda)";
                                    return sendJson({
                                        success: false,
                                        error: `Scraping falló para @${targetId}. ${userIdInfo}. Última respuesta — llaves: [${responseKeys.join(', ')}]. Status: ${errStatus}. Mensaje: ${errMsg}. Verifica que el username sea correcto y que la cookie no esté expirada.`
                                    }, 400);
                                }
                            }

                            // ═══════════════════════════════════════════════════════════
                            // Mapeo final y respuesta unificada
                            // ═══════════════════════════════════════════════════════════
                            console.log(`[Scraper Local User] Método exitoso: ${scrapeMethod} | Total items: ${items.length}`);
                            
                            // Log de diagnóstico: estructura del primer item
                            if (items.length > 0) {
                                const first = items[0];
                                const firstKeys = Object.keys(first);
                                console.log(`[Scraper Diagnóstico] Primer item keys: [${firstKeys.join(', ')}]`);
                                // Si es profile_grid_items, podría ser {media: {...}} 
                                if (first.media) {
                                    console.log(`[Scraper Diagnóstico] Item envuelto en .media! Unwrapping...`);
                                    console.log(`[Scraper Diagnóstico] media keys: [${Object.keys(first.media).join(', ')}]`);
                                    items = items.map(i => i.media || i);
                                }
                            }

                            // Si los items vienen del feed móvil, hay que mapearlos
                            if (["mobile_feed", "magic_params_mobile", "mobile_numeric_feed", "legacy_username_feed"].includes(scrapeMethod)) {
                                const mappedItems = items.map(item => {
                                    let carousel = [];
                                    if (item.carousel_media && Array.isArray(item.carousel_media)) {
                                        carousel = item.carousel_media.map(subItem => ({
                                            is_video: subItem.media_type === 2,
                                            thumbnail: subItem.image_versions2?.candidates?.[0]?.url || "",
                                            display_url: subItem.video_versions?.[0]?.url || subItem.image_versions2?.candidates?.[0]?.url || ""
                                        }));
                                    }
                                    return {
                                        id: item.id || item.pk,
                                        shortcode: item.code || item.pk,
                                        thumbnail_src: item.image_versions2?.candidates?.[0]?.url || "",
                                        display_url: item.video_versions?.[0]?.url || item.image_versions2?.candidates?.[0]?.url || "",
                                        is_video: item.media_type === 2,
                                        video_duration: item.video_duration || 0,
                                        views: item.play_count || item.view_count || 0,
                                        likes: item.like_count || 0,
                                        comments: item.comment_count || 0,
                                        description: item.caption?.text || item.caption || "",
                                        taken_at_timestamp: item.taken_at || Math.floor(Date.now() / 1000),
                                        owner: { username: targetId },
                                        carousel_media: carousel
                                    };
                                });
                                return sendJson({
                                    success: true,
                                    data: {
                                        user: {
                                            full_name: userData?.full_name || targetId,
                                            biography: userData?.biography || "",
                                            profile_pic_url: userData?.profile_pic_url || "",
                                            follower_count: userData?.follower_count || userData?.edge_followed_by?.count || 0,
                                            media_count: userData?.media_count || items.length
                                        },
                                        collector: mappedItems
                                    }
                                });
                            }

                            const finalMediaCount = userData?.edge_owner_to_timeline_media?.count || userData?.media_count || items.length;
                            console.log(`[Scraper Final] Enviando respuesta: ${items.length} posts, media_count=${finalMediaCount}, full_name="${userData?.full_name}"`);
                            // Items ya mapeados (de web_profile_info o magic_params graphql)
                            return sendJson({
                                success: true,
                                data: {
                                    user: {
                                        full_name: userData?.full_name || targetId,
                                        biography: userData?.biography || "",
                                        profile_pic_url: userData?.profile_pic_url || "",
                                        follower_count: userData?.follower_count || userData?.edge_followed_by?.count || 0,
                                        media_count: finalMediaCount
                                    },
                                    collector: items
                                }
                            });
                        }

                        if (action === "hashtag") {
                            const url = `https://www.instagram.com/api/v1/tags/web_info/?tag_name=${encodeURIComponent(targetId)}`;
                            console.log(`[Scraper Local Hashtag] Fetching: ${url}`);
                            const res = await fetch(url, { headers });
                            if (!res.ok) {
                                throw new Error(`Instagram retornó código HTTP ${res.status}. Las cookies podrían haber expirado.`);
                            }
                            const hashData = await res.json();
                            const recentSec = hashData.data?.recent?.sections || [];
                            const topSec = hashData.data?.top?.sections || [];
                            const sections = recentSec.length > 0 ? recentSec : topSec;
                            const items = [];

                            sections.forEach(sec => {
                                const content = sec.layout_content || {};
                                if (Array.isArray(content.medias)) {
                                    content.medias.forEach(m => { if (m.media) items.push(m.media); });
                                }
                                if (Array.isArray(content.fill_items)) {
                                    content.fill_items.forEach(m => { if (m.media) items.push(m.media); });
                                }
                                if (content.one_by_two_item?.clips?.media) {
                                    items.push(content.one_by_two_item.clips.media);
                                }
                            });

                            return sendJson({
                                success: true,
                                data: {
                                    collector: items.map(item => {
                                        let carousel = [];
                                        if (item.carousel_media && Array.isArray(item.carousel_media)) {
                                            carousel = item.carousel_media.map(subItem => ({
                                                is_video: subItem.media_type === 2,
                                                thumbnail: subItem.image_versions2?.candidates?.[0]?.url || "",
                                                display_url: subItem.video_versions?.[0]?.url || subItem.image_versions2?.candidates?.[0]?.url || ""
                                            }));
                                        }
                                        return {
                                            id: item.id || item.pk,
                                            shortcode: item.code || item.pk,
                                            thumbnail_src: item.image_versions2?.candidates?.[0]?.url || "",
                                            display_url: item.video_versions?.[0]?.url || item.image_versions2?.candidates?.[0]?.url || "",
                                            is_video: item.media_type === 2,
                                            video_duration: item.video_duration || 0,
                                            views: item.play_count || item.view_count || 0,
                                            likes: item.like_count || 0,
                                            comments: item.comment_count || 0,
                                            description: item.caption?.text || item.caption || "",
                                            taken_at_timestamp: item.taken_at || Math.floor(Date.now() / 1000),
                                            owner: { username: item.user?.username || "hashtag" },
                                            carousel_media: carousel
                                        };
                                    })
                                }
                            });
                        }

                        if (action === "comments") {
                            const regex = /instagram.com\/(?:[A-Za-z0-9_.]+\/)?(p|reels|reel|stories)\/([A-Za-z0-9-_]+)/;
                            const match = targetId.match(regex);
                            const shortcode = match && match[2] ? match[2] : targetId;

                            // Convertir shortcode a mediaId
                            const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
                            let idVal = 0n;
                            for (let i = 0; i < shortcode.length; i++) {
                                let char = shortcode[i];
                                let index = BigInt(alphabet.indexOf(char));
                                idVal = (idVal * 64n) + index;
                            }
                            const mediaId = idVal.toString();

                            const url = `https://www.instagram.com/api/v1/media/${mediaId}/info/`;
                            console.log(`[Scraper Local Post] Converted shortcode ${shortcode} -> mediaId ${mediaId}. Fetching: ${url}`);
                            
                            const res = await fetch(url, { headers });
                            if (!res.ok) {
                                throw new Error(`Instagram retornó código HTTP ${res.status} al buscar el post.`);
                            }
                            const postData = await res.json();
                            const item = postData.items?.[0];
                            if (!item) throw new Error("No se encontraron datos de la publicación.");

                            return sendJson({
                                success: true,
                                data: {
                                    collector: [{
                                        id: item.id || item.pk,
                                        shortcode: item.code || item.pk,
                                        thumbnail_src: item.image_versions2?.candidates?.[0]?.url || "",
                                        display_url: item.video_versions?.[0]?.url || item.image_versions2?.candidates?.[0]?.url || "",
                                        is_video: item.media_type === 2,
                                        video_duration: item.video_duration || 0,
                                        views: item.play_count || item.view_count || 0,
                                        likes: item.like_count || 0,
                                        comments: item.comment_count || 0,
                                        description: item.caption?.text || item.caption || "",
                                        taken_at_timestamp: item.taken_at || Math.floor(Date.now() / 1000),
                                        owner: { username: item.user?.username || "competencia" }
                                    }]
                                }
                            });
                        }

                        throw new Error(`Acción local no soportada: ${action}`);

                    } catch (err) {
                        console.error("[Scraper Local] Error crítico:", err.message, "Causa:", err.cause, "Stack:", err.stack);
                        return sendJson({
                            success: false,
                            error: `${err.message}${err.cause ? ' (Causa: ' + err.cause.message + ')' : ''}`
                        }, 500);
                    }
                }
            }).catch(err => {
                return sendJson({ error: err.message }, 400);
            });
            return;
        }
    }

    // Default fallback
    return next();
}
