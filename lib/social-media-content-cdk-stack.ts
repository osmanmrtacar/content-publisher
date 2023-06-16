import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as ApiGateway from 'aws-cdk-lib/aws-apigateway';
import {EndpointType} from 'aws-cdk-lib/aws-apigateway';
import * as IAM from 'aws-cdk-lib/aws-iam';
import * as Lambda from 'aws-cdk-lib/aws-lambda';
import * as StepFunctions from 'aws-cdk-lib/aws-stepfunctions';
import * as Tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';

import {NodejsFunction} from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

export class SocialMediaContentCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const discordApiGateway = new ApiGateway.RestApi(this, 'DiscordGateway', {
      restApiName: 'Discord Api Gateway',
      description: 'Welcomes discord commands',
      endpointConfiguration: {
        types: [EndpointType.REGIONAL],
      },
      deploy: true,
    });

    const lambdaRole = new IAM.Role(this, 'SocialMediaContentLambdaRole', {
      roleName: 'social-media-content-lambda-role',
      assumedBy: new IAM.ServicePrincipal('lambda.amazonaws.com'),
    });

    lambdaRole.addManagedPolicy(
      IAM.ManagedPolicy.fromAwsManagedPolicyName(
        'service-role/AWSLambdaBasicExecutionRole'
      )
    );
    lambdaRole.addManagedPolicy(
      IAM.ManagedPolicy.fromAwsManagedPolicyName(
        'service-role/AWSLambdaVPCAccessExecutionRole'
      )
    );
    lambdaRole.addManagedPolicy(
      IAM.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMReadOnlyAccess')
    );
    lambdaRole.addManagedPolicy(
      IAM.ManagedPolicy.fromAwsManagedPolicyName('AWSStepFunctionsFullAccess')
    );
    lambdaRole.addManagedPolicy(
      IAM.ManagedPolicy.fromAwsManagedPolicyName('AWSLambda_FullAccess')
    );

    const instagramPublishLambda = new NodejsFunction(
      this,
      'InstagramPublishHandler',
      {
        runtime: Lambda.Runtime.NODEJS_16_X,
        entry: path.join(__dirname, `/../lambda/instagram.ts`),
        handler: 'handler',
        environment: {
          HELLO_TABLE_NAME: '',
        },
        timeout: cdk.Duration.seconds(30),
        role: lambdaRole,
        functionName: "InstagramPublishLambda",
      }
    );

    const InstagramShare = new Tasks.LambdaInvoke(this, 'InstagramShare', {
      lambdaFunction: instagramPublishLambda,
    });

    // const definition = DiscordAuthorization.next(
    //   new StepFunctions.Choice(this, 'Is Request Authorizated?').when(
    //     StepFunctions.Condition.numberEquals('$.Payload.StatusCode', 200),
    //     InstagramShare
    //   )
    // );

    const fail = new StepFunctions.Fail(this, 'Job Failed', {
      cause: 'Share process failed',
      error: 'Platform not okay',
    });

    const definition = new StepFunctions.Choice(this, 'Which Platform')
      .when(
        StepFunctions.Condition.stringEquals('$.platform', 'instagram'),
        InstagramShare
      )
      .otherwise(fail);

    const stateMachine = new StepFunctions.StateMachine(this, 'StateMachine', {
      stateMachineName: 'SocialMedia',
      definition,
    });


    const discordAuthLambda = new NodejsFunction(this, 'DiscordAuthHandler', {
      runtime: Lambda.Runtime.NODEJS_16_X,
      functionName: "DiscordAuthLambda",
      entry: path.join(__dirname, `/../lambda/discord.ts`),
      handler: 'handler',
      environment: {
        STATE_MACHINE_ARN: stateMachine.stateMachineArn,
      },
      role: lambdaRole,
    });

    const DiscordAuthorization = new Tasks.LambdaInvoke(
      this,
      'DiscordAuthorization',
      {
        lambdaFunction: discordAuthLambda,
      }
    );

    const discordResourse = discordApiGateway.root.addResource('discord');

    const discordAuthAuthGatewayIntegration = new ApiGateway.LambdaIntegration(
      discordAuthLambda
    );

    discordResourse.addMethod('POST', discordAuthAuthGatewayIntegration, {
      apiKeyRequired: false,
    });

    new ApiGateway.UsagePlan(this, 'UsagePlan', {
      name: 'TECH | Router Usage Plan',
      apiStages: [
        {api: discordApiGateway, stage: discordApiGateway.deploymentStage},
      ],
    });
  }
}
