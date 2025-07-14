'use strict';

const dbConnString = process.env.DB_CONN_STRING;

module.exports.handler = async (event) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(
      {
        message: 'Hello from AI Videos Manager API: ' + dbConnString,
        input: event,
      },
      null,
      2
    ),
  };
}; 