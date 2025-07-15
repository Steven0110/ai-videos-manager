'use strict';

const { withDatabase } = require('../utils/database');
const { success, error } = require('../utils/response');

module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    
    try {
        const projects = await withDatabase(async (db) => {
            return await db
            .collection('projects')
            .aggregate([
                { $sort: { createdAt: -1 } },
                { $lookup: {
                    from: 'scenes',
                    localField: '_id',
                    foreignField: 'projectId',
                    as: 'scene'
                }},
                { $unwind: '$scene' },
                { $lookup: {
                    from: 'images',
                    localField: 'scene._id',
                    foreignField: 'sceneId',
                    as: 'scene.image'
                }},
                { $unwind: '$scene.image' },
                { $lookup: {
                    from: 'videos',
                    localField: 'scene._id',
                    foreignField: 'sceneId',
                    as: 'scene.video'
                }},
                { $unwind: '$scene.video' },
                { $sort: { 'scene.index': 1 } },
                { $group: {
                    _id: '$_id',
                    title: { $first: '$title' },
                    description: { $first: '$description' },
                    script: { $first: '$script' },
                    scenes: { $push: '$scene' },
                    createdAt: { $first: '$createdAt' },
                    updatedAt: { $first: '$updatedAt' },
                }},
                { $sort: { createdAt: -1 } },
            ])
            .toArray();
        });

        return success(projects);
    } catch (err) {
        return error('Error getting projects', err.message);
    }
};