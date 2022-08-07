import {MeetingsAssistantWebAppCdkStack} from "../meetings_assistant_web_app_cdk-stack";
import ConfigValues from "../ConfigValues";
import {Construct} from "constructs";
import {Stage, StageProps} from "aws-cdk-lib";

export default class CodePipelineCDKDeploymentStage extends Stage {
    constructor(scope: Construct, id: string, props: StageProps) {
        super(scope, id, props);
    
        new MeetingsAssistantWebAppCdkStack(scope, 'meetings-assistant-web-app-stack', {
            terminationProtection: false,
            env: {
                account: ConfigValues.DEPLOYMENT_ACCOUNT,
                region: ConfigValues.DEPLOYMENT_REGION
            }
        });
    }
}