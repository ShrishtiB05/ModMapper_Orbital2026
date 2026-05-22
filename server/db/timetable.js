const supabase = require('./supabase');

function getTimetableByUserID(userID) {

    return supabase.from('user_timetable').select().eq('user_id', userID);

}

function upsertTimetableEntry(entryData) {
    return supabase.from('user_timetable').upsert(entryData, { onConflict: 'user_id' }).select();
}

module.exports = {
    getTimetableByUserID,
    upsertTimetableEntry
};