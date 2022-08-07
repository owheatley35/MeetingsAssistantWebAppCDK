import {Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {CodePipeline, CodePipelineSource, ShellStep} from "aws-cdk-lib/pipelines";
import ConfigValues from "./ConfigValues";
import CodePipelineCDKDeploymentStage from "./cdkpipeline/code_pipeline_cdk_deployment_stage";

export class MeetingsAssistantCDKPipelineCDKStack extends Stack {
    constructor(parent: Construct, id: string, props: StackProps) {
        super(parent, id, props);
    
        const pipeline = new CodePipeline(this, `meetings-assistant-cdk-pipeline`, {
            pipelineName: `MeetingsAssistantCDKPipeline`,
            synth: new ShellStep('Synth', {
                input: CodePipelineSource.connection(ConfigValues.GITHUB_CDK_REPO, 'mainline', {
                    connectionArn: ConfigValues.GITHUB_CONNECTION_ARN
                }),
                commands: ['npm ci', 'npm run build', 'npx cdk synth']
            })
        });
        
        // Add stage for CDK deployment of non Pipeline resources
        const cdkStage = new CodePipelineCDKDeploymentStage(parent, 'CDK-Deploy');
        pipeline.addStage(cdkStage)
    }
}