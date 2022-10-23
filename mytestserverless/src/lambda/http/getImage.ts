import * as AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient(); 
const imageTableName = process.env.IMAGES_TABLE;
const indexName = process.env.IMAGE_ID_INDEX;

export const handler = async (event, context) => {

    const imageId = event.pathParameters.imageId;
    const data = await dynamoDB.query({
        TableName: imageTableName,
        IndexName: indexName,
        KeyConditionExpression: 'imageId = :imageId',
        ExpressionAttributeValues: {
            ':imageId': imageId
        },
        ScanIndexForward: false
    }).promise();
    
    const items = data.Items;

    if (items.length === 0) {
        const error = "item not found";

        return {
            statusCode: 404,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({error}),
        };
    }
    const response = {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({item: items[0]}),
    };
    return response;
}