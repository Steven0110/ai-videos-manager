'use strict';

const { ObjectId } = require('mongodb');

/**
 * Retrieves a project by ID with all related data (scenes, images, videos)
 * @param {Object} db - MongoDB database connection
 * @param {string} projectId - Project ID to retrieve
 * @returns {Promise<Object>} - Project with all related data
 */
const getProjectById = async (db, projectId) => {
    const objectId = typeof projectId === 'string' 
        ? ObjectId.createFromHexString(projectId)
        : projectId;
    
    const project = await db
        .collection('projects')
        .aggregate([
            { $match: { _id: objectId } },
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
                as: 'scene.images'
            }},
            { $lookup: {
                from: 'videos',
                localField: 'scene._id',
                foreignField: 'sceneId',
                as: 'scene.videos'
            }},
            { $sort: { 'scene.index': 1 } },
            { $group: {
                _id: '$_id',
                title: { $first: '$title' },
                description: { $first: '$description' },
                script: { $first: '$script' },
                audioUrl: { $first: '$audioUrl' },
                facebookDescription: { $first: '$facebookDescription' },
                instagramDescription: { $first: '$instagramDescription' },
                tiktokDescription: { $first: '$tiktokDescription' },
                youtubeDescription: { $first: '$youtubeDescription' },
                scenes: { $push: '$scene' },
                createdAt: { $first: '$createdAt' },
                updatedAt: { $first: '$updatedAt' },
            }}
        ])
        .toArray();
    
    return project[0];
};

/**
 * Retrieves a scene by generation ID
 * @param {Object} db - MongoDB database connection
 * @param {string} generationId - Generation ID to retrieve
 * @returns {Promise<Object>} - Scene with all related data
 */
const getSceneByGenerationId = async (db, generationId) => {
    return await db.collection('scenes').findOne({ generationId: generationId });
};

/**
 * Retrieves all projects with their related data (scenes, images, videos)
 * @param {Object} db - MongoDB database connection
 * @returns {Promise<Array>} - Array of projects with all related data
 */
const getAllProjects = async (db) => {
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
                as: 'scene.images'
            }},
            { $lookup: {
                from: 'videos',
                localField: 'scene._id',
                foreignField: 'sceneId',
                as: 'scene.videos'
            }},
            { $sort: { 'scene.index': 1 } },
            { $group: {
                _id: '$_id',
                title: { $first: '$title' },
                description: { $first: '$description' },
                script: { $first: '$script' },
                scenes: { $push: '$scene' },
                audioUrl: { $first: '$audioUrl' },
                facebookDescription: { $first: '$facebookDescription' },
                instagramDescription: { $first: '$instagramDescription' },
                tiktokDescription: { $first: '$tiktokDescription' },
                youtubeDescription: { $first: '$youtubeDescription' },
                createdAt: { $first: '$createdAt' },
                updatedAt: { $first: '$updatedAt' },
            }},
            { $sort: { createdAt: -1 } },
        ])
        .toArray();
};

module.exports = {
    getProjectById,
    getAllProjects,
    getSceneByGenerationId
}; 