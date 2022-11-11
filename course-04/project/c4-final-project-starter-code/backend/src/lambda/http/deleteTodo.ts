import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger';

const logger = createLogger('deleteTodo');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Successfully received delete todo event')
    // TODO: Remove a TODO item by id
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    };

    try {
      const userId = getUserId(event)
      const todoId = event.pathParameters.todoId

      await deleteTodo(userId, todoId)
      logger.info('Successfully deleted todo')
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify('success')
      }
    } catch (error) {
      logger.info(`Error: ${error.message}`);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify(error)
      }
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
