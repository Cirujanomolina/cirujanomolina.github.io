// auth-guard.js
// SEGURIDAD & CONTROL DE ACCESO:
// Valida la sesión real contra Supabase Auth y verifica permisos en la tabla 'team'.
//
// Reglas de acceso:
// - Administrador ('admin'): Acceso total (Dashboard + Content OS).
// - Equipo de Redes ('redes', 'community_manager', 'creador_contenido', 'editor_video', 'copywriter'): SOLO Content OS.
// - Equipo Clínico ('nutricionista', 'psicologa', 'med_interna', 'med_deporte', 'cirugia_bariatrica'): SOLO Dashboard Clínico.

import { supabase } from './supabase-client.js';

const CONTENT_OS_ROLES = [
    'admin',
    'redes',
    'community_manager',
    'creador_contenido',
    'editor_video',
    'copywriter',
    'collaborator' // legacy
];

const CLINICAL_ONLY_ROLES = [
    'nutricionista',
    'psicologa',
    'med_deporte',
    'med_interna',
    'cirugia_bariatrica'
];

export async function requireAuth() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        redirectToLogin();
        return new Promise(() => {}); // detiene la ejecución del módulo
    }

    let profile = null;

    try {
        const { data: teamUser, error: teamErr } = await supabase
            .from('team')
            .select('*')
            .or(`auth_user_id.eq.${session.user.id},email.eq.${session.user.email?.toLowerCase()}`)
            .maybeSingle();

        if (teamUser && !teamErr) {
            if (teamUser.activo === false) {
                alert('Tu cuenta está registrada pero aún está pendiente de aprobación por el Dr. Molina.');
                await supabase.auth.signOut();
                redirectToLogin();
                return new Promise(() => {});
            }

            const userRole = (teamUser.role || '').toLowerCase();

            // Bloquear si es clínico intentando entrar a Content OS
            if (CLINICAL_ONLY_ROLES.includes(userRole)) {
                alert('⚠️ Acceso Restringido:\nTu cuenta está asignada al Dashboard Clínico. No tienes permisos para acceder al Content OS.');
                await supabase.auth.signOut();
                redirectToLogin();
                return new Promise(() => {});
            }

            if (CONTENT_OS_ROLES.includes(userRole) || userRole === 'admin') {
                profile = {
                    id: teamUser.id,
                    username: teamUser.email?.split('@')[0] || 'usuario',
                    name: teamUser.name || `${teamUser.nombres || ''} ${teamUser.apellidos || ''}`.trim() || teamUser.email,
                    email: teamUser.email,
                    role: userRole === 'admin' ? 'administrador' : 'colaborador',
                    function: teamUser.role,
                    verified: teamUser.activo !== false,
                    photo_url: teamUser.avatar_url || '',
                    auth_user_id: session.user.id
                };
            }
        }
    } catch (e) {
        console.warn('Error al verificar tabla team en auth-guard:', e);
    }

    if (!profile) {
        await supabase.auth.signOut();
        redirectToLogin();
        return new Promise(() => {});
    }

    return profile;
}

function redirectToLogin() {
    const loginUrl = new URL('../content-os.html', window.location.href).href;
    window.top.location.href = loginUrl;
}

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