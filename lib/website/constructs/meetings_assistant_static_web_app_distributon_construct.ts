import {Construct} from "constructs";
import {RemovalPolicy, Stack} from "aws-cdk-lib";
import {Bucket, BucketAccessControl} from "aws-cdk-lib/aws-s3";
import {AllowedMethods, Distribution, OriginAccessIdentity} from "aws-cdk-lib/aws-cloudfront";
import {S3Origin} from "aws-cdk-lib/aws-cloudfront-origins";

export interface MeetingsAssistantStaticWebAppDistributionConstructProps {
    readonly appName: string;
}

export class MeetingsAssistantStaticWebAppDistributionConstruct extends Construct {
    
    readonly bucket: Bucket;
    
    constructor(parent: Stack, id: string, props: MeetingsAssistantStaticWebAppDistributionConstructProps) {
        super(parent, id);
        
        // S3 Bucket for Static Web Resources
        const s3Storage = new Bucket(this, `${props.appName}-static-web-app`, {
            removalPolicy: RemovalPolicy.DESTROY,
            accessControl: BucketAccessControl.PRIVATE
        });
        
        // Grant CloudFront Access to the S3 Bucket
        const originAccessIdentity: OriginAccessIdentity = new OriginAccessIdentity(this, 'cloudfront-origin-access', {
            comment: "To grant access to website",
        });
        s3Storage.grantRead(originAccessIdentity);
        
        // Create Cloudfront distribution
        const cloudfrontDistribution = new Distribution(this,
            `${props.appName}-static-web-app-cloudfront-distribution`,
            {
                enabled: true,
                defaultBehavior: {
                    origin: new S3Origin(s3Storage, {
                        originAccessIdentity: originAccessIdentity
                    }),
                    allowedMethods: AllowedMethods.ALLOW_ALL,
                },
                errorResponses:[
                    {
                        httpStatus: 404,
                        responseHttpStatus: 200,
                        responsePagePath: '/index.html'
                    }
                ],
                defaultRootObject: "index.html",
                enableIpv6: true,
            }
        );
        
        // Public Values
        this.bucket = s3Storage;
    }
}