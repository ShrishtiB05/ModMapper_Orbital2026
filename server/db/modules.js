const supabase = require('./supabase');

function getModuleByCode(moduleCode) {
    return supabase.from('modules').select().eq('module_code', moduleCode);
}

function upsertModule(moduleData) {
    return supabase.from('modules').upsert(moduleData);
}

module.exports = {
    getModuleByCode,
    upsertModule
};