function moduleGetData (moduleCode) {
    const url = `https://api.nusmods.com/v2/2024-2025/modules/${moduleCode}.json`;
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error fetching module data:', error);
            throw error;
        });
}

module.exports = {
    moduleGetData
};