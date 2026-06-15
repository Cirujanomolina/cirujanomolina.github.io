import fs from 'fs';
import path from 'path';

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
    }

    // Default fallback
    return next();
}
