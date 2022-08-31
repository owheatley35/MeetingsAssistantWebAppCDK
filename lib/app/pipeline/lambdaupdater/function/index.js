const AWS = require("aws-sdk");

const jobSuccess = function(jobId) {
    let codepipeline = new AWS.CodePipeline();

    let params = {
        jobId: jobId
    }

    return codepipeline.putJobSuccessResult(params).promise();
}

const jobFailure = function() {
    let codepipeline = new AWS.CodePipeline();
    return codepipeline.putJobFailureResult().promise();
}

exports.handler = async (event, context) => {
    let hasFailed = false;
    let jobId = event["CodePipeline.job"].id;

    try {
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
        }

        console.log(params);

        await lambda.updateFunctionCode(params, function (err, data) {
            if (err) {
                console.log(err, err.stack);
                hasFailed = true;
            } else console.log(data);
        });

    } catch (err) {
        console.log(err);
        hasFailed = true;
    }

    if (hasFailed) {
        await jobFailure();
    } else {
        await jobSuccess(jobId);
    }
}
