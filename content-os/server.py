import http.server
import socketserver
import os
import json
import urllib.request
import urllib.parse
import base64
import sys

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
CONFIG_FILE = os.path.join(DIRECTORY, "config.json")

def load_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print("Error loading config:", e)
    return {}

def save_config(config):
    try:
        with open(CONFIG_FILE, "w", encoding="utf-8") as f:
            json.dump(config, f, indent=4, ensure_ascii=False)
    except Exception as e:
        print("Error saving config:", e)

def validate_assets_path(path):
    allowed_base = os.path.abspath(os.path.join(DIRECTORY, "assets"))
    target_path = os.path.abspath(path)
    return target_path == allowed_base or target_path.startswith(allowed_base + os.sep)

def get_assets_dir():
    config = load_config()
    assets_dir = config.get("assets_dir")
    default_dir = os.path.join(DIRECTORY, "assets")
    if assets_dir:
        if validate_assets_path(assets_dir) and os.path.exists(assets_dir):
            return os.path.abspath(assets_dir)
        else:
            print(f"Warning: Configured assets path {assets_dir} is outside the allowed sandbox or does not exist. Using default.")
    return os.path.abspath(default_dir)

def get_assets_subdirs():
    assets_dir = get_assets_dir()
    if os.path.basename(assets_dir).lower() == "images_database":
        img_dir = assets_dir
        base = os.path.dirname(assets_dir)
        logo_dir = os.path.join(base, "logos")
        meta_file = os.path.join(base, "metadata.json")
    elif os.path.basename(assets_dir).lower() == "logos":
        logo_dir = assets_dir
        base = os.path.dirname(assets_dir)
        img_dir = os.path.join(base, "images_database")
        meta_file = os.path.join(base, "metadata.json")
    else:
        img_dir = os.path.join(assets_dir, "images_database")
        logo_dir = os.path.join(assets_dir, "logos")
        meta_file = os.path.join(assets_dir, "metadata.json")
    
    return img_dir, logo_dir, meta_file

def load_metadata():
    _, _, meta_file = get_assets_subdirs()
    if os.path.exists(meta_file):
        try:
            with open(meta_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print("Error loading metadata:", e)
    return {}

def save_metadata(metadata):
    _, _, meta_file = get_assets_subdirs()
    try:
        os.makedirs(os.path.dirname(meta_file), exist_ok=True)
        with open(meta_file, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=4, ensure_ascii=False)
    except Exception as e:
        print("Error saving metadata:", e)

def analyze_image_with_gemini(img_path, api_key):
    ext = os.path.splitext(img_path)[1].lower()
    mime_type = "image/jpeg"
    if ext == ".png":
        mime_type = "image/png"
    elif ext == ".webp":
        mime_type = "image/webp"
        
    try:
        with open(img_path, "rb") as f:
            img_data = f.read()
        base64_data = base64.b64encode(img_data).decode("utf-8")
    except Exception as e:
        return {"error": f"Fallo al leer archivo: {str(e)}"}
        
    prompt = """
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
    """
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    payload = {
        "contents": [{
            "parts": [
                {"text": prompt},
                {
                    "inlineData": {
                        "mimeType": mime_type,
                        "data": base64_data
                    }
                }
            ]
        }],
        "generationConfig": {
            "response_mime_type": "application/json"
        }
    }
    
    import time
    import urllib.error
    
    max_retries = 5
    for attempt in range(max_retries):
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=30) as response:
                res_data = response.read().decode("utf-8")
                res_json = json.loads(res_data)
                text_response = res_json["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(text_response.strip())
        except urllib.error.HTTPError as e:
            if e.code in (429, 503) and attempt < max_retries - 1:
                sleep_time = (attempt + 1) * 4 # 4s, 8s, 12s, 16s...
                print(f"Gemini API rate limited (code {e.code}) for {img_path}. Retrying in {sleep_time} seconds (attempt {attempt + 1}/{max_retries})...")
                time.sleep(sleep_time)
                continue
            else:
                print(f"HTTP Error calling Gemini API for {img_path}: {e}")
                return {"error": f"HTTP Error {e.code}: {e.reason}"}
        except Exception as e:
            if attempt < max_retries - 1:
                sleep_time = (attempt + 1) * 2
                print(f"Error calling Gemini API for {img_path}: {e}. Retrying in {sleep_time}s...")
                time.sleep(sleep_time)
                continue
            else:
                print(f"Error calling Gemini API for {img_path}: {e}")
                return {"error": str(e)}

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        if self.path == "/api/assets":
            self.handle_get_assets()
        elif self.path == "/api/logos":
            self.handle_get_logos()
        elif self.path == "/api/config":
            self.handle_get_config()
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == "/api/rescan":
            self.handle_rescan()
        elif self.path == "/api/rename":
            self.handle_rename()
        elif self.path == "/api/save-config":
            self.handle_save_config()
        elif self.path == "/api/list-folders":
            self.handle_list_folders()
        elif self.path == "/api/upload-avatar":
            self.handle_upload_avatar()
        elif self.path == "/api/upload-format-image":
            self.handle_upload_format_image()
        else:
            self.send_error(404, "Endpoint not found")

    def handle_get_config(self):
        assets_dir = get_assets_dir()
        self.send_json_response({
            "assets_dir": assets_dir,
            "default_dir": os.path.abspath(os.path.join(DIRECTORY, "assets")),
            "project_dir": DIRECTORY
        })

    def handle_save_config(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            req_params = json.loads(post_data.decode('utf-8'))
        except Exception as e:
            self.send_json_response({"error": "Petición JSON inválida"}, status=400)
            return
        
        assets_dir = req_params.get("assets_dir")
        if not assets_dir:
            self.send_json_response({"error": "Falta la ruta de la carpeta assets"}, status=400)
            return

        if not os.path.exists(assets_dir):
            self.send_json_response({"error": "La carpeta especificada no existe en el disco duro"}, status=400)
            return

        if not validate_assets_path(assets_dir):
            self.send_json_response({
                "error": "Acceso Denegado: Por seguridad, solo se permite seleccionar la carpeta 'assets' o sus subdirectorios dentro del proyecto."
            }, status=403)
            return

        config = load_config()
        config["assets_dir"] = os.path.abspath(assets_dir)
        save_config(config)

        self.send_json_response({
            "success": True,
            "assets_dir": os.path.abspath(assets_dir)
        })

    def handle_list_folders(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            req_params = json.loads(post_data.decode('utf-8')) if content_length > 0 else {}
        except Exception as e:
            req_params = {}
        
        base_dir = os.path.abspath(DIRECTORY)
        sub_dir = req_params.get("dir", "")
        
        if sub_dir:
            target_dir = os.path.abspath(sub_dir)
        else:
            target_dir = base_dir

        if not (target_dir == base_dir or target_dir.startswith(base_dir + os.sep)):
            target_dir = base_dir

        folders = []
        try:
            for item in os.listdir(target_dir):
                item_path = os.path.join(target_dir, item)
                if os.path.isdir(item_path) and not item.startswith('.'):
                    folders.append({
                        "name": item,
                        "path": item_path,
                        "is_assets_compatible": validate_assets_path(item_path)
                    })
        except Exception as e:
            self.send_json_response({"error": str(e)}, status=500)
            return

        self.send_json_response({
            "current_dir": target_dir,
            "project_dir": base_dir,
            "parent_dir": os.path.dirname(target_dir) if target_dir != base_dir else None,
            "folders": sorted(folders, key=lambda x: x["name"].lower())
        })

    def handle_get_assets(self):
        img_dir, logo_dir, _ = get_assets_subdirs()
        images = []
        if os.path.exists(img_dir):
            for f in os.listdir(img_dir):
                if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                    images.append(f)
        
        metadata = load_metadata()
        
        enriched_images = []
        for img in images:
            img_meta = metadata.get(img, {})
            enriched_images.append({
                "name": img,
                "path": f"../assets/images_database/{img}",
                "photo_type": img_meta.get("photo_type", "Desconocido"),
                "subject": img_meta.get("subject", "Desconocido"),
                "subject_position": img_meta.get("subject_position", "Desconocido"),
                "detailed_description": img_meta.get("detailed_description", ""),
                "mood": img_meta.get("mood", "Desconocido"),
                "safe_space": img_meta.get("safe_space", "Desconocido"),
                "suggested_filename": img_meta.get("suggested_filename", "")
            })
            
        logos = []
        if os.path.exists(logo_dir):
            for f in os.listdir(logo_dir):
                if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                    logos.append(f)

        self.send_json_response({
            "images": enriched_images,
            "logos": logos,
            "assets_directory": get_assets_dir()
        })

    def handle_get_logos(self):
        _, logo_dir, _ = get_assets_subdirs()
        logos = []
        if os.path.exists(logo_dir):
            for f in os.listdir(logo_dir):
                if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                    logos.append(f)
        self.send_json_response({"logos": logos})

    def handle_rescan(self):
        import re
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            req_params = json.loads(post_data.decode('utf-8'))
        except Exception as e:
            self.send_json_response({"error": "Petición JSON inválida"}, status=400)
            return
        
        api_key = req_params.get("api_key")
        if not api_key:
            self.send_json_response({"error": "Falta la clave API de Gemini"}, status=400)
            return

        img_dir, _, _ = get_assets_subdirs()
        if not os.path.exists(img_dir):
            self.send_json_response({"error": "La carpeta de imágenes no existe"}, status=400)
            return

        images = []
        for f in os.listdir(img_dir):
            if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                images.append(f)

        metadata = load_metadata()
        new_analyses = 0
        errors = []
        metadata_changed = False

        # 1. Analizar imágenes que no tengan metadatos completos (incluyendo subject_position)
        for img in images:
            if img in metadata and metadata[img].get("safe_space") and metadata[img].get("detailed_description") and metadata[img].get("subject_position"):
                continue
                
            img_path = os.path.join(img_dir, img)
            print(f"Analizando imagen: {img} con Gemini API...")
            try:
                analysis = analyze_image_with_gemini(img_path, api_key)
                if "error" in analysis:
                    errors.append(f"Error en {img}: {analysis['error']}")
                else:
                    metadata[img] = analysis
                    new_analyses += 1
                    metadata_changed = True
                
                # Pequeña espera para no exceder los límites de la API gratis (15 RPM)
                import time
                time.sleep(4)
            except Exception as e:
                errors.append(f"Fallo al analizar {img}: {str(e)}")

        # 2. Renombrado automático inteligente para todas las imágenes válidas
        disk_files = []
        if os.path.exists(img_dir):
            for f in os.listdir(img_dir):
                if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                    disk_files.append(f)

        for img in disk_files:
            img_meta = metadata.get(img)
            if not img_meta or "error" in img_meta:
                continue
                
            suggested_name = img_meta.get("suggested_filename")
            if not suggested_name:
                continue
                
            suggested_name = os.path.basename(suggested_name)
            suggested_base, suggested_ext = os.path.splitext(suggested_name)
            _, original_ext = os.path.splitext(img)
            ext = suggested_ext if suggested_ext else original_ext
            
            # Limpiar nombre propuesto: alfanuméricos, guiones y minúsculas
            clean_base = "".join(c if c.isalnum() or c in ("_", "-") else "_" for c in suggested_base).lower()
            while "__" in clean_base:
                clean_base = clean_base.replace("__", "_")
            clean_base = clean_base.strip("_")
            
            ext = ext.lower()
            
            # Comprobar si ya sigue el formato: clean_base + (opcional _d+) + ext
            pattern = re.compile(r"^" + re.escape(clean_base) + r"(_\d+)??" + re.escape(ext) + r"$", re.IGNORECASE)
            if pattern.match(img):
                # Ya renombrado
                continue
                
            # Encontrar nombre único
            final_name = f"{clean_base}{ext}"
            counter = 1
            while os.path.exists(os.path.join(img_dir, final_name)):
                final_name = f"{clean_base}_{counter}{ext}"
                counter += 1
                
            # Renombrar archivo en disco
            old_path = os.path.join(img_dir, img)
            new_path = os.path.join(img_dir, final_name)
            try:
                os.rename(old_path, new_path)
                print(f"Renombrado automático en disco: {img} -> {final_name}")
                # Mapear metadatos a la nueva clave
                metadata[final_name] = img_meta
                if img in metadata:
                    del metadata[img]
                metadata_changed = True
            except Exception as rename_error:
                print(f"Error al renombrar {img} a {final_name}: {rename_error}")
                errors.append(f"Error al renombrar {img}: {str(rename_error)}")

        if metadata_changed:
            save_metadata(metadata)

        # Volver a cargar la lista final de imágenes desde el disco
        final_images = []
        if os.path.exists(img_dir):
            for f in os.listdir(img_dir):
                if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                    final_images.append(f)

        enriched_images = []
        for img in final_images:
            img_meta = metadata.get(img, {})
            enriched_images.append({
                "name": img,
                "path": f"../assets/images_database/{img}",
                "photo_type": img_meta.get("photo_type", "Desconocido"),
                "subject": img_meta.get("subject", "Desconocido"),
                "subject_position": img_meta.get("subject_position", "Desconocido"),
                "detailed_description": img_meta.get("detailed_description", ""),
                "mood": img_meta.get("mood", "Desconocido"),
                "safe_space": img_meta.get("safe_space", "Desconocido"),
                "suggested_filename": img_meta.get("suggested_filename", "")
            })

        self.send_json_response({
            "success": True,
            "new_analyses": new_analyses,
            "errors": errors,
            "images": enriched_images
        })

    def handle_rename(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            req_params = json.loads(post_data.decode('utf-8'))
        except Exception as e:
            self.send_json_response({"error": "Petición JSON inválida"}, status=400)
            return
        
        old_name = req_params.get("old_name")
        new_name = req_params.get("new_name")
        
        if not old_name or not new_name:
            self.send_json_response({"error": "Nombres inválidos"}, status=400)
            return

        new_name = os.path.basename(new_name)
        _, ext = os.path.splitext(old_name)
        if not new_name.lower().endswith(ext.lower()):
            new_name += ext

        img_dir, _, _ = get_assets_subdirs()
        old_path = os.path.join(img_dir, old_name)
        new_path = os.path.join(img_dir, new_name)

        if not os.path.exists(old_path):
            self.send_json_response({"error": "La imagen original no existe"}, status=400)
            return
        
        if os.path.exists(new_path) and old_name != new_name:
            self.send_json_response({"error": "Ya existe una imagen con el nuevo nombre"}, status=400)
            return

        try:
            os.rename(old_path, new_path)
            
            metadata = load_metadata()
            if old_name in metadata:
                metadata[new_name] = metadata[old_name]
                del metadata[old_name]
                save_metadata(metadata)
                
            self.send_json_response({
                "success": True,
                "old_name": old_name,
                "new_name": new_name
            })
        except Exception as e:
            self.send_json_response({"error": f"Error al renombrar: {str(e)}"}, status=500)

    def handle_upload_avatar(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            req_params = json.loads(post_data.decode('utf-8'))
        except Exception as e:
            self.send_json_response({"error": "Petición JSON inválida"}, status=400)
            return

        filename = req_params.get("filename")
        base64_data = req_params.get("base64_data")
        
        if not filename or not base64_data:
            self.send_json_response({"error": "Falta el nombre del archivo o los datos base64"}, status=400)
            return

        safe_filename = os.path.basename(filename)
        _, ext = os.path.splitext(safe_filename.lower())
        if ext not in ['.jpg', '.jpeg', '.png', '.webp', '.gif']:
            self.send_json_response({"error": "Formato de imagen no permitido"}, status=400)
            return

        avatars_dir = os.path.join(DIRECTORY, "assets", "avatars")
        os.makedirs(avatars_dir, exist_ok=True)
        file_path = os.path.join(avatars_dir, safe_filename)

        try:
            file_bytes = base64.b64decode(base64_data)
            with open(file_path, "wb") as f:
                f.write(file_bytes)
            
            relative_url = f"/assets/avatars/{safe_filename}"
            self.send_json_response({
                "success": True,
                "url": relative_url
            })
        except Exception as e:
            self.send_json_response({"error": f"Fallo al guardar imagen: {str(e)}"}, status=500)

    def handle_upload_format_image(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            req_params = json.loads(post_data.decode('utf-8'))
        except Exception as e:
            self.send_json_response({"error": "Petición JSON inválida"}, status=400)
            return

        filename = req_params.get("filename")
        base64_data = req_params.get("base64_data")
        
        if not filename or not base64_data:
            self.send_json_response({"error": "Falta el nombre del archivo o los datos base64"}, status=400)
            return

        safe_filename = os.path.basename(filename)
        _, ext = os.path.splitext(safe_filename.lower())
        if ext not in ['.jpg', '.jpeg', '.png', '.webp', '.gif']:
            self.send_json_response({"error": "Formato de imagen no permitido"}, status=400)
            return

        formats_dir = os.path.join(DIRECTORY, "assets", "formatos")
        os.makedirs(formats_dir, exist_ok=True)
        file_path = os.path.join(formats_dir, safe_filename)

        try:
            file_bytes = base64.b64decode(base64_data)
            with open(file_path, "wb") as f:
                f.write(file_bytes)
            
            relative_url = f"/assets/formatos/{safe_filename}"
            self.send_json_response({
                "success": True,
                "url": relative_url
            })
        except Exception as e:
            self.send_json_response({"error": f"Fallo al guardar imagen de formato: {str(e)}"}, status=500)

    def send_json_response(self, data, status=200):
        response_bytes = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(response_bytes)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(response_bytes)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == "__main__":
    Handler = CustomHTTPRequestHandler
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Servidor Content OS en ejecución en http://localhost:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor detenido.")
            sys.exit(0)
