import {Artifact, IAction} from "aws-cdk-lib/aws-codepipeline";
import {CodeBuildAction, CodeStarConnectionsSourceAction, S3DeployAction} from "aws-cdk-lib/aws-codepipeline-actions";
import ConfigValues from "../../ConfigValues";
import {Bucket} from "aws-cdk-lib/aws-s3";
import {LinuxBuildImage, PipelineProject} from "aws-cdk-lib/aws-codebuild";
import {Construct} from "constructs";
import {StageConfigurations, StageType} from "./StageConfigurations";

export interface CodeDeployment {
    readonly deploymentRepo: string;
    readonly deploymentBuckets?: Map<StageType, Bucket>;
    readonly extract: boolean;
    readonly deploymentObjectName?: string;
}

class CodeDeploymentManager {
    private readonly codeDeployments: CodeDeployment[];
    public readonly sourceActions: CodeStarConnectionsSourceAction[] = [];
    public readonly buildActions: CodeBuildAction[] = [];
    private readonly deploymentActionsMap = new Map<string, IAction[]>();
    
    constructor(scope: Construct, ...codeDeployment: CodeDeployment[]) {
        this.codeDeployments = codeDeployment;
        
        const pipelineProject: PipelineProject = new PipelineProject(scope, 'MeetingsAssistant-WebApp-Pipeline-CodeBuild-Project', {
            environment: {
                buildImage: LinuxBuildImage.AMAZON_LINUX_2_4,
                privileged: true
            }
        });
    
        this.codeDeployments.forEach((deployment) => {
            
            const sourceOut = new Artifact(`${deployment.deploymentRepo.toLowerCase()}-source-artifact`);
            const buildOut = new Artifact(`${deployment.deploymentRepo.toLowerCase()}-build-artifact`);
            
            this.sourceActions.push(new CodeStarConnectionsSourceAction({
                actionName: `${deployment.deploymentRepo}-source-action`,
                connectionArn: ConfigValues.GITHUB_CONNECTION_ARN,
                output: sourceOut,
                owner: ConfigValues.GITHUB_OWNER,
                repo: deployment.deploymentRepo,
                branch: ConfigValues.MAINLINE
            }));
            
            this.buildActions.push(new CodeBuildAction({
                    actionName: `${deployment.deploymentRepo}-build-action`,
                    input: sourceOut,
                    outputs: [buildOut],
                    project: pipelineProject
                })
            );
            
            // Generate S3 Deployment Actions for each stage (If required)
            if (!(deployment.deploymentBuckets === undefined)) {
                StageConfigurations.ACTIVE_STAGES.forEach((stage) => {
                    
                    const stageName: string = stage.stageType;
                    let existingActions: IAction[] = (this.deploymentActionsMap.has(stageName)) ? this.deploymentActionsMap.get(stageName)! : new Array<IAction>();
                    
                    let s3DeploymentAction: S3DeployAction;
                    
                    if (deployment.deploymentObjectName) {
                        s3DeploymentAction = new S3DeployAction({
                            actionName: `${stage.stageType.toLowerCase()}-${deployment.deploymentRepo}-S3-Deploy-Action`,
                            input: buildOut,
                            bucket: deployment.deploymentBuckets!.get(stage.stageType)!,
                            extract: deployment.extract,
                            objectKey:deployment.deploymentObjectName,
                            runOrder: 1
                        })
                    } else {
                        s3DeploymentAction = new S3DeployAction({
                            actionName: `${stage.stageType.toLowerCase()}-${deployment.deploymentRepo}-S3-Deploy-Action`,
                            input: buildOut,
                            bucket: deployment.deploymentBuckets!.get(stage.stageType)!,
                            extract: deployment.extract,
                            runOrder: 1
                        })
                    }
        
                    existingActions.push(s3DeploymentAction);
                    this.deploymentActionsMap.set(stage.stageType, existingActions);
                });
            }
        });
    }
    
    public getDeploymentActionsForStage(stage: StageType): IAction[] {
        
        if (!this.deploymentActionsMap.has(stage)) {
            return []
        }
        
        return this.deploymentActionsMap.get(stage)!;
    }
}

export default CodeDeploymentManager;
