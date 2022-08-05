import {Construct} from "constructs";
import {RemovalPolicy, Stack} from "aws-cdk-lib";
import {Bucket} from "aws-cdk-lib/aws-s3";
import {
    AllowedMethods,
    CloudFrontAllowedMethods,
    CloudFrontWebDistribution,
    Distribution
} from "aws-cdk-lib/aws-cloudfront";
import {S3Origin} from "aws-cdk-lib/aws-cloudfront-origins";

export interface MeetingsAssistantStaticWebAppDistributionConstructProps {
    readonly appName: string;
}

export class MeetingsAssistantStaticWebAppDistributionConstruct extends Construct {
    
    readonly bucket: Bucket;
    
    constructor(parent: Stack, id: string, props: MeetingsAssistantStaticWebAppDistributionConstructProps) {
        super(parent, id);
        
        const s3Storage = new Bucket(this, `${props.appName}-static-web-app`, {
            publicReadAccess: true,
            removalPolicy: RemovalPolicy.DESTROY,
            websiteIndexDocument: "index.html"
        });
        
        const cloudfrontDistribution = new Distribution(this,
            `${props.appName}-static-web-app-cloudfront-distribution`,
            {
                enabled: true,
                defaultBehavior: {
                    origin: new S3Origin(s3Storage),
                    allowedMethods: AllowedMethods.ALLOW_ALL
                },
                defaultRootObject: "index.html",
                enableIpv6: true,
            }
        );
        
        // Public Values
        this.bucket = s3Storage;
    }
}