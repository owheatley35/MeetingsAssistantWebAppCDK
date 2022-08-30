import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from "constructs";
import {Bucket} from "aws-cdk-lib/aws-s3";
import {MeetingsAssistantStaticWebAppStack} from "./website/meetings_assistant_static_web_app_stack";
import {StageType} from "./pipeline/StageConfigurations";
import {MeetingsAssistantAPIStack} from "./api/meetings_assistant_api_stack";

export interface DefaultConstructProps {
    readonly stage: StageType;
}

export interface DefaultStackProps extends StackProps, DefaultConstructProps {}

/**
 * Stacks created in this class are deployed through each stage of Meetings Assistant Web App Pipeline.
 **/
export class MeetingsAssistantWebAppCdkStack extends Stack {
    public readonly staticWebAppDeploymentBucket: Bucket;
    public readonly webappApiLambdaDeploymentBucket: Bucket;
    public readonly apiLambdaFunctionArn: string;
    
    constructor(scope: Construct, id: string, props: DefaultStackProps) {
        super(scope, id, props);
        
        const webAppStackName: string = `${props.stage.toLowerCase()}-meetings-assistant-static-web-app-stack`;
        const lambdaStackName: string = `${props.stage.toLowerCase()}-meetings-assistant-web-app-api-stack`;
    
        // == Stacks ==
        const staticWebAppStack: MeetingsAssistantStaticWebAppStack =
            new MeetingsAssistantStaticWebAppStack(this, webAppStackName, {
                stage: props.stage,
                stackName: webAppStackName
            });
        
        const webAppApiStack: MeetingsAssistantAPIStack =
            new MeetingsAssistantAPIStack(this, lambdaStackName, {
                stage: props.stage,
                stackName: lambdaStackName,
                websiteDomain: staticWebAppStack.websiteDomain
            })
        
        // == Variables Required by Pipeline ==
        this.staticWebAppDeploymentBucket = staticWebAppStack.websiteBucket;
        this.webappApiLambdaDeploymentBucket = webAppApiStack.lambdaDeploymentBucket;
        this.apiLambdaFunctionArn = webAppApiStack.lambdaFunctionArn;
    }
}
