'use strict';

const { MongoClient, ObjectId } = require('mongodb');
const { withDatabase } = require('../utils/database');
const { success, error } = require('../utils/response');

const validateProject = (project) => {
  // Required fields
  const requiredFields = ['title', 'description', 'script', 'scenes'];
  for (const field of requiredFields) {
    if (!project[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Validate scenes structure
  if (!Array.isArray(project.scenes) || project.scenes.length === 0) {
    throw new Error('Scenes must be a non-empty array');
  }

  for (const scene of project.scenes) {
    const sceneRequiredFields = ['text', 'imagePrompt', 'videoPrompt'];
    for (const field of sceneRequiredFields) {
      if (!scene[field]) {
        throw new Error(`Scene is missing required field: ${field}`);
      }
    }
  }

  return true;
};

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    const projectData = JSON.parse(event.body).project;
    
    validateProject(projectData);
    
    const createdProject = await withDatabase(async (db) => {
      const project = {
        title: projectData.title,
        description: projectData.description,
        raw: projectData,
        script: projectData.script,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const projectResult = await db.collection('projects').insertOne(project);
      const projectId = projectResult.insertedId;

      for (let i = 0; i < projectData.scenes.length; i++) {
        const scene = {
          projectId: projectId,
          index: i,
          text: projectData.scenes[i].text,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const sceneResult = await db.collection('scenes').insertOne(scene);

        const image = {
          sceneId: sceneResult.insertedId,
          prompt: projectData.scenes[i].imagePrompt,
          status: 'pending',
          url: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        await db.collection('images').insertOne(image);

        const video = {
          sceneId: sceneResult.insertedId,
          prompt: projectData.scenes[i].videoPrompt,
          status: 'pending',
          url: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        await db.collection('videos').insertOne(video);
      }

      // Fetch the complete project with scenes, images, and videos
      const completeProject = await db
        .collection('projects')
        .aggregate([
          { $match: { _id: projectId } },
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
          }}
        ])
        .toArray();

      return completeProject[0];
    });
    
    return success({
      message: 'Project created successfully',
      project: createdProject,
    }, 201);
  } catch (err) {
    return error('Error creating project', err.message);
  }
};