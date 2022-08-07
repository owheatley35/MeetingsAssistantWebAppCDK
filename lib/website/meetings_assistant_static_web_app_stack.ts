import {Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {
    MeetingsAssistantStaticWebAppDistributionConstruct
} from "./constructs/meetings_assistant_static_web_app_distributon_construct";
import {MeetingsAssistantWebAppPipelineConstruct} from "./constructs/meetings_assistant_web_app_pipeline_construct";

export interface MeetingsAssistantStaticWebsiteDistributionStackProps extends StackProps {
    readonly appName: string;
}

export class MeetingsAssistantStaticWebAppStack extends Stack {
    constructor(parent: Construct, id: string, props: MeetingsAssistantStaticWebsiteDistributionStackProps) {
        super(parent, id, props);
        
        const webAppDistributionStack: MeetingsAssistantStaticWebAppDistributionConstruct =
            new MeetingsAssistantStaticWebAppDistributionConstruct(this, 'meetings-assistant-web-app-distribution', {appName: props.appName})
        
        const webAppPipelineStack: MeetingsAssistantWebAppPipelineConstruct =
            new MeetingsAssistantWebAppPipelineConstruct(this, 'meetings-assistant-web-app-pipeline', {s3DeploymentBucket: webAppDistributionStack.bucket})
    }
}