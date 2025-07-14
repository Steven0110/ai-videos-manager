# AI Videos Manager - Backend

This is the serverless backend for the AI Videos Manager application.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file in the backend directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   ```

3. Run locally:
   ```
   npm start
   ```
   This will start the serverless-offline server on port 3001.

## Deployment

To deploy to AWS:

1. Configure AWS credentials:
   ```
   aws configure
   ```

2. Deploy:
   ```
   npm run deploy
   ```

## API Endpoints

- GET / - Hello World endpoint

## Project Structure

- `serverless.yml` - Serverless Framework configuration
- `src/handlers/` - Lambda function handlers
- `src/models/` - Database models
- `src/utils/` - Utility functions 