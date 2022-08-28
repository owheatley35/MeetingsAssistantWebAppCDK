import {Construct} from "constructs";
import {DefaultConstructProps} from "../../meetings_assistant_web_app_cdk-stack";
import {Stack} from "aws-cdk-lib";
import {Function} from "aws-cdk-lib/aws-lambda";
import {Cors, HttpIntegration, LambdaRestApi, TokenAuthorizer} from "aws-cdk-lib/aws-apigateway";

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
            },
        });
    
        // Secure the API through a JWT from Auth0
        // const issuer = 'https://oliwheatley.eu.auth0.com/'
        // const authorizer = new TokenAuthorizer(this, `${props.stage}-meetings-assistant-token-auth`, {
        //
        // });
    
        // == Add endpoints to API ==
        
        // GET /meetings - Return all meetings owned by owner
        const items = api.root.addResource('meetings');
        items.addMethod('GET', new HttpIntegration(''));
        
        //     {
        //     authorizer: authorizer
        // });
    
        // GET /meetings/{meetingId} - Return specific meeting by meeting ID
        const item = items.addResource('{meetingId}');
        item.addMethod('GET');
        
    }
}

export default MeetingsAssistantApiGatewayConstruct;
