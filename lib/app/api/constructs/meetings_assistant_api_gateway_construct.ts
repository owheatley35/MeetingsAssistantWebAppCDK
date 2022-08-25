import {Construct} from "constructs";
import {DefaultConstructProps} from "../../meetings_assistant_web_app_cdk-stack";
import {Stack} from "aws-cdk-lib";
import {Function} from "aws-cdk-lib/aws-lambda";
import {Cors, LambdaRestApi} from "aws-cdk-lib/aws-apigateway";

export interface MeetingsAssistantApiGatewayConstructProps extends DefaultConstructProps {
    readonly lambdaFunction: Function;
    readonly websiteDomain: string;
}

class MeetingsAssistantApiGatewayConstruct extends Construct {
    constructor(scope: Stack, id: string, props: MeetingsAssistantApiGatewayConstructProps) {
        super(scope, id);
        
        const api = new LambdaRestApi(this, `${props.stage.toLowerCase()}-meetings-assistant-web-app-api-gateway`, {
            handler: props.lambdaFunction,
            proxy: false,
            defaultCorsPreflightOptions: {
                allowOrigins: [props.websiteDomain],
                allowMethods: Cors.ALL_METHODS // this is also the default
            }
        });
    
        // == Add endpoints to API ==
        
        // GET /meetings - Return all meetings owned by owner
        const items = api.root.addResource('meetings');
        items.addMethod('GET');  // GET /meetings
    
        // GET /meetings/{meetingId} - Return specific meeting by meeting ID
        const item = items.addResource('{meetingId}');
        item.addMethod('GET');   // GET /meetings/{meetingId}
        
    }
}

export default MeetingsAssistantApiGatewayConstruct;
