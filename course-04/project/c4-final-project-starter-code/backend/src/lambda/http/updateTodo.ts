import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger';

const logger = createLogger('updateTodo');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Successfully received update todo event')

    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    };

    
    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object

    try {
      const userId = getUserId(event)
      const todoId = event.pathParameters.todoId
      const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
      
      await updateTodo(userId, todoId, updatedTodo);
      logger.info('Successfully updated todo')

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify('success')
      }
    } catch (error) {
      logger.error(`Error: ${error.message}`);

      return {
        statusCode: 500,
        headers,
        body: JSON.stringify(error)
      }
    }


    return undefined
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
