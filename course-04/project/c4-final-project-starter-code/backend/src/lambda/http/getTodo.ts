import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getTodo as getTodoForUser } from '../../businessLogic/todos'
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger';

const logger = createLogger('getTodo');

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    logger.info('Successfully received get todo event')

    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    };

    try {
      const userId = getUserId(event);
      const todoId = event.pathParameters.todoId;
      
      const todo = await getTodoForUser(userId, todoId);
      logger.info('Successfully get todo')

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(todo)
      }
    } catch (error) {
        logger.info(`Error: ${error.message}`);

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
