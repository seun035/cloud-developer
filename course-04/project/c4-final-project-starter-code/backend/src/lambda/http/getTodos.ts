import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getTodos as getTodosForUser } from '../../businessLogic/todos'
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger';

const logger = createLogger('getTodos');

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    //const todoId = event.pathParameters.todoId
    logger.info('Successfully received get todos event')

    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    };

    try {
      const userId = getUserId(event);
      const todos = await getTodosForUser(userId);
      logger.info('Successfully get todos')

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(todos)
      }
    } catch (error) {
      logger.error(`Error: ${error.message}`);

      return {
        statusCode: 500,
        headers,
        body: JSON.stringify(error)
      }
    }
  })

handler.use(
  cors({
    credentials: true
  })
)
