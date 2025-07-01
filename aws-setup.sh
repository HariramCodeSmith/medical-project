#!/bin/bash
# aws-setup.sh - Create basic AWS resources for the medical chatbot UI

set -e

REGION=${AWS_REGION:-us-east-1}
PROJECT="medical-chatbot"

# Create S3 bucket for uploads
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
BUCKET_NAME="${PROJECT}-uploads-${ACCOUNT_ID}"
aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$REGION" --create-bucket-configuration LocationConstraint="$REGION"

# Create DynamoDB table for chat history
aws dynamodb create-table \
  --table-name "${PROJECT}-ChatHistory" \
  --attribute-definitions AttributeName=SessionId,AttributeType=S \
  --key-schema AttributeName=SessionId,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
  --region "$REGION"

# Create IAM role for Lambda
ROLE_NAME="${PROJECT}-lambda-role"
aws iam create-role \
  --role-name "$ROLE_NAME" \
  --assume-role-policy-document file://lambda-trust-policy.json
aws iam attach-role-policy --role-name "$ROLE_NAME" --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
aws iam attach-role-policy --role-name "$ROLE_NAME" --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
aws iam attach-role-policy --role-name "$ROLE_NAME" --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

echo "Waiting for IAM role to propagate..."
sleep 10

# Create Lambda function placeholder
aws lambda create-function \
  --function-name "${PROJECT}-handler" \
  --zip-file fileb://lambda.zip \
  --handler index.handler \
  --runtime nodejs18.x \
  --role arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME} \
  --region "$REGION"

# Create HTTP API Gateway and integrate with Lambda
API_ID=$(aws apigatewayv2 create-api \
  --name "${PROJECT}-api" \
  --protocol-type HTTP \
  --target "arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${PROJECT}-handler" \
  --region "$REGION" \
  --query ApiId --output text)

aws lambda add-permission \
  --function-name "${PROJECT}-handler" \
  --statement-id "${PROJECT}-apigw" \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*/*" \
  --region "$REGION"

ENDPOINT=$(aws apigatewayv2 get-api --api-id "$API_ID" --region "$REGION" --query ApiEndpoint --output text)

echo "Setup complete."
echo "Upload bucket: $BUCKET_NAME"
echo "API endpoint: $ENDPOINT"

