'use strict';

module.exports.handler = async (event) => {
  const dbConnString = process.env.DB_CONN_STRING;
  
  return {
    statusCode: 200,
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