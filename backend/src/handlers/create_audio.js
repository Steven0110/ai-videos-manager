'use strict';

const { ObjectId } = require('mongodb');
const { withDatabase } = require('../utils/database');
const { success, error } = require('../utils/response');
const { getProjectById } = require('../utils/projects');
const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({ region: 'us-west-2' });
const BUCKET_NAME = 'steven-aivideos';

const elevenLabs = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY
});

module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;

    const headers = event.headers;
    const apiKey = headers['x-api-key'];

    if(apiKey !== process.env.API_KEY) {
        return error('API key inválida', 'API key inválida', 403);
    }

    const projectId = event.pathParameters.id;
    const script = JSON.parse(event.body).script;
    const voiceSettings = JSON.parse(event.body).voiceSettings;

    if (!projectId) {
        return error('Missing project ID', 'Project ID is required', 400);
    }

    if (!script) {
        return error('Missing script', 'Script is required', 400);
    }

    try {
        // Generate audio from the project script
        console.log('voiceSettings received', voiceSettings);
        const audio = await elevenLabs.textToSpeech.convert("kcQkGnn0HAT2JRDQ4Ljp", {
            text: script,
            modelId: "eleven_v3",
            voiceSettings: {
                speed: voiceSettings?.speed || 0.75,
                stability: voiceSettings?.stability || 0.5,
                similarityBoost: voiceSettings?.similarityBoost || 0.75,
                style: voiceSettings?.style || 0.9,
                useSpeakerBoost: voiceSettings?.useSpeakerBoost || true,
            }
        });

        // Convert the audio stream to a buffer
        const chunks = [];
        for await (const chunk of audio) {
            chunks.push(chunk);
        }
        const audioBuffer = Buffer.concat(chunks);

        // Generate a unique filename for the audio file
        const timestamp = new Date().getTime();
        const filename = `${projectId}_${timestamp}.mp3`;
        
        // Upload the audio to S3
        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: `audio/${filename}`,
            Body: audioBuffer,
            //ContentType: 'audio/mpeg',
            ACL: 'public-read'
        };

        await s3Client.send(new PutObjectCommand(uploadParams));
        
        // Generate the S3 URL
        const audioUrl = `https://${BUCKET_NAME}.s3.us-west-2.amazonaws.com/audio/${filename}`;
        
        // Update the project with the audio URL and fetch the complete updated project with all references
        const updatedProject = await withDatabase(async (db) => {
            // First update the project
            await db.collection('projects').updateOne(
                { _id: ObjectId.createFromHexString(projectId) },
                { $set: {
                    audioUrl: audioUrl,
                    script: script,
                    updatedAt: new Date(),
                } }
            );
            
            // Then fetch the complete updated project with scenes, images, and videos
            return await getProjectById(db, projectId);
        });

        return success({
            message: 'Audio created successfully',
            project: updatedProject
        });
    } catch (err) {
        if(err.body?.detail?.message) {
            return error(err.body?.detail?.status, err.body.detail);
        }
        return error('Error creating audio', err.message);
    }
};
