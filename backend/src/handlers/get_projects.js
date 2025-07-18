'use strict';

const { withDatabase } = require('../utils/database');
const { success, error } = require('../utils/response');
const { getAllProjects } = require('../utils/projects');

module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;

    const headers = event.headers;
    const apiKey = headers['x-api-key'];

    if(apiKey !== process.env.API_KEY) {
        return error('API key inválida', 'API key inválida', 403);
    }
    
    try {
        const projects = await withDatabase(async (db) => {
            return await getAllProjects(db);
        });

        return success(projects);
    } catch (err) {
        return error('Error getting projects', err.message);
    }
};