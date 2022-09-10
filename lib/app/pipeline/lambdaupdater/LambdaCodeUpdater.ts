import {Construct} from "constructs";
import {StageType} from "../StageConfigurations";
import LambdaUpdaterConstruct from "./lambda_updater_construct";
import {Function} from "aws-cdk-lib/aws-lambda";
import {IAction} from "aws-cdk-lib/aws-codepipeline";
import {LambdaInvokeAction} from "aws-cdk-lib/aws-codepipeline-actions";

export interface LambdaCodeUpdaterConfiguration {
    readonly functionArn: string;
    readonly bucketName: string;
    readonly s3ObjectName: string;
}

export interface LambdaCodeUpdaterProps {
    readonly codeToUpdatePerStage: Map<StageType, LambdaCodeUpdaterConfiguration[]>
}

class LambdaCodeUpdater {
    private readonly lambdaFunction: Function;
    private readonly codeToUpdatePerStage: Map<StageType, LambdaCodeUpdaterConfiguration[]>;
    
    constructor(scope: Construct, props: LambdaCodeUpdaterProps) {
        
        // Gather lambda ARNs for access to update
        const lambdaARNs: string[] = [];
        const s3ARNs: string[] = [];
        props.codeToUpdatePerStage.forEach((updaterConfig) => {
            updaterConfig.forEach((config) => {
                lambdaARNs.push(config.functionArn);
                s3ARNs.push(`arn:aws:s3:::${config.bucketName}/${config.s3ObjectName}`);
            })
        });
        
        // Create Lambda Function infrastructure
        const lambdaUpdaterInfra = new LambdaUpdaterConstruct(scope, 'lambda-updater', {
            lambdaARNsToBeUpdated: lambdaARNs,
            s3ARNsToBeUpdated: s3ARNs,
        });
        
        this.lambdaFunction = lambdaUpdaterInfra.lambdaFunction;
        this.codeToUpdatePerStage = props.codeToUpdatePerStage;
    }
    
    public generateUpdaterInvokeActionsForStage(stage: StageType): IAction[] {
        const updaterConfigurations: LambdaCodeUpdaterConfiguration[] = this.codeToUpdatePerStage.get(stage)!;
        const deploymentActions: IAction[] = [];
        
        updaterConfigurations.forEach((configuration) => {
            deploymentActions.push(this.createLambdaInvokeAction(configuration));
        });
        
        return deploymentActions;
    }
    
    private createLambdaInvokeAction(config: LambdaCodeUpdaterConfiguration): IAction {
        return new LambdaInvokeAction({
            actionName: `${config.bucketName}-update-lambda-action`,
            lambda: this.lambdaFunction,
            userParameters: {
                functionArn: config.functionArn,
                s3BucketName: config.bucketName,
                s3ObjectKey: config.s3ObjectName
            },
            runOrder: 2
        });
    }
}

export default LambdaCodeUpdater;
