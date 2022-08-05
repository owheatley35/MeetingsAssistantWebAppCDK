import {Construct} from "constructs";
import {Stack} from "aws-cdk-lib";
import {CodePipeline, CodePipelineSource, ShellStep} from "aws-cdk-lib/pipelines";
import ConfigValues from "../../ConfigValues";

export class MeetingsAssistantWebAppPipelineConstruct extends Construct {
    constructor(parent: Stack, id: string) {
        super(parent, id);
        
        // const pipeline = new CodePipeline(this, `Code-pipeline`, {
        //     pipelineName: `Pipeline`,
        //     synth: new ShellStep('Synth', {
        //         input: CodePipelineSource.connection(ConfigValues.GITHUB_WEBAPP_REPO, 'mainline', {
        //             connectionArn: ConfigValues.GITHUB_CONNECTION_ARN
        //         }),
        //         commands: ['npm ci', 'npm run build', 'npx cdk synth']
        //     })
        // })
    }
}