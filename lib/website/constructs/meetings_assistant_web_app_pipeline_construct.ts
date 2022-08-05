import {Construct} from "constructs";
import {Stack} from "aws-cdk-lib";
import ConfigValues from "../../ConfigValues";
import {Artifact, Pipeline, StageProps} from "aws-cdk-lib/aws-codepipeline";
import {CodeBuildAction, CodeStarConnectionsSourceAction, S3DeployAction} from "aws-cdk-lib/aws-codepipeline-actions";
import {LinuxBuildImage, PipelineProject} from "aws-cdk-lib/aws-codebuild";
import {Bucket} from "aws-cdk-lib/aws-s3";

export interface MeetingsAssistantWebAppPipelineConstructProps {
    readonly s3DeploymentBucket: Bucket;
}

export class MeetingsAssistantWebAppPipelineConstruct extends Construct {
    constructor(parent: Stack, id: string, props: MeetingsAssistantWebAppPipelineConstructProps) {
        super(parent, id);
        
        const sourceOutput: Artifact = new Artifact('SourceArtifact');
        const buildOutput: Artifact = new Artifact('BuildArtifact');
        
        // Define stages
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
        
        const deployStage: StageProps = {
            stageName: "Deploy",
            transitionToEnabled: true,
            actions: [
                new S3DeployAction({
                    actionName: "S3-Deploy-Action",
                    input: buildOutput,
                    bucket: props.s3DeploymentBucket,
                    extract: true
                })
            ]
        }
        
        // Define Pipeline itself.
        new Pipeline(this, `Code-pipeline`, {
            pipelineName: `MeetingsAssistantWebAppStaticResPipeline`,
            crossAccountKeys: false,
            stages: [
                sourceStage,
                buildStage,
                deployStage
            ]
        })
    }
}