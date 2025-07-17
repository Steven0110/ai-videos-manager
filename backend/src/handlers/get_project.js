'use strict';

const { withDatabase } = require('../utils/database');
const { success, error } = require('../utils/response');
const { getProjectById } = require('../utils/projects');

module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    
    try {
        const project = await withDatabase(async (db) => {
            return await getProjectById(db, event.pathParameters.id);
        });

        return success({
            message: 'Project fetched successfully',
            project: project
        });
    } catch (err) {
        return error('Error getting project', err.message);
    }
};