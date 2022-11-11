import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger';

const logger = createLogger('createTodo');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Reciveced create todo event')
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    // TODO: Implement creating a new TODO item
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    };

    try {
      const userId = getUserId(event)
      const todo = await createTodo(userId, newTodo);

      logger.info('Successfully created todo')
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({item: todo})
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
