import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from "constructs";
import {Bucket} from "aws-cdk-lib/aws-s3";
import {MeetingsAssistantStaticWebAppStack} from "./website/meetings_assistant_static_web_app_stack";
import {StageType} from "./pipeline/StageConfigurations";

export interface DefaultConstructProps {
    readonly stage: StageType;
}

export interface DefaultStackProps extends StackProps, DefaultConstructProps {}

/**
 * Stacks created in this class are deployed through each stage of Meetings Assistant Web App Pipeline.
 **/
export class MeetingsAssistantWebAppCdkStack extends Stack {
    public readonly staticWebAppDeploymentBucket: Bucket;
    
    constructor(scope: Construct, id: string, props: DefaultStackProps) {
        super(scope, id, props);
        
        const stackName = `${props.stage.toLowerCase()}-meetings-assistant-static-web-app-stack`;
    
        // == Stacks ==
        const staticWebAppStack: MeetingsAssistantStaticWebAppStack =
            new MeetingsAssistantStaticWebAppStack(this, stackName, {
                stage: props.stage,
                stackName: stackName
            });
        
        // TODO: Define API Stack Here...
        
        // == Variables Required by Pipeline ==
        this.staticWebAppDeploymentBucket = staticWebAppStack.websiteBucket;
    }
}
