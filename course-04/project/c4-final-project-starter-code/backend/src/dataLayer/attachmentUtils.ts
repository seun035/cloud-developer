import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic

export const AttachmentUtils = (todoId: string, bucketName: string, urlExpiration: number): string => {
    const s3 = new XAWS.S3({ signatureVersion: 'v4' });
    const signedUrl = s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: todoId,
      Expires: urlExpiration
    });
    
    return signedUrl
}