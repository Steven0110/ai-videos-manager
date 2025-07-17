'use strict';

const { MongoClient, ObjectId } = require('mongodb');
const { withDatabase } = require('../utils/database');
const { success, error } = require('../utils/response');
const { getProjectById } = require('../utils/projects');

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
          imagePrompt: projectData.scenes[i].imagePrompt,
          videoPrompt: projectData.scenes[i].videoPrompt,
          imageGenerationStatus: 'pending',
          videoGenerationStatus: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const sceneResult = await db.collection('scenes').insertOne(scene);
      }

      // Fetch the complete project with scenes, images, and videos
      return await getProjectById(db, projectId);
    });
    
    return success({
      message: 'Project created successfully',
      project: createdProject,
    }, 201);
  } catch (err) {
    return error('Error creating project', err.message);
  }
};