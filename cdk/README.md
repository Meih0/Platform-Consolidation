# AWS CDK Infrastructure

This directory contains the AWS CDK infrastructure for deploying the Gov Platform Consolidation Tracker.

## Architecture

For production deployment on AWS, the recommended architecture is:

```
CloudFront → S3 (Next.js static) + API Gateway → Lambda (Next.js API routes)
                                                      ↓
                                                  DynamoDB (data)
```

## Quick Start (Local Development)

The app runs locally with SQLite for simplicity. To run:

```bash
cd ..
npm install
npm run dev
# Visit http://localhost:3000
# Click "Seed Sample Data" to populate the database
```

## AWS Deployment Options

### Option 1: SST (Recommended for POC)
Use [SST](https://sst.dev) to deploy the full Next.js app to AWS:

```bash
npx sst init
npx sst deploy
```

### Option 2: AWS Amplify
Push to GitHub and connect via AWS Amplify Console for automatic deployments.

### Option 3: CDK Stack (Below)
The `stack.ts` file defines a basic CDK stack with:
- DynamoDB tables for all entities
- Lambda function for API
- API Gateway for HTTP routing
- S3 + CloudFront for static assets

## DynamoDB Table Design

| Table | PK | SK | Purpose |
|-------|----|----|---------|
| GovTracker-Sectors | PK: `SECTOR#<id>` | SK: `METADATA` | Sector info |
| GovTracker-Entities | PK: `ENTITY#<id>` | SK: `METADATA` | Entity info |
| | PK: `SECTOR#<id>` | SK: `ENTITY#<id>` | GSI: entities by sector |
| GovTracker-Contacts | PK: `CONTACT#<id>` | SK: `METADATA` | Contact info |
| | PK: `ENTITY#<id>` | SK: `CONTACT#<id>` | GSI: contacts by entity |
| GovTracker-Platforms | PK: `PLATFORM#<id>` | SK: `METADATA` | Platform info |
| | PK: `ENTITY#<id>` | SK: `PLATFORM#<id>` | GSI: platforms by entity |
| GovTracker-Meetings | PK: `MEETING#<id>` | SK: `METADATA` | Meeting info |
| | PK: `ENTITY#<id>` | SK: `MEETING#<date>` | GSI: meetings by entity |
| GovTracker-Reminders | PK: `REMINDER#<id>` | SK: `MEETING#<id>` | Reminder info |
