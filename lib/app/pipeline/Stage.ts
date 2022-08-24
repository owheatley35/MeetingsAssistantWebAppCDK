import {IAction} from "aws-cdk-lib/aws-codepipeline";
import {StageType} from "./StageConfigurations";

class Stage {
    public readonly stageType: StageType;
    public readonly stageDeploymentActions: IAction[];
    
    constructor(stage: StageType, ...deploymentActions: IAction[]) {
        this.stageType = stage;
        this.stageDeploymentActions = deploymentActions;
    }
}

export default Stage;
