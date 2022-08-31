import {Construct} from "constructs";
import {Code, Function, Runtime} from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import {Effect, Policy, PolicyStatement} from "aws-cdk-lib/aws-iam";
import {Stack} from "aws-cdk-lib";

interface LambdaUpdaterConstructProps {
    readonly lambdaARNsToBeUpdated: string[];
    readonly s3ARNsToBeUpdated: string[];
}

class LambdaUpdaterConstruct extends Stack {
    public readonly lambdaFunction: Function;
    
     constructor(scope: Construct, id: string, props: LambdaUpdaterConstructProps) {
         super(scope, id);
    
         this.lambdaFunction = new Function(this, `api-lambda-updater-function`, {
             code: Code.fromAsset(path.join(__dirname, 'function')),
             description: "Function to update API lambda code from S3 source bucket",
             handler: "index.handler",
             runtime: Runtime.NODEJS_16_X,
         });
         
         const lambdaPolicyStatement: PolicyStatement = new PolicyStatement({
             effect: Effect.ALLOW,
             actions: ['lambda:UpdateFunctionCode'],
             resources: props.lambdaARNsToBeUpdated
         });
         
         const s3BucketPolicyStatement: PolicyStatement = new PolicyStatement({
             effect: Effect.ALLOW,
             actions: ['s3:GetObject'],
             resources: props.s3ARNsToBeUpdated
         })
    
         this.lambdaFunction.role?.attachInlinePolicy(
             new Policy(this, 'update-lambda-code-policy', {
                 statements: [
                     lambdaPolicyStatement,
                     s3BucketPolicyStatement
                 ]
             }),
         );
     }
}

export default LambdaUpdaterConstruct;
