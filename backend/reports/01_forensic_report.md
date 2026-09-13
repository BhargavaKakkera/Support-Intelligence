# Data Quality & Forensic Analysis Report
**Total rows:** 2,811,774
**Total columns:** 7
**Columns:** tweet_id, author_id, inbound, created_at, text, response_tweet_id, in_response_to_tweet_id

## Missing Values
- response_tweet_id: 1,040,629 (37.01%)
- in_response_to_tweet_id: 794,335 (28.25%)

## Data Types & Identifiers
- Unique tweet IDs: 2,811,774
- Unique authors: 702,777

## Directionality
- Inbound (Customer) messages: 1,537,843 (54.69%)
- Outbound (Brand) messages: 1,273,931 (45.31%)

## Brands
- Total unique brands: 108
- Top 10 brands by response volume:

  - AmazonHelp: 169,840
  - AppleSupport: 106,860
  - Uber_Support: 56,270
  - SpotifyCares: 43,265
  - Delta: 42,253
  - Tesco: 38,573
  - AmericanAir: 36,764
  - TMobileHelp: 34,317
  - comcastcares: 33,031
  - British_Airways: 29,361

## Conversation Linking
- Tweets that are replies (in_response_to): 2,017,439 (71.75%)
- Tweets that have replies (response_tweet_id): 1,771,145 (62.99%)