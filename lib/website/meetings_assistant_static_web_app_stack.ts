import {Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";

export interface MeetingsAssistantStaticWebsiteDistributionStackProps extends StackProps {
    readonly titleName: string;
}

export class MeetingsAssistantStaticWebAppStack extends Stack {
    constructor(parent: Construct, id: string, props: MeetingsAssistantStaticWebsiteDistributionStackProps) {
        super(parent, id);
        
    }
}