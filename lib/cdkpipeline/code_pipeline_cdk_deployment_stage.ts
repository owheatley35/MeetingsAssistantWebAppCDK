import ConfigValues from "../ConfigValues";
import {Stack, Stage} from "aws-cdk-lib";
import {Construct} from "constructs";
import {MeetingsAssistantWebAppCdkStack} from "../meetings_assistant_web_app_cdk-stack";

export default class CodePipelineCDKDeploymentStage extends Stage {
    public readonly stack: Stack;
    
    constructor(scope: Construct, id: string) {
        super(scope, id);
    
        this.stack = new MeetingsAssistantWebAppCdkStack(this, 'meetings-assistant-web-app-stack', {
            terminationProtection: false,
            env: {
                account: ConfigValues.DEPLOYMENT_ACCOUNT,
                region: ConfigValues.DEPLOYMENT_REGION
            }
        });
    }
}