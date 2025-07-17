'use strict';

const { success, error } = require('../utils/response');
const { getSceneByGenerationId } = require('../utils/projects');
const { withDatabase } = require('../utils/database');

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({ region: 'us-west-2' });
const BUCKET_NAME = 'steven-aivideos';


module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;

    console.log('Leonardo webhook received:', event.body);

    let body;
    try {
        body = JSON.parse(event.body);
    } catch (parseError) {
        console.error('Failed to parse request body:', parseError);
        return error('Invalid body', 'Failed to parse JSON body', 400);
    }
    
    // Handle the actual Leonardo webhook structure
    if (body.type !== 'image_generation.complete') {
        console.error('Unexpected webhook type:', body.type);
        return error('Invalid webhook', 'Unexpected webhook type', 400);
    }

    if (!body.data || !body.data.object) {
        console.error('Missing expected data structure in webhook payload');
        return error('Invalid body', 'Expected data structure not found', 400);
    }

    const generationData = body.data.object;
    
    if (!generationData.images || !generationData.images.length) {
        console.error('No images found in generation data');
        return error('Invalid body', 'No images found in generation data', 400);
    }

    try {
        await withDatabase(async (db) => {
            const scene = await getSceneByGenerationId(db, generationData.id);
            
            if (!scene) {
                console.error(`Scene not found for generation ID: ${generationData.id}`);
                throw new Error(`Scene not found for generation ID: ${generationData.id}`);
            }

            console.log(`Scene found for generation ID ${generationData.id}:`, scene);

            for(const image of generationData.images) {
                try {
                    const dbImage = {
                        url: image.url,
                        createdAt: new Date(),
                        id: image.id,
                        sceneId: scene._id,
                    }

                    await db.collection('images').insertOne(dbImage);
                } catch (err) {
                    console.error('Failed to save image:', image.id, err);
                }
            }

            await db.collection('scenes').updateOne(
                { _id: scene._id },
                { $set: { 
                    imageGenerationStatus: 'completed',
                    updatedAt: new Date()
                }}
            );
        });

        return success({
            message: 'Webhook received successfully',
        });
    } catch (err) {
        console.error('Error processing webhook:', err);
        console.error('Error stack:', err.stack);
        return error(err.message || 'Error processing webhook', err);
    }
}