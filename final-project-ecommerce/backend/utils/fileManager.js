const fs = require('fs').promises;
const path = require('path');

class FileManager {
    constructor(filePath) {
        this.filePath = path.join(__dirname, '../../', filePath);
    }

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

    async write(data) {
        try {
            await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
            return true;
        } catch (error) {
            throw error;
        }
    }

    async append(item) {
        const data = await this.read();
        data.push(item);
        await this.write(data);
        return item;
    }

    async update(id, updates) {
        const data = await this.read();
        const index = data.findIndex(item => item.id === id);
        if (index === -1) return null;
        data[index] = { ...data[index], ...updates };
        await this.write(data);
        return data[index];
    }

    async delete(id) {
        const data = await this.read();
        const filtered = data.filter(item => item.id !== id);
        if (filtered.length === data.length) return false;
        await this.write(filtered);
        return true;
    }

    async findOne(query) {
        const data = await this.read();
        return data.find(item => {
            return Object.keys(query).every(key => item[key] === query[key]);
        });
    }

    async findById(id) {
        const data = await this.read();
        return data.find(item => item.id === id);
    }
}

module.exports = FileManager;
