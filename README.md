
# medical-chatbot-ui

React UI for uploading medical scan reports and interacting with an AI-powered QA chatbot.

## Setup

1. Clone this repo
2. `npm install`
3. `npm install -g @aws-amplify/cli`
4. `amplify init`
5. `amplify add storage`  # Choose Content (Images, audio, video, etc.)
6. `amplify add api`      # Choose REST, attach to Lambda chat handler
7. `amplify push`
8. `amplify add hosting`  # Choose CloudFront + S3
9. `amplify publish`

## Usage
- Visit the Amplify-hosted URL
- Upload a scan report
- Ask questions in the chat window

