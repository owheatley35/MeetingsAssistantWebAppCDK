import ConfigValues from "../../ConfigValues";
import {Pipeline, StageProps} from "aws-cdk-lib/aws-codepipeline";
import {MeetingsAssistantWebAppCdkStack} from "../meetings_assistant_web_app_cdk-stack";
import {Construct} from "constructs";
import {StageConfigurations, StageType} from "./StageConfigurations";
import Stage from "./Stage";
import CodeDeploymentManager, {CodeDeployment} from "./CodeDeploymentManager";
import {Bucket} from "aws-cdk-lib/aws-s3";

export class MeetingsAssistantWebAppPipelineStack extends Construct {
    constructor(parent: Construct, id: string) {
        super(parent, id);
        
        const stagesToDeployInOrder: Array<StageProps> = []
    
        // Define Deployment Buckets
        const websiteDeploymentBuckets = new Map<StageType, Bucket>();
        const lambdaDeploymentBuckets = new Map<StageType, Bucket>();
        
        // Generate Stacks to Deploy
        StageConfigurations.ACTIVE_STAGES.forEach((stage) => {
            const  meetingsAssistantStack = new MeetingsAssistantWebAppCdkStack(this, `${stage.stageType.toLowerCase()}-meetings-assistant-web-app`, {stage: stage.stageType});
            
            // Set Deployment Buckets
            websiteDeploymentBuckets.set(stage.stageType, meetingsAssistantStack.staticWebAppDeploymentBucket);
            lambdaDeploymentBuckets.set(stage.stageType, meetingsAssistantStack.webappApiLambdaDeploymentBucket);
        });
        
        // Code to deploy - if extract is false then the deployment object must be named:
        const codeDeployments: CodeDeployment[] = [
            {
                deploymentRepo: ConfigValues.GITHUB_WEBAPP_REPO,
                deploymentBuckets: websiteDeploymentBuckets,
                extract: true
            },
            {
                deploymentRepo: ConfigValues.GITHUB_API_LAMBDA_REPO,
                deploymentBuckets: lambdaDeploymentBuckets,
                extract: false,
                deploymentObjectName: ConfigValues.LAMBDA_ZIP_NAME_WITH_EXT
            }
        ]
    
        const codeDeploymentManager = new CodeDeploymentManager(this, ...codeDeployments);
        
        // == Define Stages == //
        const sourceStage: StageProps = {
            stageName: "Source",
            transitionToEnabled: true,
            actions: codeDeploymentManager.sourceActions
        }
        
        const buildStage: StageProps = {
            stageName: "Build",
            transitionToEnabled: true,
            actions: codeDeploymentManager.buildActions
        }
        
        stagesToDeployInOrder.push(sourceStage, buildStage);
        
        // Deploy infrastructure for each stage
        StageConfigurations.ACTIVE_STAGES.forEach((stage: Stage) => {
    
            const stageToDeploy: StageProps = {
                stageName: `${stage.stageType}`,
                transitionToEnabled: true,
                actions: [
                    ...codeDeploymentManager.getDeploymentActionsForStage(stage.stageType),
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
        });
    }
}