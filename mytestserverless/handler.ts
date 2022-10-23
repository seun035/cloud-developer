import type { APIGatewayProxyHandler} from "aws-lambda"


export const hello: APIGatewayProxyHandler = async (event, context) => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Hello ${event.body.name}, welcome to the exciting Serverless world!"
        })
    }
}