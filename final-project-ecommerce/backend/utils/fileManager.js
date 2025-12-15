// Purpose: Provides file-based database operations for JSON data storage
const fs = require('fs').promises;
const path = require('path');

class FileManager {
    // Initializes FileManager with file path
    constructor(filePath) {
        this.filePath = path.join(__dirname, '../../', filePath);
    }

    // Reads and parses JSON data from file
    async read() {
        try {
            const data = await fs.readFile(this.filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                return [];
            }
            throw error;
        }
    }

    // Writes data to JSON file
    async write(data) {
        try {
            await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Appends new item to JSON array
    async append(item) {
        const data = await this.read();
        data.push(item);
        await this.write(data);
        return item;
    }

    // Updates item by ID with new data
    async update(id, updates) {
        const data = await this.read();
        const index = data.findIndex(item => item.id === id);
        if (index === -1) return null;
        data[index] = { ...data[index], ...updates };
        await this.write(data);
        return data[index];
    }

    // Deletes item by ID from array
    async delete(id) {
        const data = await this.read();
        const filtered = data.filter(item => item.id !== id);
        if (filtered.length === data.length) return false;
        await this.write(filtered);
        return true;
    }

    // Finds first item matching query criteria
    async findOne(query) {
        const data = await this.read();
        return data.find(item => {
            return Object.keys(query).every(key => item[key] === query[key]);
        });
    }

    // Finds item by ID
    async findById(id) {
        const data = await this.read();
        return data.find(item => item.id === id);
    }
}

module.exports = FileManager;
