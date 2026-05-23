const nusmods = require('./nusmods');
const modulesDB = require('../db/modules');

async function refreshModules() {
    try {
        const allModules = await nusmods.getAllModules();
        const existingModules = await modulesDB.getAllModules();
        
        const existingMap = new Map(existingModules.data.map(module => [module.module_code, module]));

        for (const module of allModules) {
            const existingModule = existingMap.get(module.module_code);
            const moduleCode = module.moduleCode;
            const title = module.title;
            const semesterData = module.semesterData;
            const cachedAt = new Date().toISOString();

            if (existingModule) {
                if (existingModule.module_name !== title || JSON.stringify(existingModule.semesters) !== JSON.stringify(semesterData)) {
                    await modulesDB.upsertModule({
                        module_code: moduleCode,
                        module_name: title,
                        semesters: semesterData,
                        cached_at: cachedAt,
                    });
                    console.log(`Updated module: ${moduleCode}`);
                }
                else {
                    await modulesDB.upsertModule({
                        module_code: moduleCode,
                        module_name: existingModule.module_name,
                        semesters: existingModule.semesters,
                        cached_at: cachedAt,
                    });
                    console.log(`Updated cache timestamp for module: ${moduleCode}`);
                }
            } else {
                await modulesDB.upsertModule({
                    module_code: moduleCode,
                    module_name: title,
                    semesters: semesterData,
                    cached_at: cachedAt,
                });
                console.log(`Inserted new module: ${moduleCode}`);
            }
        }
    } catch (error) {
        console.error('Error refreshing modules:', error);
    }
    console.log('Module refresh complete');
}

module.exports = {
    refreshModules
};
        




