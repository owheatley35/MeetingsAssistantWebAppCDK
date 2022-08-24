import {Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {MeetingsAssistantWebAppPipelineStack} from "./pipeline/meetings_assistant_web_app_pipeline_stack";

export default class MeetingsAssistantWebAppPipelineContainerStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
        
        // Pipeline Defines all resources
        new MeetingsAssistantWebAppPipelineStack(this, 'meetings-assistant-web-app-pipeline-stack');
    }
}