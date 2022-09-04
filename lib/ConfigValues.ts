import {StackProps} from "aws-cdk-lib";

export default class ConfigValues {
    // Github Config:
    static GITHUB_OWNER: string = "owheatley35";
    static GITHUB_CONNECTION_ARN: string = "arn:aws:codestar-connections:eu-west-2:276910988699:connection/10e347a2-154b-4a3a-9580-be135ae9a8e9";
    static GITHUB_CDK_REPO: string = `${ConfigValues.GITHUB_OWNER}/MeetingsAssistantWebAppCDK`;
    
    // Repos
    static GITHUB_WEBAPP_REPO: string = "meetings-assistant-static-website";
    static GITHUB_API_LAMBDA_REPO: string = "MeetingsAssistantWebAppApiLambda";
    
    // Deployment Config
    static DEPLOYMENT_REGION: string = "eu-west-2";
    static DEPLOYMENT_ACCOUNT: string = "276910988699";
    
    static GLOBAL_STACK_PROPS: StackProps = {
        terminationProtection: false,
        env: {
            account: ConfigValues.DEPLOYMENT_ACCOUNT,
            region: ConfigValues.DEPLOYMENT_REGION
        }
    }
    
    // Constants
    static APP_NAME: string = "MeetingsAssistant";
    static LAMBDA_ZIP_NAME: string = "lambda_function";
    static LAMBDA_ZIP_NAME_WITH_EXT: string = `${ConfigValues.LAMBDA_ZIP_NAME}.zip`;
    static MAINLINE: string = "mainline";
    
    // Database Credentials
    static DB_USERNAME: string = "mysqladmin";
}
