import * as AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient(); 
const imageTableName = process.env.IMAGES_TABLE;

export const handler = async (event, context) => {

    const groupId = event.pathParameters.groupId;
    const data = await dynamoDB.query({
        TableName: imageTableName,
        KeyConditionExpression: 'groupId = :groupId',
        ExpressionAttributeValues: {
            ':groupId': groupId
        },
        ScanIndexForward: false
    }).promise();
    
    const items = data.Items;

    if (items.length === 0) {
        return {
            statusCode: 404,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({items}),
        };
    }
    const response = {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({items}),
    };
    return response;
}