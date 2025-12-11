/* 
Purpose: Helper functions for reading and writing JSON files.
            Also written with validations and atomic writes 
            to avoid corrupted data.
*/

// Imports
const fs = require('fs').promises;
const path = require('path');

// Reads & parses JSON file safely
async function readJSON(filePath) {
    try {
        const fullPath = path.join(__dirname, '../../data', filePath);
        const content = await fs.readFile(fullPath, 'utf8');

        return content.trim() ? JSON.parse(content) : [];
    } catch (error) {
        // If file doesn't exist, return empty array
        if (error.code === 'ENOENT') return [];
        throw error;
    }
}

//Writes a JS object/array to a JSON file, with atomic write
async function writeJSON(filePath, data) {
    const fullPath = path.join(__dirname, '../../data', filePath);
    const tempPath = fullPath + '.tmp';

    const jsonString = JSON.stringify(data, null, 2);

    await fs.writeFile(tempPath, jsonString, 'utf8');
    await fs.rename(tempPath, fullPath);
}

// Export functions
module.exports = {
    readJSON,
    writeJSON
};
