import {Construct} from "constructs";
import {Code, Function, Runtime} from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import {Effect, Policy, PolicyStatement} from "aws-cdk-lib/aws-iam";
import {Stack} from "aws-cdk-lib";

class LambdaUpdaterConstruct extends Stack {
    public readonly lambdaFunction: Function;
    
     constructor(scope: Construct, id: string) {
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
             resources: ["arn:aws:lambda:eu-west-2::*"]
         });
    
         this.lambdaFunction.role?.attachInlinePolicy(
             new Policy(this, 'update-lambda-code-policy', {
                 statements: [lambdaPolicyStatement]
             }),
         );
     }
}

export default LambdaUpdaterConstruct;
