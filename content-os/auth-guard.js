// auth-guard.js
// SEGURIDAD: reemplaza la confianza ciega en localStorage.getItem('content_os_user')
// (que cualquiera podía fabricar manualmente desde la consola del navegador) por una
// verificación real contra la sesión de Supabase Auth, firmada y verificada por el servidor.
//
// Uso dentro de cualquier módulo (modules/*.html):
//   import { requireAuth } from '../auth-guard.js';
//   const perfil = await requireAuth();
//   // perfil = { id, username, name, email, role, function, verified, auth_user_id, ... }
//
// Si no hay sesión válida o el colaborador no está verificado, esta función
// redirige automáticamente a la pantalla de login (content-os.html) y nunca
// resuelve la promesa (evita que el resto del módulo siga ejecutándose).

import { supabase } from './supabase-client.js';

export async function requireAuth() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        redirectToLogin();
        return new Promise(() => {}); // detiene la ejecución del módulo
    }

    const { data: profile, error } = await supabase
        .from('colaboradores')
        .select('*')
        .eq('auth_user_id', session.user.id)
        .single();

    if (error || !profile || !profile.verified) {
        await supabase.auth.signOut();
        redirectToLogin();
        return new Promise(() => {});
    }

    return profile;
}

function redirectToLogin() {
    // Los módulos viven dentro de content-os/modules/ y este script siempre se
    // ejecuta desde ahí (auth-guard.js se importa con '../auth-guard.js').
    // Usamos new URL() para resolver la ruta relativa de forma explícita y
    // absoluta, en vez de dejar que el navegador la resuelva implícitamente
    // (eso fue lo que causaba que terminara armando una ruta incorrecta
    // como '.../content-os/modules/content-os.html').
    const loginUrl = new URL('../content-os.html', window.location.href).href;
    window.top.location.href = loginUrl;
}

// Helper de conveniencia: exige además un rol específico (ej. 'administrador').
export async function requireRole(rolesPermitidos) {
    const profile = await requireAuth();
    const roles = Array.isArray(rolesPermitidos) ? rolesPermitidos : [rolesPermitidos];
    if (!roles.includes(profile.role)) {
        alert('No tienes permisos para acceder a esta sección.');
        redirectToLogin();
        return new Promise(() => {});
    }
    return profile;
}