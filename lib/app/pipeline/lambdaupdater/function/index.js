
exports.handler = async (event, context) => {

    let AWS = require('aws-sdk');
    let lambda = new AWS.Lambda();

    let userParams = JSON.parse(event["CodePipeline.job"].data.actionConfiguration.configuration.UserParameters);

    console.log(userParams);

    let lambdaARN = userParams.functionArn;
    let s3BucketName = userParams.s3BucketName;
    let s3ObjectKey = userParams.s3ObjectKey;

    let params = {
        FunctionName: lambdaARN,
        S3Bucket: s3BucketName,
        S3Key: s3ObjectKey,
        Publish: true,
        DryRun: true
    }

    lambda.updateFunctionCode(params, function(err, data) {
        if (err) console.log(err, err.stack);
        else console.log(data);
    });
}
