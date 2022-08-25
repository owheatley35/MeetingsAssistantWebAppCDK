import {Construct} from "constructs";
import {Code, Function, Runtime} from "aws-cdk-lib/aws-lambda"
import {Bucket, BucketAccessControl} from "aws-cdk-lib/aws-s3";
import ConfigValues from "../../../ConfigValues";
import {DefaultConstructProps} from "../../meetings_assistant_web_app_cdk-stack";

export class MeetingsAssistantApiLambdaConstruct extends Construct {
    public readonly lambdaFunction: Function;
    public readonly lambdaDeploymentBucket: Bucket;
    
    constructor(parent: Construct, name: string, props: DefaultConstructProps) {
        super(parent, name);
    
        this.lambdaDeploymentBucket = new Bucket(this, `${props.stage.toLowerCase()}-api-lambda-deployment-bucket`, {
            publicReadAccess: false,
            accessControl: BucketAccessControl.PRIVATE,
            bucketName: `${props.stage.toLowerCase()}-api-webapp-lambda-deployment-bucket`
        });

        this.lambdaFunction = new Function(this, `${props.stage.toLowerCase()}-api-lambda-function`, {
            code: Code.fromBucket(this.lambdaDeploymentBucket, ConfigValues.LAMBDA_ZIP_NAME_WITH_EXT),
            description: "API Lambda Function for Meetings Assistant",
            handler: "lambda_handler.handle",
            runtime: Runtime.PYTHON_3_8,
        });
    }
    
}