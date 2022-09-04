import {Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {StageType} from "../pipeline/StageConfigurations";
import {MeetingsAssistantApiLambdaConstruct} from "./constructs/meetings_assistant_api_lambda_construct";
import MeetingsAssistantApiGatewayConstruct from "./constructs/meetings_assistant_api_gateway_construct";
import {Bucket} from "aws-cdk-lib/aws-s3";
import MeetingsAssistantDatabaseConstruct from "./constructs/database/meetings_assistant_database_construct";

export interface MeetingsAssistantAPIStackProps extends StackProps {
    readonly stage: StageType;
    readonly websiteDomain: string;
}

export class MeetingsAssistantAPIStack extends Stack {
    public readonly lambdaDeploymentBucket: Bucket;
    public readonly lambdaFunctionArn: string;
    
    constructor(parent: Construct, id: string, props: MeetingsAssistantAPIStackProps) {
        super(parent, id, props);
        
        const rdsConstruct = new MeetingsAssistantDatabaseConstruct(this, `${props.stage.toLowerCase()}-meetings-assistant-rds-db`, props)
        
        const lambdaConstruct = new MeetingsAssistantApiLambdaConstruct(this, `${props.stage.toLowerCase()}-meetings-assistant-api-lambda-construct`, {
            rdsArn: rdsConstruct.rdsDBInstance.instanceArn,
            vpc: rdsConstruct.vpc,
            ...props
        });
        
        const apiGatewayConstruct = new MeetingsAssistantApiGatewayConstruct(this, `${props.stage.toLowerCase()}-meetings-assistant-api-gateway-construct`, {
            lambdaFunction: lambdaConstruct.lambdaFunction,
            websiteDomain: props.websiteDomain,
            stage: props.stage
        });
        
        // Public Values
        this.lambdaDeploymentBucket = lambdaConstruct.lambdaDeploymentBucket;
        this.lambdaFunctionArn = lambdaConstruct.lambdaFunction.functionArn;
    }
}