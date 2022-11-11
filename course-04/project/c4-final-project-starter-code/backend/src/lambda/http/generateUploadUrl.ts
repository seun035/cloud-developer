import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger';

const logger = createLogger('createAttachmentPresignedUrl');


export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Successfully received createAttachmentPresignedUrl todo event')


    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    };

    try {
      const userId = getUserId(event)
      const todoId = event.pathParameters.todoId

      const url = await createAttachmentPresignedUrl(userId, todoId);
      logger.info('Successfully createAttachmentPresignedUrl todo')

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({uploadUrl: url})
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
