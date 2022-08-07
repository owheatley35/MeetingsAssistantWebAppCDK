import {Stack, StackProps} from 'aws-cdk-lib';
import {MeetingsAssistantStaticWebAppStack} from "./website/meetings_assistant_static_web_app_stack";
import ConfigValues from "./ConfigValues";
import {Construct} from "constructs";

export class MeetingsAssistantWebAppCdkStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
        
        new MeetingsAssistantStaticWebAppStack(this, `${ConfigValues.APP_NAME}StaticWebAppStack`, {
            appName: ConfigValues.APP_NAME,
            ...props
        });
        
    }
}
