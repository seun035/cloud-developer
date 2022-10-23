import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';

const docClient = new AWS.DynamoDB.DocumentClient()
const groupsTable = process.env.GROUPS_TABLE

export const handler = async (event) => {
  console.log('Processing event: ', event)
  const itemId = uuid()

  const parsedBody = JSON.parse(event.body)

  const newItem = {
    id: itemId,
    ...parsedBody
  }

  await docClient.put({
    TableName: groupsTable,
    Item: newItem
  }).promise()

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      newItem
    })
  }
}
