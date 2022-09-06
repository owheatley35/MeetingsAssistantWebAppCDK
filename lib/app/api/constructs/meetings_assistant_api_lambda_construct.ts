import {Construct} from "constructs";
import {Code, Function, Runtime} from "aws-cdk-lib/aws-lambda";
import {Bucket, BucketAccessControl} from "aws-cdk-lib/aws-s3";
import ConfigValues from "../../../ConfigValues";
import {DefaultConstructProps} from "../../meetings_assistant_web_app_cdk-stack";
import {Effect, Policy, PolicyStatement} from "aws-cdk-lib/aws-iam";
import {Vpc} from "aws-cdk-lib/aws-ec2";
// import {BucketDeployment, Source} from "aws-cdk-lib/aws-s3-deployment";
// import * as path from "path";

export interface MeetingsAssistantApiLambdaConstructProps extends DefaultConstructProps {
    readonly rdsArn: string;
    readonly vpc: Vpc;
    readonly databaseInformationSecretName: string;
}

export class MeetingsAssistantApiLambdaConstruct extends Construct {
    public readonly lambdaFunction: Function;
    public readonly lambdaDeploymentBucket: Bucket;
    
    constructor(parent: Construct, name: string, props: MeetingsAssistantApiLambdaConstructProps) {
        super(parent, name);
    
        this.lambdaDeploymentBucket = new Bucket(this, `${props.stage.toLowerCase()}-api-lambda-deployment-bucket`, {
            publicReadAccess: false,
            accessControl: BucketAccessControl.PRIVATE,
            bucketName: `${props.stage.toLowerCase()}-api-webapp-lambda-deployment-bucket`
        });
        
        // const bucketDeployment = new BucketDeployment(this, `${props.stage.toLowerCase()}-meetings-assistant-lambda-deploy`, {
        //     sources: [Source.asset(path.join(__dirname, 'res/lambda_function'))],
        //     destinationBucket: this.lambdaDeploymentBucket,
        //     prune: false
        // })

        this.lambdaFunction = new Function(this, `${props.stage.toLowerCase()}-api-lambda-function`, {
            code: Code.fromBucket(this.lambdaDeploymentBucket, ConfigValues.LAMBDA_ZIP_NAME_WITH_EXT),
            description: "API Lambda Function for Meetings Assistant",
            handler: "lambda_handler.handle",
            runtime: Runtime.PYTHON_3_8,
            vpc: props.vpc,
            environment: {
                databaseInformationSecretName: props.databaseInformationSecretName,
            }
        });
    
        const rdsAccessPolicy: PolicyStatement = new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                'ec2:CreateNetworkInterface',
                'ec2:DescribeNetworkInterfaces',
                'ec2:DeleteNetworkInterface',
                'ec2:DescribeSecurityGroups',
                'ec2:DescribeSubnets',
                'ec2:DescribeVpcs'
            ],
            resources: [props.rdsArn]
        });
        
        this.lambdaFunction.role?.attachInlinePolicy(
            new Policy(this, `${props.stage}-lambda-access-rds-policy`, {
                statements: [
                    rdsAccessPolicy,
                ]
            })
        );
    }
    
}