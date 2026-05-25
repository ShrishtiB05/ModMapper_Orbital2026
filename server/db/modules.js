const supabase = require('./supabase');

function getModuleByCode(moduleCode) {
    return supabase.from('modules').select().eq('module_code', moduleCode);
}

function upsertModule(moduleData) {
    return supabase.from('modules').upsert(moduleData, { onConflict: 'module_code' });
}

function getAllModules() {
    return supabase.from('modules').select();
}

module.exports = {
    getModuleByCode,
    upsertModule,
    getAllModules
};