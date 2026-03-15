// ── Rynex Security — Shared Config ──────────────────────────────────────────
// Paste your Supabase credentials here once — used by all pages
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Safe Supabase client init
let sb = null;
try {
    if (SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
        sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
} catch(e) {
    console.warn('Supabase not connected:', e.message);
}

// ── Auth helpers ─────────────────────────────────────────────────────────────

async function getSession() {
    if (!sb) return null;
    const { data: { session } } = await sb.auth.getSession();
    return session;
}

async function getProfile(userId) {
    if (!sb) return null;
    const { data } = await sb.from('profiles').select('*').eq('id', userId).single();
    return data;
}

async function requireAuth(role) {
    const session = await getSession();
    if (!session) { window.location.href = '/login'; return null; }
    const profile = await getProfile(session.user.id);
    if (!profile)  { window.location.href = '/login'; return null; }
    if (role && profile.role !== role) {
        window.location.href = profile.role === 'admin' ? '/admin' : '/dashboard';
        return null;
    }
    if (profile.status === 'suspended') {
        await sb.auth.signOut();
        window.location.href = '/login';
        return null;
    }
    return { session, profile };
}

async function logout() {
    if (sb) await sb.auth.signOut();
    window.location.href = '/login';
}

// Service display names
const SERVICE_NAMES = {
    vapt:     'VAPT Assessment',
    soc:      'SOC / SIEM Monitoring',
    audit:    'Security Audit',
    threat:   'Threat Hunting',
    malware:  'Malware Analysis',
    incident: 'Incident Response'
};

// Status badge colours
const STATUS_COLORS = {
    active:    { bg: 'rgba(0,242,255,0.12)',  color: '#00f2ff'  },
    pending:   { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24'  },
    suspended: { bg: 'rgba(255,77,109,0.12)', color: '#ff4d6d'  }
};
