import {Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {
    MeetingsAssistantStaticWebAppDistributionConstruct
} from "./constructs/meetings_assistant_static_web_app_distributon_construct";
import {Bucket} from "aws-cdk-lib/aws-s3";
import {StageType} from "../pipeline/StageConfigurations";

export interface MeetingsAssistantStaticWebsiteDistributionStackProps extends StackProps {
    readonly stage: StageType;
}

export class MeetingsAssistantStaticWebAppStack extends Stack {
    public readonly websiteBucket: Bucket;
    public readonly websiteDomain: string;
    
    constructor(parent: Construct, id: string, props: MeetingsAssistantStaticWebsiteDistributionStackProps) {
        super(parent, id, props);
        
        const webAppDistributionStack: MeetingsAssistantStaticWebAppDistributionConstruct =
            new MeetingsAssistantStaticWebAppDistributionConstruct(this, `${props.stage.toLowerCase()}-meetings-assistant-web-dist`, {stage: props.stage});
        
        // Public Values
        this.websiteBucket = webAppDistributionStack.bucket;
        this.websiteDomain = webAppDistributionStack.websiteDomain;
    }
}