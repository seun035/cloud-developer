import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';

const docClient = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3({
  signatureVersion: "v4"
});
const imageTableName = process.env.IMAGES_TABLE;
const groupTableName = process.env.GROUPS_TABLE;
const bucketName = process.env.IMAGE_S3_BUCKET;
const urlExpiration = +process.env.SIGNED_URL_EXPIRATION;

export const handler = async (event) => {
  console.log('Processing event: ', event)

  const groupId = event.pathParameters.groupId;

  const items = await docClient.query({
    TableName: groupTableName,
        KeyConditionExpression: 'id = :groupId',
        ExpressionAttributeValues: {
            ':groupId': groupId
        },
        Limit: 1
  }).promise();

  if (items.Count == 0) {
    const error = "Invalid groupId";

    return {
        statusCode: 400,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({error}),
    };
  }

  const parsedBody = JSON.parse(event.body)
  const imageId = uuid();

  const url = getUploadUrl(imageId);

  const newItem = {
    groupId: groupId,
    imageId: imageId,
    timestamp: new Date().toISOString(),
    imageUrl: `https://${bucketName}.s3.amazonaws.com/${imageId}`,
    ...parsedBody
  }

  await docClient.put({
    TableName: imageTableName,
    Item: newItem
  }).promise()
  
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      newItem,
      uploardUrl: url
    })
  }
}

function getUploadUrl(imageId: String) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: urlExpiration
  })
}
