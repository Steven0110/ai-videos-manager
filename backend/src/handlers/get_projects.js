'use strict';

const { withDatabase } = require('../utils/database');
const { success, error } = require('../utils/response');
const { getAllProjects } = require('../utils/projects');

module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    
    try {
        const projects = await withDatabase(async (db) => {
            return await getAllProjects(db);
        });

        return success(projects);
    } catch (err) {
        return error('Error getting projects', err.message);
    }
};