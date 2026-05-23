function moduleGetData (moduleCode) {

    const year = new Date().getFullYear();
    const url = `https://api.nusmods.com/v2/${year}-${year+1}/modules/${moduleCode}.json`;
    return async () => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching module data:', error);
            throw error;
        }
    };
}

module.exports = {
    moduleGetData
};