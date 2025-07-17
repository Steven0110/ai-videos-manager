'use strict';

const { withDatabase } = require('../utils/database');
const { success, error } = require('../utils/response');
const { getProjectById } = require('../utils/projects');
const { ObjectId } = require('mongodb');

const axios = require('axios');

const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY;
const LEONARDO_API_URL = process.env.LEONARDO_API_URL;

const fluxSchnellModelId = '1dd50843-d653-4516-a8e3-f0238ee453ff';
const lucidRealismModelId = '05ce0082-2d80-4a2d-8653-4d1c85e2418e';
const styleId = '111dc692-d470-4eec-b791-3475abac4c46'; // Dynamic Style

const leonardoApi = axios.create({
    baseURL: LEONARDO_API_URL,
    headers: {
        'Authorization': `Bearer ${LEONARDO_API_KEY}`
    }
});

module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;

    const projectId = event.pathParameters.id;
    const scenes = JSON.parse(event.body).scenes;

    if (!projectId) {
        return error('Missing project ID', 'Project ID is required', 400);
    }

    if(!scenes) {
        return error('Missing scenes', 'Scenes are required', 400);
    }

    let errors = []
    let updatedProject;

    try {
        // Update project's images with the requested status images
        updatedProject = await withDatabase(async (db) => {

            for(const scene of scenes) {
                if(!scene.imagePrompt) {
                    errors.push(`Scene ${scene.index} has no image prompt`);
                    continue;
                }

                // Generate images with Leonardo.AI API
                const response = await leonardoApi.post(`/generations`, {
                    modelId: fluxSchnellModelId,
                    contrast: 3.5,
                    presetStyle: 'DYNAMIC',
                    prompt: scene.imagePrompt,
                    num_images: 1, //2,
                    width: 664,
                    height: 1184,
                    enhancePrompt: false,
                    public: false,
                    ultra: false,
                });

                console.log('Leonardo response:');
                console.log(JSON.stringify(response.data, null, 2));

                if (!response.data.sdGenerationJob?.generationId) {
                    errors.push(`Error creating image/s for scene ${scene.index}: ${JSON.stringify(response.data)}`);
                    continue;
                }

                await db.collection('scenes').updateOne(
                    { _id: ObjectId.createFromHexString(scene._id) },
                    { $set: {
                        generationId: response.data.sdGenerationJob.generationId,
                        imagePrompt: scene.imagePrompt,
                        imageGenerationStatus: 'requested',
                        updatedAt: new Date()
                    }}
                );
            }

            // Return the updated project with all scenes
            return await getProjectById(db, projectId);
        });


        if(errors.length > 0) {
            return success({
                message: 'Image/s creation requested with errors',
                errors: errors,
                project: updatedProject
            });
        } else {
            return success({
                message: 'Image/s creation requested successfully',
                project: updatedProject
            });
        }

    } catch (err) {
        return error(err.message || 'Error creating image/s', err);
    }
    
}