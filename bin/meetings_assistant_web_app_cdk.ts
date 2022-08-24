#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {MeetingsAssistantCDKPipelineCDKStack} from "../lib/cdkpipeline/meetings_assistant_cdk_pipeline_cdk_stack";
import ConfigValues from "../lib/ConfigValues";

const app = new cdk.App();

new MeetingsAssistantCDKPipelineCDKStack(app, 'meetings-assistant-cdk-pipeline-cdk-stack', {
    env: {
        account: ConfigValues.DEPLOYMENT_ACCOUNT,
        region: ConfigValues.DEPLOYMENT_REGION
    }
});

app.synth();
