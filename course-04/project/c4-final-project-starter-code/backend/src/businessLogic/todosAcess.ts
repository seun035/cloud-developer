import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodosAccess {
    constructor(private documentClient =  new XAWS.DynamoDB.DocumentClient(), private tableName = process.env.TODOS_TABLE) {
        
    }

    async createTodo(todoItem:TodoItem): Promise<TodoItem> {
      logger.info(`Creating todo todoId: ${todoItem.todoId}`)
        this.documentClient.put({
            TableName: this.tableName,
            Item: todoItem
          }).promise();

          return todoItem
    }

    async updateTodo(userId: string, todoId: string, todoUpdate: TodoUpdate): Promise<void> {
      logger.info(`updating todo todoId: ${todoId}`)
        const params = {
            TableName: this.tableName,
            Key: {
                "todoId": todoId,
                "userId": userId,
            },
            UpdateExpression: "set name = :n, dueDate = :dd, done = :d",
            ExpressionAttributeValues: {
                ":n": todoUpdate.name,
                ":dd": todoUpdate.dueDate,
                ":d": todoUpdate.done
            }
        };
        this.documentClient.update(params).promise();
        
    }

    async getTodos(userId: string): Promise<TodoItem[]> {
      logger.info(`Get all todo by userId: ${userId}`)
        const result = await this.documentClient
        .query({
          TableName: this.tableName,
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: {
            ':userId': userId,
          }
        })
        .promise();
      const todoItems = result.Items;
      return todoItems as TodoItem[];
    }

    async getTodo(userId: string, todoId: string): Promise<TodoItem[]> {
      logger.info(`Get todo todoId: ${todoId}`)

      const result = await this.documentClient
      .query({
        TableName: this.tableName,
        KeyConditionExpression: 'userId = :userId and todoId = :todoId',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':todoId': todoId
        }
      })
      .promise();
    const todoItems = result.Items;
    return todoItems as TodoItem[];
  }

    async deleteTodo(userId: string, todoId: string): Promise<void> {
      logger.info(`delete todo todoId: ${todoId}`)
        await this.documentClient
        .delete({
          TableName: this.tableName,
          Key: { userId, todoId }
        })
        .promise();
    }

    async saveImgUrl(userId: string, todoId: string, bucketName: string): Promise<void> {
      await this.documentClient
        .update({
          TableName: this.tableName,
          Key: { userId, todoId },
          UpdateExpression: 'set attachmentUrl = :attachmentUrl',
          ExpressionAttributeValues: {
            ':attachmentUrl': `https://${bucketName}.s3.amazonaws.com/${todoId}`
          }
        })
        .promise();
    }
}