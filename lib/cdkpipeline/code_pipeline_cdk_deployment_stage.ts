import {Stack, Stage} from "aws-cdk-lib";
import {Construct} from "constructs";
import MeetingsAssistantWebAppPipelineContainerStack from "../app/meetings_assistant_web_app_pipeline_container_stack";

export default class CodePipelineCDKDeploymentStage extends Stage {
    public readonly stack: Stack;
    
    constructor(scope: Construct, id: string) {
        super(scope, id);
    
        this.stack = new MeetingsAssistantWebAppPipelineContainerStack(this, 'meetings-assistant-web-app-stack', {
            terminationProtection: false,
        });
    }
}