'use strict';

const { ObjectId } = require('mongodb');
const { withDatabase } = require('../utils/database');
const { success, error } = require('../utils/response');

module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    
    const headers = event.headers;
    const apiKey = headers['x-api-key'];

    if(apiKey !== process.env.API_KEY) {
        return error('API key inválida', 'API key inválida', 403);
    }
    
    try {
        const projectId = event.pathParameters.id;
        
        if (!projectId) {
            return error('Missing project ID', 'Project ID is required', 400);
        }
        
        const result = await withDatabase(async (db) => {
            // Convert string ID to MongoDB ObjectId
            const objectId = ObjectId.createFromHexString(projectId.toString());
            
            // Find scenes associated with this project
            const scenes = await db.collection('scenes')
                .find({ projectId: objectId })
                .toArray();
            
            // Delete all videos associated with these scenes
            for (const scene of scenes) {
                await db.collection('videos').deleteMany({ sceneId: scene._id });
                await db.collection('images').deleteMany({ sceneId: scene._id });
            }
            
            // Delete all scenes
            await db.collection('scenes').deleteMany({ projectId: objectId });
            
            // Delete the project
            const deleteResult = await db.collection('projects').deleteOne({ _id: objectId });
            
            return {
                deleted: deleteResult.deletedCount > 0,
                projectId: projectId
            };
        });
        
        if (!result.deleted) {
            return error('Project not found', `No project found with ID: ${projectId}`, 404);
        }
        
        return success({
            message: 'Project deleted successfully',
            projectId: result.projectId
        });
    } catch (err) {
        return error('Error deleting project', err.message);
    }
};
