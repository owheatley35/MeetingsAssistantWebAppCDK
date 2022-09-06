import {Construct} from "constructs";
import {DefaultConstructProps} from "../../../meetings_assistant_web_app_cdk-stack";
import {
    InstanceClass,
    InstanceSize,
    InstanceType,
    SecurityGroup,
    SubnetType,
    Vpc
} from "aws-cdk-lib/aws-ec2";
import {
    Credentials,
    DatabaseInstance,
    DatabaseInstanceEngine,
    DatabaseInstanceProps,
    MysqlEngineVersion,
} from "aws-cdk-lib/aws-rds";
import {Secret} from "aws-cdk-lib/aws-secretsmanager";
import ConfigValues from "../../../../ConfigValues";

class MeetingsAssistantDatabaseConstruct extends Construct {
    readonly rdsDBInstance: DatabaseInstance;
    readonly credentialsSecretName: string;
    readonly vpc: Vpc;
    
    constructor(scope: Construct, id: string, props: DefaultConstructProps) {
        super(scope, id);
    
        // Create VPC and Security Group - failed
        // const vpc = Vpc.fromLookup(this,`DEFAULT-VPC-${props.stage}`, {isDefault: true});
        //
        // const privateSubnet = new PrivateSubnet(this, `${props.stage.toLowerCase()}-private-subnet`, {
        //     availabilityZone: vpc.availabilityZones[0],
        //     cidrBlock: vpc.vpcCidrBlock,
        //     vpcId: vpc.vpcId,
        //
        //     // the properties below are optional
        //     mapPublicIpOnLaunch: false,
        // });
        //
        // const subnetGroup = new SubnetGroup(this, `${props.stage}-subnet-group`, {
        //     description: `${props.stage} VPC Subnet Group`,
        //     vpc: vpc,
        //     removalPolicy: RemovalPolicy.DESTROY,
        //     subnetGroupName: `${props.stage}-subnet-group`,
        //     vpcSubnets: {
        //         availabilityZones: vpc.availabilityZones,
        //         onePerAz: false,
        //         subnetFilters: [SubnetFilter.availabilityZones(vpc.availabilityZones)],
        //         subnetGroupName: `${props.stage}-subnet-group`,
        //         subnetType: SubnetType.PRIVATE_ISOLATED,
        //     },
        // });
    
        // Configure VPC
        const vpc = new Vpc(this, `${props.stage}-vpc`, {
            cidr: '10.0.0.0/16',
            natGateways: 1,
            maxAzs: 3,
            subnetConfiguration: [
                {
                    name: 'private-subnet-1',
                    subnetType: SubnetType.PRIVATE_WITH_NAT,
                    cidrMask: 24,
                },
                {
                    name: 'public-subnet-1',
                    subnetType: SubnetType.PUBLIC,
                    cidrMask: 24,
                },
                {
                    name: 'isolated-subnet-1',
                    subnetType: SubnetType.PRIVATE_ISOLATED,
                    cidrMask: 28,
                },
            ],
        });
    
        const securityGroup = [
            new SecurityGroup(this, `vpc-security-group-${props.stage}`, {vpc})
        ];
    
        // Generate Secret for DB Credentials
        const databaseCredentialsSecret = new Secret(this, `${props.stage}-DBCredentialsSecret`, {
            secretName: `${props.stage}-db-credentials`,
            generateSecretString: {
                secretStringTemplate: JSON.stringify({
                    username: ConfigValues.DB_USERNAME,
                }),
                excludePunctuation: true,
                includeSpace: false,
                generateStringKey: 'password'
            }
        });
    
        // Define Database Configuration
        const rdsConfig: DatabaseInstanceProps = {
            engine: DatabaseInstanceEngine.mysql({ version: MysqlEngineVersion.VER_8_0_28 }),
            instanceType: InstanceType.of(InstanceClass.BURSTABLE2, InstanceSize.SMALL),
            vpc: vpc,
            instanceIdentifier: `${props.stage}`,
            maxAllocatedStorage: 200,
            securityGroups: securityGroup,
            credentials: Credentials.fromSecret(databaseCredentialsSecret), // Get both username and password from existing secret
        }
        
        // Export values
        this.credentialsSecretName = databaseCredentialsSecret.secretName;
        this.rdsDBInstance = new DatabaseInstance(this, `${props?.stage}-instance`, rdsConfig);
        this.vpc = vpc;
    }
}

export default MeetingsAssistantDatabaseConstruct;
