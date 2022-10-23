import * as AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient(); 
const tableName = process.env.GROUPS_TABLE;

export const handler = async (event, context) => {
    const data = await dynamoDB.scan({
        TableName: tableName
    }).promise();
    
    const items = data.Items;
    const response = {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({items}),
    };
    return response;
}