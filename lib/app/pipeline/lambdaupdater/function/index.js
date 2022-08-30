import {LambdaClient, UpdateFunctionCodeCommand} from "@aws-sdk/client-lambda"

exports.handler = async (event, context) => {

    let isWaiting = true;

    setTimeout(() => {
        isWaiting = false
    }, 10000);

    while(isWaiting) {}

    let userParams = event["CodePipeline.job"].data.actionConfiguration.configuration.UserParameters;
    let lambdaARN = userParams["functionArn"];
    let s3BucketName = userParams["s3BucketName"];
    let s3ObjectKey = userParams["s3ObjectKey"];

    let lambdaClientConfiguration = {
        region: "eu-west-2"
    }

    let updateFunctionCodeConfiguration = {
        FunctionName: lambdaARN,
        S3Bucket: s3BucketName,
        S3Key: s3ObjectKey,
        Publish: true,
        DryRun: true
    }

    const client = new LambdaClient(lambdaClientConfiguration);
    const command = new UpdateFunctionCodeCommand(updateFunctionCodeConfiguration);
    await client.send(command);
}
