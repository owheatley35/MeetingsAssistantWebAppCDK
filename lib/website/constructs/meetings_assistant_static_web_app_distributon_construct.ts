import {Construct} from "constructs";
import {RemovalPolicy, Stack} from "aws-cdk-lib";
import {Bucket} from "aws-cdk-lib/aws-s3";
import {CloudFrontAllowedMethods, CloudFrontWebDistribution} from "aws-cdk-lib/aws-cloudfront";

export interface MeetingsAssistantStaticWebAppDistributionConstructProps {
    readonly appName: string;
}

export class MeetingsAssistantStaticWebAppDistributionConstruct extends Construct {
    
    readonly bucketName: string;
    
    constructor(parent: Stack, id: string, props: MeetingsAssistantStaticWebAppDistributionConstructProps) {
        super(parent, id);
        
        const s3Storage = new Bucket(this, `${props.appName}-static-web-app`, {
            publicReadAccess: true,
            removalPolicy: RemovalPolicy.DESTROY,
            websiteIndexDocument: "index.html"
        });
        
        const cloudfrontDistribution = new CloudFrontWebDistribution(this,
            `${props.appName}-static-web-app-cloudfront-distribution`,
            {
                enabled: true,
                originConfigs: [
                    {
                        s3OriginSource: {
                            s3BucketSource: s3Storage,
                        },
                        behaviors: [
                            {
                                allowedMethods: CloudFrontAllowedMethods.ALL
                            }
                        ]
                    }
                ]
            }
        );
        
        // Public Values
        this.bucketName = s3Storage.bucketName;
    }
}