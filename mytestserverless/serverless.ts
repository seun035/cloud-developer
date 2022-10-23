import type { AWS } from '@serverless/typescript';

//import hello from '@functions/hello';

const serverlessConfiguration: AWS = {
  service: 'mytestserverless',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    stage: "${opt:stage, 'dev'}",
    region: 'us-east-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      GROUPS_TABLE: "Groups-${self:provider.stage}",
      IMAGES_TABLE: "Images-${self:provider.stage}",
      IMAGE_ID_INDEX: "ImageIdIndex",
      IMAGE_S3_BUCKET: "mytestserverless-images-${self:provider.stage}",
      SIGNED_URL_EXPIRATION: "300"
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: [
          "dynamodb:scan",
          "dynamodb:PutItem",
          "dynamodb:Query"
        ],
        Resource: ["arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.GROUPS_TABLE}",
        "arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.IMAGES_TABLE}",
        "arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.IMAGES_TABLE}/index/${self:provider.environment.IMAGE_ID_INDEX}"
      ]
      },
      {
        Effect: "Allow",
        Action: [
          "s3:putObject",
        ],
        Resource: ["arn:aws:s3:::${self:provider.environment.IMAGE_S3_BUCKET}/*",
      ]
      }
    ]
  },
  // import the function via paths
  functions: { 
    // myhello: {
    //   handler: 'handler.hello',
    //   events: [
    //     {
    //       http:{
    //         method: 'get',
    //         path: 'hello'
    //       }
    //     }
    //   ]
    // },
    getGroups: {
      handler: 'src/lambda/http/getGroups.handler',
      events: [
        {
          http:{
            method: 'get',
            path: 'groups',
            cors: true
          }
        }
      ]
    },
    createGroup: {
      handler: 'src/lambda/http/createGroup.handler',
      events: [
        {
          http: {
            method: 'post',
            path: 'create',
            cors: true,
            request: {
              schemas: {
                "application/json": "${file(models/create-group-schema.json)}"
              }
            }
          }
        }
      ]
    },
    getImages: {
      handler: 'src/lambda/http/getImages.handler',
      events: [
        {
          http: {
            method: 'get',
            path: 'groups/{groupId}/images',
            cors: true
          }
        }
      ]
    },
    getImage: {
      handler: 'src/lambda/http/getImage.handler',
      events: [
        {
          http: {
            method: 'get',
            path: 'images/{imageId}',
            cors: true
          }
        }
      ]
    },
    createImage: {
      handler: 'src/lambda/http/createImage.handler',
      events: [
        {
          http: {
            method: 'post',
            path: 'group/{groupId}/image',
            cors: true
          }
        }
      ]
    }
  },
  resources: {
    Resources: {
      GroupDynamoDBTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          AttributeDefinitions: [
            {
              AttributeName: "id",
              AttributeType: "S"
            }
          ],
          KeySchema: [
            {
              AttributeName: "id",
              KeyType: "HASH"
            }
          ],
          BillingMode: "PAY_PER_REQUEST",
          TableName: "${self:provider.environment.GROUPS_TABLE}"
        }
      },
      ImageDynamoDBTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          AttributeDefinitions: [
            {
              AttributeName : "groupId",
              AttributeType : "S"
            },
            {
              AttributeName : "timestamp",
              AttributeType : "S"
            },
            {
              AttributeName : "imageId",
              AttributeType : "S"
            }
          ],
          KeySchema: [
            {
              AttributeName : "groupId",
              KeyType: "HASH"
            },
            {
              AttributeName : "timestamp",
              KeyType: "RANGE"
            }
          ],
          BillingMode: "PAY_PER_REQUEST",
          TableName: "${self:provider.environment.IMAGES_TABLE}",
          GlobalSecondaryIndexes: [
            {
              IndexName : "${self:provider.environment.IMAGE_ID_INDEX}",
              KeySchema : [ 
                {
                  AttributeName : "imageId",
                  KeyType: "HASH"
                },
              ],
              Projection : {
                ProjectionType : "ALL"
              },
            }
          ]
        }
      },
      AttachmentBucket:{
        Type: "AWS::S3::Bucket",
        Properties: {
          BucketName: "${self:provider.environment.IMAGE_S3_BUCKET}",
          CorsConfiguration: {
            CorsRules: [
              {
                AllowedHeaders : [ '*'],
                AllowedMethods : [
                  'GET', 'POST', 'DELETE', 'PUT', 'HEAD'
                ],
                AllowedOrigins : ['*'],
                "MaxAge" : 3000
              }
            ]
          }
        }
      },
      BucketPolicy: {
        "Type" : "AWS::S3::BucketPolicy",
        "Properties" : {
            "Bucket" : {
              Ref: "AttachmentBucket"
            },
            "PolicyDocument" : {
              Version: "2012-10-17",
              Statement: [
                {
                Action: ["s3:GetObject"],
                Effect: "Allow",
                Principal: "*",
                Resource: "arn:aws:s3:::${self:provider.environment.IMAGE_S3_BUCKET}/*"
            }]
            }
          }
      }
    }
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
