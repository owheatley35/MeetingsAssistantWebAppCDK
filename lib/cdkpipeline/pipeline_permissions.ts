import {Effect, PolicyDocument, PolicyStatement, Role, ServicePrincipal} from "aws-cdk-lib/aws-iam";
import {Construct} from "constructs";

export const PIPELINE_POLICY = new PolicyStatement({
    effect: Effect.ALLOW,
    actions: [
        's3:PutObject',
        's3:PutObjectAcl',
        's3:CreateBucket',
        's3:GetBucketPolicy',
        's3:PutBucketPolicy',
    ],
    resources: ['*']
});


class CodePipelineIAMRoleFactory {
    private readonly actions: string[];
    private readonly scope: Construct;
    
    constructor(scope: Construct) {
        this.scope = scope;
        this.actions = [
            's3:PutObject',
            's3:PutObjectAcl',
            's3:CreateBucket',
            's3:GetBucketPolicy',
            's3:PutBucketPolicy',
        ]
    }
    
    public createRole(pipelineName: string, pipelineARN: string): Role {
        
        const resource: string[] = [pipelineARN];
    
        const policyDocument = new PolicyDocument({
            statements:  [
                new PolicyStatement({
                    effect: Effect.ALLOW,
                    actions: this.actions,
                    resources: resource
                })
            ]
        });
        
        return new Role(this.scope, `${pipelineName}-pipeline-role`, {
            assumedBy: new ServicePrincipal('codepipeline.amazonaws.com'),
            description: 'Role to give permissions to codepipeline',
            inlinePolicies: {
               CodePipelinePolicy: policyDocument
            }
        });
    }
}

export default CodePipelineIAMRoleFactory;
