'use strict';

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
    
    const projectId = await withDatabase(async (db) => {
      const project = {
        title: projectData.title,
        description: projectData.description,
        raw: projectData,
        script: projectData.script,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const projectResult = await db.collection('projects').insertOne(project);

      for (let i = 0; i < projectData.scenes.length; i++) {
        const scene = {
          projectId: projectResult.insertedId,
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

        const imageResult = await db.collection('images').insertOne(image);

        const video = {
          sceneId: sceneResult.insertedId,
          prompt: projectData.scenes[i].videoPrompt,
          status: 'pending',
          url: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const videoResult = await db.collection('videos').insertOne(video);
      }

      return projectResult.insertedId;
    });
    
    return success({
      message: 'Project created successfully',
      projectId: projectId,
    }, 201);
  } catch (err) {
    return error('Error creating project', err.message);
  }
};