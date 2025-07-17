'use strict';

const { ObjectId } = require('mongodb');
const { withDatabase } = require('../utils/database');
const { success, error } = require('../utils/response');
const { getProjectById } = require('../utils/projects');

module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    
    try {
        const projectId = event.pathParameters.id;
        const updateData = JSON.parse(event.body);
        
        if (!projectId) {
            return error('Missing project ID', 'Project ID is required', 400);
        }
        
        if (!updateData || Object.keys(updateData).length === 0) {
            return error('Missing update data', 'No fields provided for update', 400);
        }
        
        const result = await withDatabase(async (db) => {
            // Convert string ID to MongoDB ObjectId
            const objectId = ObjectId.createFromHexString(projectId.toString());
            
            // Prepare update object with only allowed fields
            const updateFields = {};
            const allowedFields = ['title', 'description', 'script'];
            
            for (const field of allowedFields) {
                if (updateData[field] !== undefined) {
                    updateFields[field] = updateData[field];
                }
            }
            
            // Add updatedAt timestamp
            updateFields.updatedAt = new Date();
            
            // Update the project
            const updateResult = await db.collection('projects').updateOne(
                { _id: objectId },
                { $set: updateFields }
            );
            
            if (updateResult.matchedCount === 0) {
                throw new Error(`No project found with ID: ${projectId}`);
            }
            
            // Fetch the updated project with scenes, images, and videos
            return await getProjectById(db, objectId);
        });
        
        return success({
            message: 'Project updated successfully',
            project: result,
        });
    } catch (err) {
        return error('Error updating project', err);
    }
};
