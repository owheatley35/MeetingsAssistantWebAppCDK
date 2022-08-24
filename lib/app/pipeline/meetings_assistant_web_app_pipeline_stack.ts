import ConfigValues from "../../ConfigValues";
import {Artifact, Pipeline, StageProps} from "aws-cdk-lib/aws-codepipeline";
import {CodeBuildAction, CodeStarConnectionsSourceAction, S3DeployAction} from "aws-cdk-lib/aws-codepipeline-actions";
import {LinuxBuildImage, PipelineProject} from "aws-cdk-lib/aws-codebuild";
import {MeetingsAssistantWebAppCdkStack} from "../meetings_assistant_web_app_cdk-stack";
import {Construct} from "constructs";
import {StageConfigurations} from "./StageConfigurations";
import Stage from "./Stage";

export class MeetingsAssistantWebAppPipelineStack extends Construct {
    constructor(parent: Construct, id: string) {
        super(parent, id);
        
        // == Artifacts == //
        const sourceOutput: Artifact = new Artifact('WebAppSourceArtifact');
        const buildOutput: Artifact = new Artifact('WebAppBuildArtifact');
        
        const stagesToDeployInOrder: Array<StageProps> = []
        
        // == Define Stages == //
        const sourceStage: StageProps = {
            stageName: "SourceStage",
            transitionToEnabled: true,
            actions:[
                new CodeStarConnectionsSourceAction({
                    actionName: 'Github-Source-Action',
                    connectionArn: ConfigValues.GITHUB_CONNECTION_ARN,
                    output: sourceOutput,
                    owner: ConfigValues.GITHUB_OWNER,
                    repo: ConfigValues.GITHUB_WEBAPP_REPO,
                    branch: 'mainline'
                })
            ]
        }
        
        const buildStage: StageProps = {
            stageName: "Build",
            transitionToEnabled: true,
            actions: [
                new CodeBuildAction({
                    actionName: "Build-Action",
                    input: sourceOutput,
                    outputs: [buildOutput],
                    project: new PipelineProject(this, 'MeetingsAssistant-WebApp-Pipeline-CodeBuild-Project', {
                        projectName: 'MeetingsAssistant-WebApp-Pipeline-CodeBuild-Project',
                        environment: {
                            buildImage: LinuxBuildImage.AMAZON_LINUX_2_4,
                            privileged: true
                        }
                    })
                })
            ]
        }
        
        stagesToDeployInOrder.push(sourceStage, buildStage);
        
        // Deploy infrastructure for each stage
        StageConfigurations.ACTIVE_STAGES.forEach((stage: Stage) => {
            
            const webAppCdkStack: MeetingsAssistantWebAppCdkStack =
                new MeetingsAssistantWebAppCdkStack(this, `${stage.stageType.toLowerCase()}-meetings-assistant-web-app`, {stage: stage.stageType})
    
            const stageToDeploy: StageProps = {
                stageName: `${stage.stageType}`,
                transitionToEnabled: true,
                actions: [
                    new S3DeployAction({
                        actionName: `${stage.stageType.toLowerCase()}-web-S3-Deploy-Action`,
                        input: buildOutput,
                        bucket: webAppCdkStack.staticWebAppDeploymentBucket,
                        extract: true
                    }),
                    ...stage.stageDeploymentActions
                ]
            }
            
            stagesToDeployInOrder.push(stageToDeploy);
        });
        
        // Define Pipeline itself. Stages are in order of deployment.
        new Pipeline(this, `Code-pipeline`, {
            pipelineName: `MeetingsAssistantWebAppStaticResPipeline`,
            crossAccountKeys: false,
            stages: stagesToDeployInOrder
        })
    }
}